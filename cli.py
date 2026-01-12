"""Console interface for Phase I Todo App."""

import sys

from task_service import (
    EmptyTaskDescriptionError,
    TaskAlreadyCompleteError,
    TaskAlreadyIncompleteError,
    TaskNotFoundError,
    TaskService,
)


class CLI:
    """Command-line interface for the todo application."""

    MENU = """=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7): """

    def __init__(self):
        """Initialize CLI with a TaskService instance."""
        self.service = TaskService()

    def run(self):
        """Run the main application loop."""
        while True:
            try:
                choice = input(self.MENU).strip()
                if choice == "1":
                    self._handle_add()
                elif choice == "2":
                    self._handle_list()
                elif choice == "3":
                    self._handle_update()
                elif choice == "4":
                    self._handle_delete()
                elif choice == "5":
                    self._handle_complete()
                elif choice == "6":
                    self._handle_incomplete()
                elif choice == "7":
                    print("Goodbye!")
                    break
                else:
                    print("Error: Invalid choice. Please enter a number 1-7.")
            except EOFError:
                print("\nGoodbye!")
                break
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break

    def _get_task_id(self, prompt: str) -> int | None:
        """Get a valid task ID from user input.

        Args:
            prompt: Prompt to display

        Returns:
            Task ID as integer, or None if invalid input

        """
        try:
            return int(input(prompt).strip())
        except ValueError:
            print("Error: Please enter a valid number.")
            return None

    def _get_description(self, prompt: str) -> str | None:
        """Get a non-empty description from user input.

        Args:
            prompt: Prompt to display

        Returns:
            Description string, or None if empty/whitespace
        """
        description = input(prompt).strip()
        if not description:
            print("Error: Task description cannot be empty.")
            return None
        if not description or not description.strip():
            print("Error: Task description cannot be whitespace only.")
            return None
        return description

    def _handle_add(self):
        """Handle add task command."""
        description = self._get_description("Enter task description: ")
        if description is None:
            return
        try:
            task = self.service.add_task(description)
            print(f"Task added! (ID: {task.id})")
        except EmptyTaskDescriptionError:
            print("Error: Task description cannot be empty.")
        except ValueError as e:
            print(f"Error: {e}")

    def _handle_list(self):
        """Handle list tasks command."""
        tasks = self.service.list_tasks()
        if not tasks:
            print("No tasks yet.")
        else:
            for task in tasks:
                print(repr(task))

    def _handle_update(self):
        """Handle update task command."""
        task_id = self._get_task_id("Enter task ID to update: ")
        if task_id is None:
            return
        description = self._get_description("Enter new description: ")
        if description is None:
            return
        try:
            self.service.update_task(task_id, description)
            print(f"Task {task_id} updated!")
        except TaskNotFoundError:
            print(f"Error: Task with ID {task_id} not found.")
        except EmptyTaskDescriptionError:
            print("Error: Task description cannot be empty.")

    def _handle_delete(self):
        """Handle delete task command."""
        task_id = self._get_task_id("Enter task ID to delete: ")
        if task_id is None:
            return
        try:
            self.service.delete_task(task_id)
            print(f"Task {task_id} deleted!")
        except TaskNotFoundError:
            print(f"Error: Task with ID {task_id} not found.")

    def _handle_complete(self):
        """Handle mark complete command."""
        task_id = self._get_task_id("Enter task ID to mark complete: ")
        if task_id is None:
            return
        try:
            self.service.mark_complete(task_id)
            print(f"Task {task_id} marked as complete!")
        except TaskNotFoundError:
            print(f"Error: Task with ID {task_id} not found.")
        except TaskAlreadyCompleteError:
            print(f"Error: Task {task_id} is already complete.")

    def _handle_incomplete(self):
        """Handle mark incomplete command."""
        task_id = self._get_task_id("Enter task ID to mark incomplete: ")
        if task_id is None:
            return
        try:
            self.service.mark_incomplete(task_id)
            print(f"Task {task_id} marked as incomplete!")
        except TaskNotFoundError:
            print(f"Error: Task with ID {task_id} not found.")
        except TaskAlreadyIncompleteError:
            print(f"Error: Task {task_id} is already incomplete.")
