from typing import List, Optional
from datetime import datetime

from sqlmodel import Session, select
from mcp.server.fastmcp import Context

from ..database import engine
from ..models.todo import Todo

from .server import mcp

@mcp.tool()
def create_todo(title: str,
                user_id: str,
                description: Optional[str] = None,
                priority: str = "medium",
                due_date: Optional[str] = None) -> str:
    """Create a new todo item.

    Args:
        title: The title of the todo.
        user_id: The ID of the user owning the todo.
        description: Optional description.
        priority: Priority level (low, medium, high).
        due_date: Due date in ISO format (YYYY-MM-DD).
    """
    with Session(engine) as session:
        # Pydantic validation handles parsing, but we need to ensure date format if string
        parsed_date = None
        if due_date:
            try:
                parsed_date = datetime.fromisoformat(due_date)
            except ValueError:
                return f"Error: Invalid date format '{due_date}'. Use YYYY-MM-DD."

        todo = Todo(
            title=title,
            description=description,
            priority=priority,
            user_id=user_id,
        )
        if parsed_date:
            todo.due_date = parsed_date

        session.add(todo)
        session.commit()
        session.refresh(todo)
        return f"Created todo '{todo.title}' with ID {todo.id}"


@mcp.tool()
def get_todos(user_id: str,
              status: Optional[str] = None,
              priority: Optional[str] = None,
              search: Optional[str] = None) -> str:
    """Get a list of todos filtering by status or priority.

    Args:
        user_id: The ID of the user.
        status: Filter by 'pending' or 'completed'.
        priority: Filter by 'low', 'medium', 'high'.
        search: Search text in title or description.
    """
    with Session(engine) as session:
        query = select(Todo).where(Todo.user_id == user_id)

        if status == "completed":
            query = query.where(Todo.is_completed == True)
        elif status == "pending":
            query = query.where(Todo.is_completed == False)

        if priority:
            query = query.where(Todo.priority == priority)

        if search:
            query = query.where((Todo.title.contains(search)) | (Todo.description.contains(search)))

        todos = session.exec(query).all()

        if not todos:
            return "No todos found matching criteria."

        # Format as a list string
        output = []
        for t in todos:
            status_str = "[x]" if t.is_completed else "[ ]"
            output.append(f"{t.id}: {status_str} {t.title} ({t.priority})")

        return "\n".join(output)

@mcp.tool()
def update_todo(user_id: str,
                todo_id: int,
                title: Optional[str] = None,
                status: Optional[str] = None,
                priority: Optional[str] = None,
                is_completed: Optional[bool] = None) -> str:
    """Update an existing todo item.

    Args:
        user_id: The ID of the user.
        todo_id: The numeric ID of the todo.
        title: New title.
        status: 'completed' or 'pending' (alias for is_completed).
        priority: New priority.
        is_completed: Boolean for completion status.
    """
    with Session(engine) as session:
        todo = session.get(Todo, todo_id)
        if not todo or todo.user_id != user_id:
            return f"Error: Todo {todo_id} not found."

        if title:
            todo.title = title
        if priority:
            todo.priority = priority

        # Handle status alias
        if status == "completed":
            todo.is_completed = True
        elif status == "pending":
            todo.is_completed = False

        if is_completed is not None:
            todo.is_completed = is_completed

        todo.updated_at = datetime.utcnow()
        session.add(todo)
        session.commit()
        return f"Updated todo {todo_id}."

@mcp.tool()
def delete_todo(user_id: str, todo_id: int) -> str:
    """Delete a todo item.

    Args:
        user_id: The ID of the user.
        todo_id: The numeric ID of the todo.
    """
    with Session(engine) as session:
        todo = session.get(Todo, todo_id)
        if not todo or todo.user_id != user_id:
            return f"Error: Todo {todo_id} not found."

        session.delete(todo)
        session.commit()
        return f"Deleted todo {todo_id}."
