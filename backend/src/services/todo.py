"""Todo service for todo CRUD operations."""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.todo import Todo
from src.schemas.todo import TodoCreate, TodoUpdate, TodoResponse, TodoListResponse


class TodoService:
    """Service for todo operations."""

    def __init__(self, db: AsyncSession, user_id: str):
        self.db = db
        self.user_id = user_id

    async def get_todos(self) -> List[Todo]:
        """Get all todos for the current user."""
        result = await self.db.execute(
            select(Todo)
            .where(Todo.user_id == self.user_id)
            .order_by(desc(Todo.created_at))
        )
        return list(result.scalars().all())

    async def get_todo(self, todo_id: str) -> Optional[Todo]:
        """Get a specific todo by ID, verifying ownership."""
        result = await self.db.execute(
            select(Todo).where(Todo.id == todo_id)
        )
        todo = result.scalar_one_or_none()
        if todo and todo.user_id == self.user_id:
            return todo
        return None

    async def create_todo(self, todo_data: TodoCreate) -> Todo:
        """Create a new todo for the current user."""
        todo = Todo(
            user_id=self.user_id,
            title=todo_data.title,
            description=todo_data.description,
        )
        self.db.add(todo)
        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def update_todo(self, todo_id: str, todo_data: TodoUpdate) -> Optional[Todo]:
        """Update a todo, verifying ownership."""
        todo = await self.get_todo(todo_id)
        if not todo:
            return None

        # Update fields
        update_data = todo_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(todo, field, value)

        todo.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(todo)
        return todo

    async def delete_todo(self, todo_id: str) -> bool:
        """Delete a todo, verifying ownership."""
        todo = await self.get_todo(todo_id)
        if not todo:
            return False

        await self.db.delete(todo)
        await self.db.commit()
        return True

    async def toggle_todo(self, todo_id: str, completed: bool) -> Optional[Todo]:
        """Toggle todo completion status."""
        todo = await self.get_todo(todo_id)
        if not todo:
            return None

        todo.completed = completed
        todo.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(todo)
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
