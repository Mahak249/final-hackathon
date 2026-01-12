from typing import Any, Dict, List, Optional
from datetime import datetime
from uuid import uuid4

from sqlmodel import Session, select
from agents.memory.session import Session as AgentSession

from ..models.conversation import Conversation, Message
from ..models.user import User

class PostgresSession(AgentSession):
    def __init__(self, db_session: Session, user_id: str):
        self.db = db_session
        self.user_id = user_id
        self._conversation_id: Optional[str] = None
        self._ensure_conversation()

    def _ensure_conversation(self):
        # Find latest active conversation or create new
        # For simplicity in this implementation, we'll try to get the latest
        # or create a new one if none exists.
        # In a real app, conversation_id might be passed explicitly.
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == self.user_id)
            .order_by(Conversation.updated_at.desc())
        )
        conversation = self.db.exec(stmt).first()

        if not conversation:
            conversation = Conversation(user_id=self.user_id, title="New Conversation")
            self.db.add(conversation)
            self.db.commit()
            self.db.refresh(conversation)

        self._conversation_id = conversation.id

    def add_message(self, message: Dict[str, Any]) -> None:
        """Add a message to the conversation."""
        # Convert SDK message format to DB model
        db_msg = Message(
            conversation_id=self._conversation_id,
            role=message["role"],
            content=message.get("content"),
            tool_calls=message.get("tool_calls"),
            tool_call_id=message.get("tool_call_id"),
            name=message.get("name")
        )
        self.db.add(db_msg)

        # Update conversation timestamp
        conversation = self.db.get(Conversation, self._conversation_id)
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self.db.add(conversation)

        self.db.commit()

    def get_messages(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent messages."""
        # Optimization: Fetch last N messages
        # We need to fetch in descending order to get last N, then sort back to ascending
        stmt = (
            select(Message)
            .where(Message.conversation_id == self._conversation_id)
            .order_by(Message.created_at.desc())
            .limit(limit)
        )

        messages = self.db.exec(stmt).all()
        # Reverse to chronological order
        messages = reversed(messages)

        result = []
        for msg in messages:
            m = {
                "role": msg.role,
                "content": msg.content,
            }
            if msg.tool_calls:
                m["tool_calls"] = msg.tool_calls
            if msg.tool_call_id:
                m["tool_call_id"] = msg.tool_call_id
            if msg.name:
                m["name"] = msg.name
            result.append(m)

        return result

    def set_conversation_id(self, conversation_id: str):
        """Switch context to specific conversation."""
        conversation = self.db.get(Conversation, conversation_id)
        if conversation and conversation.user_id == self.user_id:
            self._conversation_id = conversation.id
        else:
            raise ValueError(f"Conversation {conversation_id} not found for user {self.user_id}")

    @property
    def conversation_id(self) -> str:
        return self._conversation_id or ""
