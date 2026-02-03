# Set Groq as the provider BEFORE any SDK imports
import os
# API key should be set via environment variable GROQ_API_KEY
os.environ["OPENAI_API_KEY"] = os.getenv("GROQ_API_KEY", "")
os.environ["OPENAI_BASE_URL"] = "https://api.groq.com/openai/v1"

from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from agents import Runner

from src.database import get_async_db
from src.api.deps import get_current_user_from_cookie
from src.models.user import User
from src.agents.todo_agent import get_todo_agent
from src.agents.storage import PostgresSession

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Process a chat message using the AI Agent.
    """
    # 1. Initialize Storage Adapter
    # We pass the db session and user_id. The adapter handles conversation init.
    storage = PostgresSession(db_session=db, user_id=current_user.id)

    # If conversation_id provided, ensure valid context
    if request.conversation_id:
        try:
            storage.set_conversation_id(request.conversation_id)
        except ValueError:
            raise HTTPException(status_code=404, detail="Conversation not found")

    # 2. Initialize Agent
    agent = get_todo_agent()

    # 3. Create context for tools
    # Important: We must inject user_id into the tool execution context safely
    # The OpenAI Agents SDK doesn't natively propagate context values to tools unless
    # we bind them or use a Context object.
    # The SDK's Runner.run_async allows passing `context_variables`.
    ctx_vars = {"user_id": current_user.id}

    # 4. Run Agent using Runner.run() for async execution
    try:
        result = await Runner.run(
            starting_agent=agent,
            input=request.message,
        )
    except Exception as e:
        # Log error in real app
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        response=result.final_content or "I processed your request.",
        conversation_id=storage.conversation_id
    )
