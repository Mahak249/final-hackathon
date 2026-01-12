# Data Model: Phase I - Todo App

## Task Entity

The Task entity is the sole data model for Phase I.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | int | Yes | Auto-generated | Unique identifier, 1-based, never reused |
| description | str | Yes | N/A | Task text, 1-500 characters, not whitespace-only |
| completed | bool | No | False | Completion status |

### Constraints

1. **ID Uniqueness**: Each task receives a unique ID within the session. IDs are never reused after deletion.
2. **ID Sequencing**: IDs start at 1 and increment by 1 for each new task.
3. **Description Length**: Minimum 1 character, maximum 500 characters.
4. **Description Content**: Must contain at least one non-whitespace character.

### State Model

```
[incomplete] --mark complete--> [complete]
[complete] --mark incomplete--> [incomplete]
```

A task has only two states: incomplete (default) and complete.

### Validation Rules

| Operation | Validation |
|-----------|------------|
| Add Task | description must be 1-500 chars, not whitespace-only |
| Update Task | description must be 1-500 chars, not whitespace-only |
| Mark Complete | task must exist and be incomplete |
| Mark Incomplete | task must exist and be complete |
| Delete Task | task must exist |

### Class Definition (Python)

```python
class Task:
    """Represents a single todo task."""

    def __init__(self, id: int, description: str, completed: bool = False):
        self.id = id
        self.description = description
        self.completed = completed

    def __repr__(self) -> str:
        status = "X" if self.completed else " "
        return f"[{status}] {self.id}. {self.description}"
```

### Storage Model

Tasks are stored in a simple Python list within the TaskService class:

```python
class TaskService:
    def __init__(self):
        self._tasks: list[Task] = []
        self._next_id: int = 1
```

- **List Order**: Tasks are stored in insertion order.
- **Display Order**: Tasks are displayed in insertion order (FIFO).
- **Deletion**: When a task is deleted, it is removed from the list entirely.
