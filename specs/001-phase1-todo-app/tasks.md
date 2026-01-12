---
description: "Task list template for feature implementation"
---

# Tasks: Phase I - Todo App

**Input**: Design documents from `/specs/001-phase1-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan
- [X] T002 Initialize pytest for unit testing
- [X] T003 [P] Add __init__.py files for test package

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Task Model Implementation

- [X] T004 Create Task data model in `task.py`
  - **Preconditions**: None
  - **Expected Output**: `task.py` with Task class
  - **Artifacts Created**: `task.py`
  - **References**: data-model.md (Task Entity), plan.md (task.py section)

- [X] T005 Create TaskService in `task_service.py`
  - **Preconditions**: T004 complete
  - **Expected Output**: `task_service.py` with TaskService class and in-memory storage
  - **Artifacts Created**: `task_service.py`
  - **References**: plan.md (In-Memory Storage), data-model.md (Storage Model)

### Unit Tests for Foundation

- [X] T006 [P] Unit tests for Task model in `tests/test_task.py`
  - **Preconditions**: T004 complete
  - **Expected Output**: Tests for Task class initialization and __repr__
  - **Artifacts Created**: `tests/test_task.py`
  - **References**: plan.md (Testing section)

- [X] T007 [P] Unit tests for TaskService in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Tests for TaskService initialization
  - **Artifacts Created**: `tests/test_task_service.py`
  - **References**: plan.md (Testing section)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Add Task (Priority: P1) 🎯 MVP

**Goal**: Users can add tasks with descriptions

**Independent Test**: Run app, select "Add Task", enter description, verify task appears in list

### Tests for User Story 1

- [X] T008 [P] [US1] Unit test for add_task in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that add_task creates task with correct ID and status
  - **References**: spec.md (User Story 1 - Add Task, FR-001, FR-010)

- [X] T009 [P] [US1] Unit test for add_task validation in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that empty descriptions raise ValueError
  - **References**: spec.md (FR-008, Edge Cases)

### Implementation for User Story 1

- [X] T010 [US1] Implement add_task method in `task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: add_task method creates Task with auto-incremented ID
  - **Artifacts Modified**: `task_service.py`
  - **References**: spec.md (FR-001, FR-010), plan.md (Add Task section)

- [X] T011 [US1] Implement CLI add command in `cli.py`
  - **Preconditions**: T010 complete
  - **Expected Output**: CLI prompts for description, calls TaskService.add_task
  - **Artifacts Created**: `cli.py`
  - **References**: spec.md (User Story 1), plan.md (Add Task section)

**Checkpoint**: User Story 1 complete - users can add tasks

---

## Phase 4: User Story 2 - View Task List (Priority: P1)

**Goal**: Users can see all tasks with their status

**Independent Test**: Add tasks, select "View Tasks", verify all tasks display with correct format

### Tests for User Story 2

- [X] T012 [P] [US2] Unit test for list_tasks in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that list_tasks returns all tasks
  - **References**: spec.md (User Story 2 - View Task List, FR-002)

### Implementation for User Story 2

- [X] T013 [US2] Implement list_tasks method in `task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: list_tasks method returns all tasks
  - **Artifacts Modified**: `task_service.py`
  - **References**: spec.md (FR-002), plan.md (View Tasks section)

- [X] T014 [US2] Implement CLI list command in `cli.py`
  - **Preconditions**: T013 complete
  - **Expected Output**: CLI displays all tasks or "No tasks yet." message
  - **Artifacts Modified**: `cli.py`
  - **References**: spec.md (User Story 2), plan.md (View Tasks section)

**Checkpoint**: User Story 2 complete - users can view tasks

---

## Phase 5: User Story 3 - Update Task (Priority: P1)

**Goal**: Users can modify task descriptions

**Independent Test**: Add task, update description, verify new description shown

### Tests for User Story 3

- [X] T015 [P] [US3] Unit test for update_task in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that update_task modifies description
  - **References**: spec.md (User Story 3 - Update Task, FR-003)

- [X] T016 [P] [US3] Unit test for update_task errors in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Tests for invalid ID and empty description errors
  - **References**: spec.md (FR-007, FR-008)

### Implementation for User Story 3

- [X] T017 [US3] Implement update_task method in `task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: update_task modifies description, raises error for invalid ID
  - **Artifacts Modified**: `task_service.py`
  - **References**: spec.md (FR-003, FR-007, FR-008), plan.md (Update Task section)

- [X] T018 [US3] Implement CLI update command in `cli.py`
  - **Preconditions**: T017 complete
  - **Expected Output**: CLI prompts for ID and new description
  - **Artifacts Modified**: `cli.py`
  - **References**: spec.md (User Story 3), plan.md (Update Task section)

**Checkpoint**: User Story 3 complete - users can update tasks

---

## Phase 6: User Story 4 - Delete Task (Priority: P1)

**Goal**: Users can remove tasks

**Independent Test**: Add tasks, delete one, verify it no longer appears

### Tests for User Story 4

