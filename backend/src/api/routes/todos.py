"""Todo API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.auth import AuthService
from src.services.todo import TodoService
from src.schemas.todo import TodoCreate, TodoUpdate, TodoToggle, TodoResponse, TodoListResponse
from src.api.routes.auth import extract_token_from_request


router = APIRouter(prefix="/api/todos", tags=["Todos"])


def get_current_user_id(request: Request, db: Session) -> str:
    """Get the current authenticated user's ID from the request."""
    token = extract_token_from_request(request)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService(db)
    user_id = auth_service.verify_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id


@router.get("", response_model=TodoListResponse)
async def list_todos(
    request: Request,
    db: Session = Depends(get_db),
):
    """Get all todos for the current user."""
    user_id = get_current_user_id(request, db)
    service = TodoService(db, user_id)
    todos = service.get_todos()
    return service.to_list_response(todos)


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Get a specific todo by ID."""
    user_id = get_current_user_id(request, db)
    service = TodoService(db, user_id)
    todo = service.get_todo(todo_id)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    return service.to_response(todo)


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo_data: TodoCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Create a new todo."""
    user_id = get_current_user_id(request, db)
    service = TodoService(db, user_id)
    todo = service.create_todo(todo_data)
    return service.to_response(todo)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo_data: TodoUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Update an existing todo."""
    user_id = get_current_user_id(request, db)
    service = TodoService(db, user_id)
    todo = service.update_todo(todo_id, todo_data)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    return service.to_response(todo)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Delete a todo."""
    user_id = get_current_user_id(request, db)
    service = TodoService(db, user_id)

    if not service.delete_todo(todo_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )


@router.patch("/{todo_id}/toggle", response_model=TodoResponse)
async def toggle_todo(
    todo_id: str,
    toggle_data: TodoToggle,
    request: Request,
    db: Session = Depends(get_db),
):
    """Toggle todo completion status."""
    user_id = get_current_user_id(request, db)
    service = TodoService(db, user_id)
    todo = service.toggle_todo(todo_id, toggle_data.completed)

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found",
        )

    return service.to_response(todo)
