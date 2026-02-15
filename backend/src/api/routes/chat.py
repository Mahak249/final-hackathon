"""Chat route — forwards user messages to the tool-calling AI agent."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_async_db
from src.api.deps import get_current_user_from_cookie
from src.models.user import User
from src.agents.todo_agent import run_agent

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    task_mutated: bool = False
    tool_calls: list[dict] = []


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    current_user: User = Depends(get_current_user_from_cookie),
    db: AsyncSession = Depends(get_async_db),
):
    """
    Process a chat message through the AI agent with function calling.

    The agent automatically decides which tools to call (add_task, delete_task,
    edit_task, list_tasks, toggle_task) based on the user's message.
    """
    try:
        result = await run_agent(
            message=request.message,
            user_id=current_user.id,
            db=db,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        response=result.response,
        conversation_id=request.conversation_id or "default",
        task_mutated=result.task_mutated,
        tool_calls=result.tool_calls_made,
    )
