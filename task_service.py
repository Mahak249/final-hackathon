"""Task service for managing todo tasks in memory."""

from typing import Optional

from task import Task


class TaskNotFoundError(ValueError):
    """Raised when a task ID is not found."""

    def __init__(self, task_id: int):
        """Initialize error with task ID.

        Args:
            task_id: The ID that was not found
        """
        self.task_id = task_id
        super().__init__(f"Task with ID {task_id} not found.")


class TaskAlreadyCompleteError(ValueError):
    """Raised when marking a complete task as complete."""

    def __init__(self, task_id: int):
        """Initialize error with task ID.

        Args:
            task_id: The ID of the already complete task
        """
        self.task_id = task_id
        super().__init__(f"Task {task_id} is already complete.")


class TaskAlreadyIncompleteError(ValueError):
    """Raised when marking an incomplete task as incomplete."""

    def __init__(self, task_id: int):
        """Initialize error with task ID.

        Args:
            task_id: The ID of the already incomplete task
        """
        self.task_id = task_id
        super().__init__(f"Task {task_id} is already incomplete.")


class EmptyTaskDescriptionError(ValueError):
    """Raised when task description is empty or whitespace-only."""

    def __init__(self):
        """Initialize error."""
        super().__init__("Task description cannot be empty.")


class TaskService:
    """Service for managing tasks in memory."""

    MAX_DESCRIPTION_LENGTH = 500

    def __init__(self):
        """Initialize task service with empty task list."""
        self._tasks: list[Task] = []
        self._next_id: int = 1

    def _validate_description(self, description: str) -> None:
        """Validate task description.

        Args:
            description: Description to validate

        Raises:
            EmptyTaskDescriptionError: If description is empty or whitespace-only
            ValueError: If description exceeds max length
        """
        if not description or not description.strip():
            raise EmptyTaskDescriptionError()
        if len(description) > self.MAX_DESCRIPTION_LENGTH:
            raise ValueError(
                f"Task description must be {self.MAX_DESCRIPTION_LENGTH} characters or less."
            )

    def _find_task(self, task_id: int) -> Optional[Task]:
        """Find task by ID.

        Args:
            task_id: Task ID to find

        Returns:
            Task if found, None otherwise
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def add_task(self, description: str) -> Task:
        """Add a new task.

        Args:
            description: Task description (1-500 chars, non-whitespace)

        Returns:
            The created Task

        Raises:
            EmptyTaskDescriptionError: If description is empty or whitespace-only
            ValueError: If description exceeds max length
        """
        self._validate_description(description)
        task = Task(id=self._next_id, description=description.strip())
        self._tasks.append(task)
        self._next_id += 1
        return task

    def list_tasks(self) -> list[Task]:
        """List all tasks.

        Returns:
            List of all tasks in insertion order
        """
        return list(self._tasks)

    def update_task(self, task_id: int, description: str) -> Task:
        """Update task description.

        Args:
            task_id: ID of task to update
            description: New description (1-500 chars, non-whitespace)

        Returns:
            The updated Task

        Raises:
            TaskNotFoundError: If task_id not found
            EmptyTaskDescriptionError: If description is empty or whitespace-only
            ValueError: If description exceeds max length
        """
        self._validate_description(description)
        task = self._find_task(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        task.description = description.strip()
        return task

    def delete_task(self, task_id: int) -> None:
        """Delete a task.

        Args:
            task_id: ID of task to delete

        Raises:
            TaskNotFoundError: If task_id not found
        """
        task = self._find_task(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        self._tasks.remove(task)

    def mark_complete(self, task_id: int) -> Task:
        """Mark task as complete.

        Args:
            task_id: ID of task to mark complete

        Returns:
            The updated Task

        Raises:
            TaskNotFoundError: If task_id not found
            TaskAlreadyCompleteError: If task is already complete
        """
        task = self._find_task(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        if task.completed:
            raise TaskAlreadyCompleteError(task_id)
        task.completed = True
        return task

    def mark_incomplete(self, task_id: int) -> Task:
        """Mark task as incomplete.

        Args:
            task_id: ID of task to mark incomplete

        Returns:
            The updated Task

        Raises:
            TaskNotFoundError: If task_id not found
            TaskAlreadyIncompleteError: If task is already incomplete
        """
        task = self._find_task(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        if not task.completed:
            raise TaskAlreadyIncompleteError(task_id)
        task.completed = False
        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """Get task by ID.

        Args:
            task_id: Task ID to find

        Returns:
            Task if found, None otherwise
        """
        return self._find_task(task_id)
