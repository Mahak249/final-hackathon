"""
Tool definitions for the TaskFlow AI agent.

Each tool maps to a FastAPI backend endpoint via TodoService.
The LLM sees JSON schemas and automatically decides which tool to call.
"""
import json
from dataclasses import dataclass
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from src.services.todo import TodoService
from src.schemas.todo import TodoCreate, TodoUpdate


# ── Context for tool execution ──────────────────────────────────────────────

@dataclass
class ToolContext:
    """Carries user_id and db session to every tool call."""
    user_id: str
    db: AsyncSession


# ── Tool JSON Schemas (sent to the LLM) ────────────────────────────────────

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task/todo for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "The title of the task (e.g. 'Buy groceries').",
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional longer description of the task.",
                    },
                },
                "required": ["title"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "delete_task",
            "description": "Delete a task/todo by its ID.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ID of the task to delete.",
                    },
                },
                "required": ["id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "edit_task",
            "description": "Edit/update an existing task's title or description.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ID of the task to edit.",
                    },
                    "title": {
                        "type": "string",
                        "description": "New title for the task.",
                    },
                    "description": {
                        "type": "string",
                        "description": "New description for the task.",
                    },
                },
                "required": ["id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_tasks",
            "description": "List all tasks/todos for the user. Optionally filter by search text.",
            "parameters": {
                "type": "object",
                "properties": {
                    "search": {
                        "type": "string",
                        "description": "Optional text to filter tasks by title.",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "toggle_task",
            "description": "Mark a task as complete or incomplete.",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "description": "The ID of the task to toggle.",
                    },
                    "completed": {
                        "type": "boolean",
                        "description": "True to mark complete, False to mark incomplete.",
                    },
                },
                "required": ["id", "completed"],
            },
        },
    },
]


# ── Tool Implementations ────────────────────────────────────────────────────

async def add_task(ctx: ToolContext, title: str, description: Optional[str] = None) -> str:
    """Create a new task via TodoService."""
    service = TodoService(ctx.db, ctx.user_id)
    todo = await service.create_todo(TodoCreate(title=title, description=description))
    return json.dumps({
        "status": "success",
        "message": f"Created task '{todo.title}'",
        "task": {"id": todo.id, "title": todo.title, "completed": todo.completed},
    })


async def delete_task(ctx: ToolContext, id: str) -> str:
    """Delete a task via TodoService."""
    service = TodoService(ctx.db, ctx.user_id)
    deleted = await service.delete_todo(id)
    if not deleted:
        return json.dumps({"status": "error", "message": f"Task with ID '{id}' not found."})
    return json.dumps({"status": "success", "message": f"Deleted task {id}."})


async def edit_task(
    ctx: ToolContext,
    id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> str:
    """Edit a task via TodoService."""
    service = TodoService(ctx.db, ctx.user_id)

    update_data = {}
    if title is not None:
        update_data["title"] = title
    if description is not None:
        update_data["description"] = description

    if not update_data:
        return json.dumps({"status": "error", "message": "Nothing to update — provide title or description."})

    todo = await service.update_todo(id, TodoUpdate(**update_data))
    if not todo:
        return json.dumps({"status": "error", "message": f"Task with ID '{id}' not found."})

    return json.dumps({
        "status": "success",
        "message": f"Updated task '{todo.title}'",
        "task": {"id": todo.id, "title": todo.title, "completed": todo.completed},
    })


async def list_tasks(ctx: ToolContext, search: Optional[str] = None) -> str:
    """List all tasks via TodoService."""
    service = TodoService(ctx.db, ctx.user_id)
    todos = await service.get_todos()

    if search:
        lower = search.lower()
        todos = [t for t in todos if lower in (t.title or "").lower()
                 or lower in (t.description or "").lower()]

    if not todos:
        msg = "You have no tasks." if not search else f"No tasks matching '{search}'."
        return json.dumps({"status": "success", "message": msg, "tasks": []})

    tasks = []
    for t in todos:
        tasks.append({
            "id": t.id,
            "title": t.title,
            "completed": t.completed,
            "description": t.description or "",
        })

    return json.dumps({"status": "success", "tasks": tasks, "total": len(tasks)})


async def toggle_task(ctx: ToolContext, id: str, completed: bool) -> str:
    """Toggle task completion via TodoService."""
    service = TodoService(ctx.db, ctx.user_id)
    todo = await service.toggle_todo(id, completed)
    if not todo:
        return json.dumps({"status": "error", "message": f"Task with ID '{id}' not found."})

    status_text = "completed" if todo.completed else "incomplete"
    return json.dumps({
        "status": "success",
        "message": f"Marked task '{todo.title}' as {status_text}.",
        "task": {"id": todo.id, "title": todo.title, "completed": todo.completed},
    })


# ── Tool Registry ───────────────────────────────────────────────────────────

TOOL_FUNCTIONS = {
    "add_task": add_task,
    "delete_task": delete_task,
    "edit_task": edit_task,
    "list_tasks": list_tasks,
    "toggle_task": toggle_task,
}

MUTATING_TOOLS = {"add_task", "delete_task", "edit_task", "toggle_task"}


async def execute_tool(ctx: ToolContext, tool_name: str, arguments: dict[str, Any]) -> str:
    """
    Execute a tool by name with the given arguments.
    This is the single dispatch point — the LLM picks the tool,
    and this function runs it against the real database.
    """
    func = TOOL_FUNCTIONS.get(tool_name)
    if not func:
        return json.dumps({"status": "error", "message": f"Unknown tool: {tool_name}"})

    return await func(ctx, **arguments)
