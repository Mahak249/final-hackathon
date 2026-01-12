from datetime import datetime
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from uuid import uuid4

from sqlmodel import Field, Relationship, SQLModel, Column
from sqlalchemy import JSON, Text

if TYPE_CHECKING:
    from .user import User

class Conversation(SQLModel, table=True):
    """Represents a conversation thread."""
    id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, max_length=32)
    user_id: str = Field(foreign_key="user.id", index=True, max_length=32)
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="conversations")
    messages: List["Message"] = Relationship(back_populates="conversation", sa_relationship_kwargs={"cascade": "all, delete"})


class Message(SQLModel, table=True):
    """Represents a single message in a conversation."""
    id: str = Field(default_factory=lambda: uuid4().hex, primary_key=True, max_length=32)
    conversation_id: str = Field(foreign_key="conversation.id", index=True, max_length=32)

    # core message fields
    role: str = Field(max_length=20)  # user, assistant, system, tool
    content: Optional[str] = Field(default=None, sa_column=Column(Text))

    # tool handling (OpenAI/Anthropic style schema)
    tool_calls: Optional[List[Dict[str, Any]]] = Field(default=None, sa_column=Column(JSON))

    # For tool results
    tool_call_id: Optional[str] = Field(default=None, max_length=100, index=True)
    name: Optional[str] = Field(default=None, max_length=100)

    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")
