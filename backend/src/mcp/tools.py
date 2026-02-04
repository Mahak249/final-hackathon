from typing import List, Optional
from datetime import datetime, timezone

from sqlmodel import Session, select
from mcp.server.fastmcp import Context

from ..database import engine
from ..models.todo import Todo

from .server import mcp

@mcp.tool()
def create_todo(title: str,
                user_id: str,
                description: Optional[str] = None) -> str:
    """Create a new todo item.

    Args:
        title: The title of the todo.
        user_id: The ID of the user owning the todo.
        description: Optional description.
    """
    with Session(engine) as session:
        todo = Todo(
            title=title,
            description=description,
            user_id=user_id,
        )

        session.add(todo)
        session.commit()
        session.refresh(todo)
        return f"Created todo '{todo.title}' with ID {todo.id}"


@mcp.tool()
def get_todos(user_id: str,
              status: Optional[str] = None,
              search: Optional[str] = None) -> str:
    """Get a list of todos filtering by status.

    Args:
        user_id: The ID of the user.
        status: Filter by 'pending' or 'completed'.
        search: Search text in title or description.
    """
    with Session(engine) as session:
        query = select(Todo).where(Todo.user_id == user_id)

        if status == "completed":
            query = query.where(Todo.completed == True)
        elif status == "pending":
            query = query.where(Todo.completed == False)

        if search:
            query = query.where((Todo.title.contains(search)) | (Todo.description.contains(search)))

        todos = session.exec(query).all()

        if not todos:
            return "No todos found matching criteria."

        # Format as a list string
        output = []
        for t in todos:
            status_str = "[x]" if t.completed else "[ ]"
            output.append(f"{t.id}: {status_str} {t.title}")

        return "\n".join(output)

@mcp.tool()
def update_todo(user_id: str,
                todo_id: str,
                title: Optional[str] = None,
                status: Optional[str] = None,
                completed: Optional[bool] = None) -> str:
    """Update an existing todo item.

    Args:
        user_id: The ID of the user.
        todo_id: The ID of the todo (string).
        title: New title.
        status: 'completed' or 'pending' (alias for completed).
        completed: Boolean for completion status.
    """
    with Session(engine) as session:
        todo = session.get(Todo, todo_id)
        if not todo or todo.user_id != user_id:
            return f"Error: Todo {todo_id} not found."

        if title:
            todo.title = title

        # Handle status alias
        if status == "completed":
            todo.completed = True
        elif status == "pending":
            todo.completed = False

        if completed is not None:
            todo.completed = completed

        todo.updated_at = datetime.now(timezone.utc)
        session.add(todo)
        session.commit()
        return f"Updated todo {todo_id}."

@mcp.tool()
def delete_todo(user_id: str, todo_id: str) -> str:
    """Delete a todo item.

    Args:
        user_id: The ID of the user.
        todo_id: The ID of the todo (string).
    """
    with Session(engine) as session:
        todo = session.get(Todo, todo_id)
        if not todo or todo.user_id != user_id:
            return f"Error: Todo {todo_id} not found."

        session.delete(todo)
        session.commit()
        return f"Deleted todo {todo_id}."
