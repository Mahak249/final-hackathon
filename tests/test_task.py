"""Unit tests for Task model."""

import pytest

from task import Task


class TestTaskInit:
    """Tests for Task initialization."""

    def test_task_creation_with_defaults(self):
        """Test creating a task with default completed=False."""
        task = Task(id=1, description="Buy groceries")
        assert task.id == 1
        assert task.description == "Buy groceries"
        assert task.completed is False

    def test_task_creation_with_completed_true(self):
        """Test creating a completed task."""
        task = Task(id=1, description="Buy groceries", completed=True)
        assert task.id == 1
        assert task.description == "Buy groceries"
        assert task.completed is True

    def test_task_creation_with_completed_false(self):
        """Test creating an incomplete task explicitly."""
        task = Task(id=1, description="Buy groceries", completed=False)
        assert task.completed is False


class TestTaskRepr:
    """Tests for Task __repr__ method."""

    def test_repr_incomplete_task(self):
        """Test string representation of incomplete task."""
        task = Task(id=1, description="Buy groceries")
        assert repr(task) == "[ ] 1. Buy groceries"

    def test_repr_complete_task(self):
        """Test string representation of complete task."""
        task = Task(id=5, description="Call mom", completed=True)
        assert repr(task) == "[X] 5. Call mom"

    def test_repr_special_characters(self):
        """Test string representation with special characters."""
        task = Task(id=1, description="Task with [brackets] & <chars>")
        assert repr(task) == "[ ] 1. Task with [brackets] & <chars>"


class TestTaskEquality:
    """Tests for Task equality."""

    def test_equal_tasks(self):
        """Test that two identical tasks are equal."""
        task1 = Task(id=1, description="Buy groceries", completed=False)
        task2 = Task(id=1, description="Buy groceries", completed=False)
        assert task1 == task2

    def test_different_id_not_equal(self):
        """Test that tasks with different IDs are not equal."""
        task1 = Task(id=1, description="Buy groceries")
        task2 = Task(id=2, description="Buy groceries")
        assert task1 != task2

    def test_different_description_not_equal(self):
        """Test that tasks with different descriptions are not equal."""
        task1 = Task(id=1, description="Buy groceries")
        task2 = Task(id=1, description="Buy food")
        assert task1 != task2

    def test_different_completed_not_equal(self):
        """Test that tasks with different completed status are not equal."""
        task1 = Task(id=1, description="Buy groceries", completed=False)
        task2 = Task(id=1, description="Buy groceries", completed=True)
        assert task1 != task2

    def test_not_equal_to_non_task(self):
        """Test that task is not equal to non-Task objects."""
        task = Task(id=1, description="Buy groceries")
        assert task != "not a task"
        assert task != 42
        assert task != None
