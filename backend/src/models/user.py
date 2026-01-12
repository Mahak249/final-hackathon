"""User database model."""
from datetime import datetime
from typing import List, TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .todo import Todo
    from .conversation import Conversation


class User(SQLModel, table=True):
    """User entity for authentication."""

    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex, primary_key=True, max_length=32)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship to todos
    todos: List["Todo"] = Relationship(back_populates="user", cascade_delete=True)

    # Relationship to conversations
    conversations: List["Conversation"] = Relationship(back_populates="user", cascade_delete=True)

