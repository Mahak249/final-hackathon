"""Todo database model."""
from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .user import User


class Todo(SQLModel, table=True):
    """Todo entity representing a task."""

    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex, primary_key=True, max_length=32)
    user_id: str = Field(foreign_key="user.id", ondelete="CASCADE", max_length=32)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to user
    user: "User" = Relationship(back_populates="todos")
