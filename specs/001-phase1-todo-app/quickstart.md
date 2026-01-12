# Quickstart: Phase I Todo App

A simple in-memory todo list application for the command line.

## Prerequisites

- Python 3.11 or higher
- No external dependencies required

## Installation

No installation needed. Simply clone the repository and run.

## Running the Application

```bash
python todo.py
```

## Usage Guide

### Main Menu

When you run the application, you'll see the main menu:

```
=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7):
```

### Adding Tasks

1. Select option `1`
2. Enter your task description when prompted
3. Press Enter to confirm

Example:
```
Enter your choice (1-7): 1
Enter task description: Buy groceries
Task added! (ID: 1)
```

### Viewing Tasks

1. Select option `2`
2. View your task list
3. Completed tasks show `[X]`, incomplete show `[ ]`

Example:
```
Enter your choice (1-7): 2
[ ] 1. Buy groceries
[ ] 2. Call mom
[X] 3. Finish report
```

### Updating Tasks

1. Select option `3`
2. Enter the ID of the task you want to update
3. Enter the new description

Example:
```
Enter your choice (1-7): 3
Enter task ID to update: 1
Enter new description: Buy groceries and milk
Task 1 updated!
```

### Deleting Tasks

1. Select option `4`
2. Enter the ID of the task to delete

Example:
```
Enter your choice (1-7): 4
Enter task ID to delete: 2
Task 2 deleted!
```

### Marking Tasks Complete

1. Select option `5`
2. Enter the ID of the task to mark complete

Example:
```
Enter your choice (1-7): 5
Enter task ID to mark complete: 1
Task 1 marked as complete!
```

### Marking Tasks Incomplete

1. Select option `6`
2. Enter the ID of the task to mark incomplete

Example:
```
Enter your choice (1-7): 6
Enter task ID to mark incomplete: 3
Task 3 marked as incomplete!
```

### Exiting

1. Select option `7`
2. Your data will be lost (no persistence in Phase I)

```
Enter your choice (1-7): 7
Goodbye!
```

## Error Messages

| Situation | Message |
|-----------|---------|
| Empty task description | "Error: Task description cannot be empty." |
| Whitespace-only description | "Error: Task description cannot be whitespace only." |
| Invalid ID (non-numeric) | "Error: Please enter a valid number." |
| Task not found | "Error: Task with ID {id} not found." |
| Task already complete | "Error: Task {id} is already complete." |
| Task already incomplete | "Error: Task {id} is already incomplete." |
| No tasks to delete | "Error: No tasks to delete." |

## Tips

- Task IDs are assigned sequentially and never reused
- Completed tasks are marked with `[X]`, incomplete with `[ ]`
- Data is lost when you exit the application (Phase I limitation)
- Maximum task description is 500 characters

## Troubleshooting

**Application won't start?**
- Ensure Python 3.11+ is installed: `python --version`
- Run from the repository root directory

**Unexpected errors?**
- Ensure you're entering numeric values for task IDs
- Check that tasks exist before trying to modify them

**Nothing happens after menu selection?**
- Press Enter after entering your choice
- Ensure you're entering the correct menu number
