"""Todo service for todo CRUD operations."""
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from src.models.todo import Todo
from src.schemas.todo import TodoCreate, TodoUpdate, TodoResponse, TodoListResponse


class TodoService:
    """Service for todo operations."""

    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user_id = user_id

    def get_todos(self) -> List[Todo]:
        """Get all todos for the current user."""
        return (
            self.db.query(Todo)
            .filter(Todo.user_id == self.user_id)
            .order_by(Todo.created_at.desc())
            .all()
        )

    def get_todo(self, todo_id: str) -> Optional[Todo]:
        """Get a specific todo by ID, verifying ownership."""
        todo = self.db.query(Todo).filter(Todo.id == todo_id).first()
        if todo and todo.user_id == self.user_id:
            return todo
        return None

    def create_todo(self, todo_data: TodoCreate) -> Todo:
        """Create a new todo for the current user."""
        todo = Todo(
            user_id=self.user_id,
            title=todo_data.title,
            description=todo_data.description,
        )
        self.db.add(todo)
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def update_todo(self, todo_id: str, todo_data: TodoUpdate) -> Optional[Todo]:
        """Update a todo, verifying ownership."""
        todo = self.get_todo(todo_id)
        if not todo:
            return None

        # Update fields
        update_data = todo_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(todo, field, value)

        todo.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def delete_todo(self, todo_id: str) -> bool:
        """Delete a todo, verifying ownership."""
        todo = self.get_todo(todo_id)
        if not todo:
            return False

        self.db.delete(todo)
        self.db.commit()
        return True

    def toggle_todo(self, todo_id: str, completed: bool) -> Optional[Todo]:
        """Toggle todo completion status."""
        todo = self.get_todo(todo_id)
        if not todo:
            return None

        todo.completed = completed
        todo.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(todo)
        return todo

    def to_response(self, todo: Todo) -> TodoResponse:
        """Convert Todo model to TodoResponse schema."""
        return TodoResponse(
            id=todo.id,
            user_id=todo.user_id,
            title=todo.title,
            description=todo.description,
            completed=todo.completed,
            created_at=todo.created_at,
            updated_at=todo.updated_at,
        )

    def to_list_response(self, todos: List[Todo]) -> TodoListResponse:
        """Convert list of todos to TodoListResponse."""
        return TodoListResponse(
            todos=[self.to_response(t) for t in todos],
            total=len(todos),
        )
