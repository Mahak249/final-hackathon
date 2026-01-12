"""Database connection and session management."""
import os
from typing import Generator

from sqlmodel import create_engine, Session

# Get database URL from environment (default to SQLite for local development)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./todo.db"
)

# Create SQLModel engine
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, echo=False)


def get_db() -> Generator[Session, None, None]:
    """Dependency that provides a database session."""
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()


def init_db():
    """Initialize database tables."""
    from src.models.user import User
    from src.models.todo import Todo
    from sqlmodel import SQLModel

    SQLModel.metadata.create_all(engine)
