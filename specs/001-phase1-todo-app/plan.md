# Implementation Plan: Phase I - Todo App

**Branch**: `001-phase1-todo-app` | **Date**: 2025-12-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-phase1-todo-app/spec.md`

## Summary

Build a single-user, in-memory Python console application for managing todo tasks. The application provides a menu-driven interface for adding, viewing, updating, deleting, and marking tasks as complete/incomplete. All data persists only during the application session and is lost on exit.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: Python standard library only (no external dependencies required)
**Storage**: In-memory Python list (ephemeral, session-only)
**Testing**: pytest for unit tests
**Target Platform**: Any system with Python 3.11+ (Windows, macOS, Linux)
**Project Type**: Single console application (no packages/modules required)
**Performance Goals**: Sub-second response time for all operations
**Constraints**: No databases, no files, no web frameworks, no external services
**Scale/Scope**: Single user, single session, ephemeral data

## Constitution Check

*GATE: Must pass before proceeding to implementation*

**Phase I Compliance Verification**:

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Spec-Driven Development | PASS | Plan derived strictly from approved spec.md |
| II. Agent Behavior Rules | PASS | Implementation will follow approved specs/tasks only |
| III. Phase Governance | PASS | Only Phase I features included; no future-phase concepts |
| IV. Technology Constraints | PASS | Python console app; no DB, no web, no external services |
| V. Quality Principles | PASS | Clean architecture with separation of concerns |
| VI. Documentation Requirements | PASS | Docstrings, inline comments, README for users |

**GATE RESULT**: All constitutional gates pass. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-todo-app/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (not needed - no unknowns)
├── data-model.md        # Phase 1 output (this plan includes data model)
├── quickstart.md        # Phase 1 output (user instructions)
├── contracts/           # Phase 1 output (CLI command contracts)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Single project structure
todo.py                 # Main application entry point
task.py                 # Task model class
task_service.py         # Task management business logic
cli.py                  # Console interface and menu handling
tests/
├── test_task.py        # Unit tests for Task model
├── test_task_service.py # Unit tests for TaskService
└── test_cli.py         # Unit tests for CLI operations
```

**Structure Decision**: Simple single-module structure with clear separation:
- `task.py` - Data model only (id, description, completed)
- `task_service.py` - Business logic (CRUD operations, ID generation)
- `cli.py` - User interaction (menu display, input handling)
- `todo.py` - Application entry point and main loop

## Data Model

### Task Entity

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | Unique, 1-based, auto-increment | Unique task identifier |
| description | str | Required, 1-500 chars, not whitespace-only | Task text |
| completed | bool | Defaults to False | Completion status |

### In-Memory Storage

```python
# task_service.py
class TaskService:
    def __init__(self):
        self._tasks: list[Task] = []
        self._next_id: int = 1
```

- **Data Structure**: Python list (`list[Task]`)
- **ID Generation**: Counter that increments on each task add; IDs never reused
- **ID Assignment**: Tasks assigned ID when added, before insertion into list

## CLI Control Flow

### Main Menu

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

### Operation Flow

1. **Add Task**:
   - Prompt: "Enter task description: "
   - Validate non-empty, non-whitespace input
   - If invalid: show error, return to menu
   - If valid: create task, display confirmation, return to menu

2. **View Tasks**:
   - If empty: display "No tasks yet."
   - If tasks exist: list each task as "[ ] ID. description" or "[X] ID. description"
   - Return to menu

3. **Update Task**:
   - Prompt: "Enter task ID to update: "
   - Validate numeric input
   - Validate task exists
   - Prompt: "Enter new description: "
   - Validate non-empty, non-whitespace input
   - Update task, display confirmation
   - Return to menu

4. **Delete Task**:
   - Prompt: "Enter task ID to delete: "
   - Validate numeric input
   - Validate task exists
   - Delete task, display confirmation
   - Return to menu

5. **Mark Complete**:
   - Prompt: "Enter task ID to mark complete: "
   - Validate numeric input
   - Validate task exists
   - Validate task not already complete
   - Update status, display confirmation
   - Return to menu

6. **Mark Incomplete**:
   - Prompt: "Enter task ID to mark incomplete: "
   - Validate numeric input
   - Validate task exists
   - Validate task not already incomplete
   - Update status, display confirmation
   - Return to menu

7. **Exit**:
   - Display "Goodbye!"
   - Terminate application

## Separation of Responsibilities

### task.py (Model Layer)
- Pure data container
- No business logic
- No I/O operations

### task_service.py (Service Layer)
- CRUD operations on tasks
- ID generation and management
- Validation of task operations
- No user interaction code

### cli.py (Presentation Layer)
- Menu display
- Input prompting and validation
- Error message display
- No business logic
- Delegates to TaskService

### todo.py (Application Layer)
- Creates TaskService instance
- Creates CLI interface
- Runs main menu loop

## Error Handling Strategy

### Input Validation Errors

| Error Type | Input | Message |
|------------|-------|---------|
| Empty description | "" | "Error: Task description cannot be empty." |
| Whitespace only | "   " | "Error: Task description cannot be whitespace only." |
| Non-numeric ID | "abc" | "Error: Please enter a valid number." |
| ID out of range | "999" | "Error: Task with ID 999 not found." |

### Operation Errors

| Error Type | Condition | Message |
|------------|-----------|---------|
| Empty list delete | No tasks exist | "Error: No tasks to delete." |
| Empty list view | No tasks exist | "No tasks yet." (info, not error) |
| Already complete | Task.completed is True | "Error: Task 1 is already complete." |
| Already incomplete | Task.completed is False | "Error: Task 1 is already incomplete." |

### Error Display

- All errors displayed to stderr
- User-friendly messages (not technical)
- Clear indication of what went wrong
- Guidance on how to correct (where applicable)

## Contracts

### CLI Command Contracts

#### add
**Input**: String (description)
**Output**: Success message or error
**Errors**: Empty, whitespace-only

#### list
**Input**: None
**Output**: Task list or "No tasks yet."
**Errors**: None (empty state handled gracefully)

#### update
**Input**: Integer (task ID), String (new description)
**Output**: Success message or error
**Errors**: Invalid ID, task not found, empty description

#### delete
**Input**: Integer (task ID)
**Output**: Success message or error
**Errors**: Invalid ID, task not found, empty list

#### complete
**Input**: Integer (task ID)
**Output**: Success message or error
**Errors**: Invalid ID, task not found, already complete

#### incomplete
**Input**: Integer (task ID)
**Output**: Success message or error
**Errors**: Invalid ID, task not found, already incomplete

## Complexity Tracking

> No constitutional violations requiring justification. Design is minimal and adheres to all principles.

## Quickstart Guide

### Running the Application

```bash
python todo.py
```

### First-Time Usage

1. Run the application
2. Select option 1 to add your first task
3. Select option 2 to view your tasks
4. Use options 3-6 to manage tasks
5. Select option 7 to exit (data will be lost)

### Example Session

```
=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7): 1
Enter task description: Buy groceries

Task added! (ID: 1)

=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7): 2
[ ] 1. Buy groceries

=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7): 5
Enter task ID to mark complete: 1
Task 1 marked as complete!

=== Todo Application ===
1. Add Task
2. View Tasks
3. Update Task
4. Delete Task
5. Mark Task Complete
6. Mark Task Incomplete
7. Exit

Enter your choice (1-7): 7
Goodbye!
```

---

**Plan Status**: Ready for `/sp.tasks` (task breakdown)

**Notes**:
- No research needed - all technical decisions are straightforward
- No external dependencies required beyond Python 3.11+
- No architectural tradeoffs - design is minimal and follows spec exactly