- [X] T019 [P] [US4] Unit test for delete_task in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that delete_task removes task from list
  - **References**: spec.md (User Story 4 - Delete Task, FR-004)

- [X] T020 [P] [US4] Unit test for delete_task errors in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Tests for invalid ID errors
  - **References**: spec.md (FR-007)

### Implementation for User Story 4

- [X] T021 [US4] Implement delete_task method in `task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: delete_task removes task by ID, raises error for invalid ID
  - **Artifacts Modified**: `task_service.py`
  - **References**: spec.md (FR-004, FR-007), plan.md (Delete Task section)

- [X] T022 [US4] Implement CLI delete command in `cli.py`
  - **Preconditions**: T021 complete
  - **Expected Output**: CLI prompts for task ID and confirms deletion
  - **Artifacts Modified**: `cli.py`
  - **References**: spec.md (User Story 4), plan.md (Delete Task section)

**Checkpoint**: User Story 4 complete - users can delete tasks

---

## Phase 7: User Story 5 - Mark Task Complete (Priority: P1)

**Goal**: Users can mark tasks as complete

**Independent Test**: Add task, mark complete, verify status updates

### Tests for User Story 5

- [X] T023 [P] [US5] Unit test for mark_complete in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that mark_complete sets completed=True
  - **References**: spec.md (User Story 5 - Mark Task Complete, FR-005)

- [X] T024 [P] [US5] Unit test for mark_complete errors in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Tests for invalid ID and already complete errors
  - **References**: spec.md (FR-007)

### Implementation for User Story 5

- [X] T025 [US5] Implement mark_complete method in `task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: mark_complete sets completed=True, raises error for invalid/already complete
  - **Artifacts Modified**: `task_service.py`
  - **References**: spec.md (FR-005, FR-007), plan.md (Mark Complete section)

- [X] T026 [US5] Implement CLI complete command in `cli.py`
  - **Preconditions**: T025 complete
  - **Expected Output**: CLI prompts for task ID and confirms completion
  - **Artifacts Modified**: `cli.py`
  - **References**: spec.md (User Story 5), plan.md (Mark Complete section)

**Checkpoint**: User Story 5 complete - users can mark tasks complete

---

## Phase 8: User Story 6 - Mark Task Incomplete (Priority: P1)

**Goal**: Users can reopen completed tasks

**Independent Test**: Complete task, mark incomplete, verify status updates

### Tests for User Story 6

- [X] T027 [P] [US6] Unit test for mark_incomplete in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Test that mark_incomplete sets completed=False
  - **References**: spec.md (User Story 6 - Mark Task Incomplete, FR-006)

- [X] T028 [P] [US6] Unit test for mark_incomplete errors in `tests/test_task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: Tests for invalid ID and already incomplete errors
  - **References**: spec.md (FR-007)

### Implementation for User Story 6

- [X] T029 [US6] Implement mark_incomplete method in `task_service.py`
  - **Preconditions**: T005 complete
  - **Expected Output**: mark_incomplete sets completed=False, raises error for invalid/already incomplete
  - **Artifacts Modified**: `task_service.py`
  - **References**: spec.md (FR-006, FR-007), plan.md (Mark Incomplete section)

- [X] T030 [US6] Implement CLI incomplete command in `cli.py`
  - **Preconditions**: T029 complete
  - **Expected Output**: CLI prompts for task ID and confirms reopening
  - **Artifacts Modified**: `cli.py`
  - **References**: spec.md (User Story 6), plan.md (Mark Incomplete section)

**Checkpoint**: User Story 6 complete - users can mark tasks incomplete

---

## Phase 9: Application Integration

**Purpose**: Connect all components with main entry point

### Application Entry Point

- [X] T031 Create main application in `todo.py`
  - **Preconditions**: T011, T014, T018, T022, T026, T030 complete
  - **Expected Output**: todo.py with main() function and menu loop
  - **Artifacts Created**: `todo.py`
  - **References**: plan.md (Application Layer, Main Menu)

### Integration Testing

- [X] T032 [P] Integration test for CLI menu flow in `tests/test_cli.py`
  - **Preconditions**: All CLI commands implemented
  - **Expected Output**: Test main menu loop and all command integrations
  - **References**: spec.md (SC-002, SC-003)

**Checkpoint**: All user stories complete and integrated

---

## Phase 10: Validation & Polish

**Purpose**: Verify all success criteria are met

- [X] T033 Run all unit tests and verify 100% pass rate
- [X] T034 [P] Manual validation of all user stories
- [X] T035 [P] Verify error messages match specification
- [X] T036 [P] Verify task list display format matches spec

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order
- **Integration (Phase 9)**: Depends on all user stories complete
- **Polish (Phase 10)**: Depends on Integration completion

### Within Each User Story

- Tests (T008-T030) MUST be written and FAIL before implementation
- Service methods (T010, T013, T017, T021, T025, T029) before CLI commands
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tests marked [P] can run in parallel
- Once Foundational is done, all user story tests can run in parallel
- Once user story methods are done, all CLI commands can run in parallel

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
