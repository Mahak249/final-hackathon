"""Task data model for Phase I Todo App."""


class Task:
    """Represents a single todo task."""

    def __init__(self, id: int, description: str, completed: bool = False):
        """Initialize a Task.

        Args:
            id: Unique task identifier (1-based)
            description: Task text (1-500 chars, non-whitespace)
            completed: Completion status (default False)
        """
        self.id = id
        self.description = description
        self.completed = completed

    def __repr__(self) -> str:
        """Return string representation for display.

        Returns:
            Task display format: "[ ] ID. description" or "[X] ID. description"
        """
        status = "X" if self.completed else " "
        return f"[{status}] {self.id}. {self.description}"

    def __eq__(self, other: object) -> bool:
        """Check equality based on task attributes.

        Args:
            other: Object to compare with

        Returns:
            True if other is Task with same id, description, and completed status
        """
        if not isinstance(other, Task):
            return False
        return (
            self.id == other.id
            and self.description == other.description
            and self.completed == other.completed
        )
