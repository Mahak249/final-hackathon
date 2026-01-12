"""Unit tests for TaskService."""

import pytest

from task import Task
from task_service import (
    EmptyTaskDescriptionError,
    TaskAlreadyCompleteError,
    TaskAlreadyIncompleteError,
    TaskNotFoundError,
    TaskService,
)


class TestTaskServiceInit:
    """Tests for TaskService initialization."""

    def test_service_starts_empty(self):
        """Test that new TaskService has empty task list."""
        service = TaskService()
        assert service.list_tasks() == []

    def test_first_task_gets_id_1(self):
        """Test that first task gets ID 1."""
        service = TaskService()
        task = service.add_task("First task")
        assert task.id == 1


class TestTaskServiceAdd:
    """Tests for TaskService.add_task method."""

    def test_add_single_task(self):
        """Test adding a single task."""
        service = TaskService()
        task = service.add_task("Buy groceries")
        assert task.description == "Buy groceries"
        assert task.completed is False

    def test_add_multiple_tasks_increment_ids(self):
        """Test that task IDs increment correctly."""
        service = TaskService()
        task1 = service.add_task("First")
        task2 = service.add_task("Second")
        task3 = service.add_task("Third")
        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3

    def test_add_task_strips_whitespace(self):
        """Test that task description whitespace is stripped."""
        service = TaskService()
        task = service.add_task("  Buy groceries  ")
        assert task.description == "Buy groceries"

    def test_add_empty_description_raises_error(self):
        """Test that empty description raises EmptyTaskDescriptionError."""
        service = TaskService()
        with pytest.raises(EmptyTaskDescriptionError):
            service.add_task("")

    def test_add_whitespace_only_raises_error(self):
        """Test that whitespace-only description raises error."""
        service = TaskService()
        with pytest.raises(EmptyTaskDescriptionError):
            service.add_task("   ")

    def test_add_very_long_description_raises_error(self):
        """Test that description exceeding max length raises error."""
        service = TaskService()
        long_desc = "a" * 501
        with pytest.raises(ValueError) as exc_info:
            service.add_task(long_desc)
        assert "500" in str(exc_info.value)


class TestTaskServiceList:
    """Tests for TaskService.list_tasks method."""

    def test_list_empty(self):
        """Test listing when no tasks exist."""
        service = TaskService()
        assert service.list_tasks() == []

    def test_list_returns_all_tasks(self):
        """Test that list_tasks returns all tasks."""
        service = TaskService()
        service.add_task("Task 1")
        service.add_task("Task 2")
        service.add_task("Task 3")
        tasks = service.list_tasks()
        assert len(tasks) == 3

    def test_list_returns_copy(self):
        """Test that list_tasks returns a copy, not the internal list."""
        service = TaskService()
        service.add_task("Task 1")
        tasks = service.list_tasks()
        tasks.clear()  # Modify the returned list
        assert len(service.list_tasks()) == 1  # Original unchanged


class TestTaskServiceUpdate:
    """Tests for TaskService.update_task method."""

    def test_update_task_description(self):
        """Test updating a task's description."""
        service = TaskService()
        service.add_task("Original")
        service.update_task(1, "Updated")
        assert service.get_task(1).description == "Updated"

    def test_update_nonexistent_task_raises_error(self):
        """Test that updating nonexistent task raises TaskNotFoundError."""
        service = TaskService()
        with pytest.raises(TaskNotFoundError):
            service.update_task(1, "New description")

    def test_update_with_empty_description_raises_error(self):
        """Test that updating with empty description raises error."""
        service = TaskService()
        service.add_task("Task")
        with pytest.raises(EmptyTaskDescriptionError):
            service.update_task(1, "")

    def test_update_with_whitespace_raises_error(self):
        """Test that updating with whitespace raises error."""
        service = TaskService()
        service.add_task("Task")
        with pytest.raises(EmptyTaskDescriptionError):
            service.update_task(1, "   ")


class TestTaskServiceDelete:
    """Tests for TaskService.delete_task method."""

    def test_delete_task(self):
        """Test deleting a task."""
        service = TaskService()
        service.add_task("Task 1")
        service.add_task("Task 2")
        service.delete_task(1)
        assert len(service.list_tasks()) == 1
        assert service.get_task(2) is not None

    def test_delete_nonexistent_task_raises_error(self):
        """Test that deleting nonexistent task raises TaskNotFoundError."""
        service = TaskService()
        with pytest.raises(TaskNotFoundError):
            service.delete_task(1)

    def test_delete_shifts_remaining_ids(self):
        """Test that deleting doesn't affect other task IDs."""
        service = TaskService()
        service.add_task("Task 1")
        service.add_task("Task 2")
        service.add_task("Task 3")
        service.delete_task(2)
        assert service.get_task(1).id == 1
        assert service.get_task(3).id == 3


class TestTaskServiceMarkComplete:
    """Tests for TaskService.mark_complete method."""

    def test_mark_task_complete(self):
        """Test marking a task as complete."""
        service = TaskService()
        service.add_task("Task")
        service.mark_complete(1)
        assert service.get_task(1).completed is True

    def test_mark_already_complete_raises_error(self):
        """Test that marking already complete task raises error."""
        service = TaskService()
        service.add_task("Task")
        service.mark_complete(1)
        with pytest.raises(TaskAlreadyCompleteError):
            service.mark_complete(1)

    def test_mark_nonexistent_complete_raises_error(self):
        """Test that marking nonexistent task raises error."""
        service = TaskService()
        with pytest.raises(TaskNotFoundError):
            service.mark_complete(1)


class TestTaskServiceMarkIncomplete:
    """Tests for TaskService.mark_incomplete method."""

    def test_mark_task_incomplete(self):
        """Test marking a complete task as incomplete."""
        service = TaskService()
        service.add_task("Task")
        service.mark_complete(1)
        service.mark_incomplete(1)
        assert service.get_task(1).completed is False

    def test_mark_already_incomplete_raises_error(self):
        """Test that marking already incomplete task raises error."""
        service = TaskService()
        service.add_task("Task")
        with pytest.raises(TaskAlreadyIncompleteError):
            service.mark_incomplete(1)

    def test_mark_nonexistent_incomplete_raises_error(self):
        """Test that marking nonexistent task raises error."""
        service = TaskService()
        with pytest.raises(TaskNotFoundError):
            service.mark_incomplete(1)


class TestTaskServiceGetTask:
    """Tests for TaskService.get_task method."""

    def test_get_existing_task(self):
        """Test getting an existing task."""
        service = TaskService()
        service.add_task("Task")
        task = service.get_task(1)
        assert task is not None
        assert task.id == 1

    def test_get_nonexistent_task(self):
        """Test getting a nonexistent task returns None."""
        service = TaskService()
        task = service.get_task(1)
        assert task is None
