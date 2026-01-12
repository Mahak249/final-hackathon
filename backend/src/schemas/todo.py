"""Todo Pydantic schemas for API request/response."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    """Schema for creating a new todo."""

    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=10000)


class TodoUpdate(BaseModel):
    """Schema for updating a todo."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=10000)


class TodoToggle(BaseModel):
    """Schema for toggling todo completion."""

    completed: bool


class TodoResponse(BaseModel):
    """Schema for todo response."""

    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TodoListResponse(BaseModel):
    """Schema for todo list response."""

    todos: list[TodoResponse]
    total: int
