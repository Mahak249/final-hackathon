"""Chat route — forwards user messages to the tool-calling AI agent."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_async_db
from src.models.user import User
from src.services.auth import AuthService
from src.agents.todo_agent import run_agent

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    token: Optional[str] = None  # Accept token in body (HF Spaces strips Auth headers)


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    task_mutated: bool = False
    tool_calls: list[dict] = []


async def get_user_from_request(
    request_body: "ChatRequest",
    request: Request,
    db: AsyncSession,
) -> User:
    """Extract user from body token, cookie, or Authorization header."""
    token = request_body.token

    if not token:
        token = request.cookies.get("access_token")

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    auth_service = AuthService(db)
    user_id = auth_service.verify_token(token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request_body: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_async_db),
):
    """
    Process a chat message through the AI agent with function calling.

    The agent automatically decides which tools to call (add_task, delete_task,
    edit_task, list_tasks, toggle_task) based on the user's message.
    """
    current_user = await get_user_from_request(request_body, request, db)

    try:
        result = await run_agent(
            message=request_body.message,
            user_id=current_user.id,
            db=db,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        response=result.response,
        conversation_id=request_body.conversation_id or "default",
        task_mutated=result.task_mutated,
        tool_calls=result.tool_calls_made,
    )
