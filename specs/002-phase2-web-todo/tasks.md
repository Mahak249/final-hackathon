# Tasks: Phase II Full-Stack Todo Web Application

**Input**: Design documents from `/specs/002-phase2-web-todo/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Not explicitly requested - implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create backend directory structure at backend/src/api/, backend/src/models/, backend/src/schemas/, backend/src/services/
- [x] T002 Create frontend directory structure at frontend/src/app/, frontend/src/components/, frontend/src/lib/, frontend/src/types/
- [x] T003 Create backend/requirements.txt with fastapi, uvicorn, sqlmodel, pydantic, alembic, bcrypt
- [x] T004 Create frontend/package.json with next.js 14+, react, react-dom, typescript
- [x] T005 [P] Create backend/.env.example with DATABASE_URL, BACKEND_HOST, BACKEND_PORT, JWT_SECRET
- [x] T006 [P] Create frontend/.env.example with NEXT_PUBLIC_API_URL
- [x] T007 Create backend/src/api/__init__.py, backend/src/models/__init__.py, backend/src/schemas/__init__.py, backend/src/services/__init__.py
- [x] T008 [P] Create frontend/src/app/layout.tsx, frontend/src/app/globals.css

**Checkpoint**: Project structure ready for foundational work

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database and Models

- [x] T009 Create backend/src/database.py with SQLModel engine setup and DATABASE_URL from environment
- [x] T010 Create backend/src/models/user.py with User SQLModel (id, email, password_hash, created_at, updated_at)
- [x] T011 Create backend/src/models/todo.py with Todo SQLModel (id, user_id, title, description, completed, created_at, updated_at)
- [ ] T012 [P] Create backend/alembic/versions/001_initial_migration.py for users and todos tables

### Schemas and Validation

- [x] T013 Create backend/src/schemas/user.py with UserCreate, UserSignin, UserResponse Pydantic schemas
- [x] T014 [P] Create backend/src/schemas/todo.py with TodoCreate, TodoUpdate, TodoToggle, TodoResponse Pydantic schemas

### API Structure

- [x] T015 Create backend/src/api/deps.py with get_db dependency (SessionLocal) and get_current_user placeholder
- [x] T016 Create backend/src/api/routes/__init__.py
- [x] T017 [P] Create backend/src/api/routes/auth.py with placeholder routes for signup, signin, signout
- [x] T018 [P] Create backend/src/api/routes/todos.py with placeholder routes for CRUD operations
- [x] T019 Create backend/src/api/main.py with FastAPI app, CORS middleware, include routers

### Backend Error Handling

- [ ] T020 Create backend/src/api/exceptions.py with HTTPException handlers for validation (422), auth (401), not found (404), conflict (409)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Account Creation (Priority: P1) 🎯 MVP

**Goal**: Allow new users to create accounts with email and password

**Independent Test**: Can be fully tested by completing signup flow and verifying account exists in database

### Backend Implementation

- [x] T021 [P] [US1] Implement UserService.create_user() in backend/src/services/auth.py with bcrypt password hashing
- [x] T022 [US1] Implement POST /api/auth/signup endpoint in backend/src/api/routes/auth.py with email validation
- [x] T023 [US1] Add duplicate email check returning 409 error in signup endpoint

### Frontend Implementation

- [x] T024 [P] [US1] Create frontend/src/app/(auth)/signup/page.tsx with signup form (email, password fields)
- [x] T025 [US1] Create frontend/src/components/auth/SignupForm.tsx with validation and API call
- [x] T026 [US1] Implement api.auth.signup() in frontend/src/lib/api.ts

**Checkpoint**: User Story 1 complete - users can create accounts

---

## Phase 4: User Story 2 - User Authentication (Priority: P1)

**Goal**: Allow registered users to sign in and sign out

**Independent Test**: Can be fully tested by signing in with valid credentials and verifying authenticated session

### Backend Implementation

- [x] T027 [P] [US2] Implement UserService.authenticate_user() in backend/src/services/auth.py for credential validation
- [x] T028 [US2] Implement POST /api/auth/signin endpoint in backend/src/api/routes/auth.py with session creation
- [x] T029 [US2] Implement POST /api/auth/signout endpoint in backend/src/api/routes/auth.py with session invalidation
- [x] T030 [US2] Implement GET /api/auth/me endpoint in backend/src/api/routes/auth.py for current user

### Frontend Implementation

- [x] T031 [P] [US2] Create frontend/src/app/(auth)/signin/page.tsx with signin form (email, password fields)
- [x] T032 [US2] Create frontend/src/components/auth/SigninForm.tsx with validation and API call
- [x] T033 [US2] Implement api.auth.signin() and api.auth.signout() in frontend/src/lib/api.ts
- [x] T034 [US2] Create frontend/src/lib/auth.ts with AuthContext for authentication state management

**Checkpoint**: User Story 2 complete - users can authenticate

---

## Phase 5: User Story 3 - View All Todos (Priority: P1)

**Goal**: Display all todos belonging to the authenticated user

**Independent Test**: Can be fully tested by viewing todo list and verifying only user's todos are shown

### Backend Implementation

- [x] T035 [P] [US3] Implement TodoService.get_todos() in backend/src/services/todo.py with user_id filter
- [x] T036 [US3] Implement GET /api/todos endpoint in backend/src/api/routes/todos.py with auth dependency
- [x] T037 [US3] Add GET /api/todos/{todo_id} endpoint in backend/src/api/routes/todos.py

### Frontend Implementation

- [x] T038 [P] [US3] Create frontend/src/app/(dashboard)/page.tsx with todo list page
- [x] T039 [US3] Create frontend/src/components/todo/TodoList.tsx to display todos
- [x] T040 [US3] Create frontend/src/components/todo/TodoItem.tsx for individual todo display
- [x] T041 [US3] Create frontend/src/components/todo/TodoEmptyState.tsx for when no todos exist (integrated in TodoList)
- [x] T042 [US3] Implement api.todos.list() in frontend/src/lib/api.ts
- [x] T043 [US3] Create frontend/src/components/Layout.tsx for dashboard navigation and signout (integrated in dashboard layout)

**Checkpoint**: User Story 3 complete - users can view their todos

---

## Phase 6: User Story 4 - Create Todo (Priority: P1)

**Goal**: Allow authenticated users to add new todos

**Independent Test**: Can be fully tested by creating a todo and verifying it appears in the list

### Backend Implementation

- [x] T044 [P] [US4] Implement TodoService.create_todo() in backend/src/services/todo.py with user_id association
- [x] T045 [US4] Implement POST /api/todos endpoint in backend/src/api/routes/todos.py with title validation

### Frontend Implementation

- [x] T046 [P] [US4] Create frontend/src/components/todo/TodoForm.tsx for adding new todos
- [x] T047 [US4] Create frontend/src/components/todo/AddTodoButton.tsx or inline form in todo list (integrated in dashboard)
- [x] T048 [US4] Implement api.todos.create() in frontend/src/lib/api.ts
- [x] T049 [US4] Connect TodoForm to TodoList with optimistic UI update

**Checkpoint**: User Story 4 complete - users can add todos

---

## Phase 7: User Story 5 - Edit Todo (Priority: P2)

**Goal**: Allow authenticated users to update existing todos

**Independent Test**: Can be fully tested by editing a todo's title and verifying changes are saved

### Backend Implementation

- [x] T050 [P] [US5] Implement TodoService.update_todo() in backend/src/services/todo.py with ownership check
- [x] T051 [US5] Implement PUT /api/todos/{todo_id} endpoint in backend/src/api/routes/todos.py

### Frontend Implementation

- [x] T052 [P] [US5] Create frontend/src/components/todo/EditTodoForm.tsx with pre-filled values (integrated in TodoForm)
- [x] T053 [US5] Create Edit button in TodoItem.tsx to open edit mode
- [x] T054 [US5] Implement api.todos.update() in frontend/src/lib/api.ts
- [x] T055 [US5] Connect edit form to TodoItem with inline or modal editing

**Checkpoint**: User Story 5 complete - users can edit todos

---

## Phase 8: User Story 6 - Delete Todo (Priority: P2)

**Goal**: Allow authenticated users to remove todos

**Independent Test**: Can be fully tested by deleting a todo and verifying it no longer appears in list

### Backend Implementation

- [x] T056 [P] [US6] Implement TodoService.delete_todo() in backend/src/services/todo.py with ownership check
- [x] T057 [US6] Implement DELETE /api/todos/{todo_id} endpoint in backend/src/api/routes/todos.py

### Frontend Implementation

- [x] T058 [P] [US6] Create Delete button in TodoItem.tsx with confirmation dialog
- [x] T059 [US6] Implement api.todos.delete() in frontend/src/lib/api.ts
- [x] T060 [US6] Connect delete button to API with optimistic UI update

**Checkpoint**: User Story 6 complete - users can delete todos

---

## Phase 9: User Story 7 - Toggle Todo Completion (Priority: P1)

**Goal**: Allow authenticated users to mark todos as complete/incomplete

**Independent Test**: Can be fully tested by toggling completion and verifying visual change

### Backend Implementation

- [x] T061 [P] [US7] Implement TodoService.toggle_todo() in backend/src/services/todo.py with ownership check
- [x] T062 [US7] Implement PATCH /api/todos/{todo_id}/toggle endpoint in backend/src/api/routes/todos.py

### Frontend Implementation

- [x] T063 [P] [US7] Add checkbox or toggle button in TodoItem.tsx for completion status
- [x] T064 [US7] Implement api.todos.toggle() in frontend/src/lib/api.ts
- [x] T065 [US7] Style completed todos differently (strikethrough, color change) in TodoItem.tsx

**Checkpoint**: User Story 7 complete - users can toggle todo completion

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T066 [P] Implement auth middleware in backend/src/api/deps.py for session validation on all routes
- [ ] T067 [P] Add proper error handling in frontend/src/lib/api.ts with error boundary and toast notifications
- [ ] T068 Add responsive layout styling in frontend/src/app/globals.css using CSS Grid/Flexbox
- [ ] T069 Create local development documentation in README.md per quickstart.md
- [ ] T070 [P] Add frontend loading states and skeletons while API calls are pending
- [ ] T071 Add form input validation feedback on all frontend forms (email format, password length)
- [ ] T072 Ensure 401 responses redirect to signin page on frontend (AuthContext)

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup (1) | None | Foundational |
| Foundational (2) | Setup | All User Stories |
| User Story 1 (3) | Foundational | US2, US3, US4, US7 |
| User Story 2 (4) | Foundational | US3, US4, US7 |
| User Story 3 (5) | Foundational | US4, US7 |
| User Story 4 (6) | Foundational + US3 | US5, US6, US7 |
| User Story 5 (7) | Foundational + US3 | US6 |
| User Story 6 (8) | Foundational + US3 | Polish |
| User Story 7 (9) | Foundational + US3 | Polish |
| Polish (10) | All User Stories | Complete |

### User Story Dependencies

| User Story | Can Start After | Dependencies |
|------------|-----------------|--------------|
| US1 (Signup) | Foundational | Independent |
| US2 (Signin) | Foundational | Independent |
| US3 (View Todos) | Foundational | Requires US2 for auth |
| US4 (Create Todo) | Foundational + US3 | Requires US3 for list |
| US5 (Edit Todo) | Foundational + US3 | Requires US3 for list |
| US6 (Delete Todo) | Foundational + US3 | Requires US3 for list |
| US7 (Toggle) | Foundational + US3 | Requires US3 for list |

### Within Each User Story

- Backend models/schemas already created in Foundational
- Services before endpoints
- Core implementation before frontend integration
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1: All 8 tasks marked [P] can run in parallel
- Phase 2: Tasks T009-T014 can run in parallel (different files)
- Once Foundational phase completes, user stories can proceed in parallel
- Within each user story, backend and frontend tasks can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 3 (View Todos)

```bash
# Backend tasks can run in parallel:
Task: "Implement TodoService.get_todos() in backend/src/services/todo.py"
Task: "Implement GET /api/todos endpoint in backend/src/api/routes/todos.py"

# Frontend tasks can run in parallel:
Task: "Create TodoList.tsx component"
Task: "Create TodoItem.tsx component"
Task: "Implement api.todos.list() in frontend/src/lib/api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Signup)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Add User Story 7 → Test independently → Deploy/Demo
9. Add Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + 2 (Authentication)
   - Developer B: User Story 3 + 4 + 7 (Todo CRUD)
   - Developer C: User Story 5 + 6 (Edit + Delete)
3. Stories complete and integrate independently

---

## Task Summary

| Phase | User Stories | Task Count |
|-------|--------------|------------|
| Phase 1: Setup | - | 8 tasks |
| Phase 2: Foundational | - | 12 tasks |
| Phase 3: US1 - Signup | P1 | 6 tasks |
| Phase 4: US2 - Signin | P1 | 7 tasks |
| Phase 5: US3 - View Todos | P1 | 9 tasks |
| Phase 6: US4 - Create Todo | P1 | 6 tasks |
| Phase 7: US5 - Edit Todo | P2 | 6 tasks |
| Phase 8: US6 - Delete Todo | P2 | 5 tasks |
| Phase 9: US7 - Toggle | P1 | 5 tasks |
| Phase 10: Polish | - | 7 tasks |

**Total Tasks**: 71 tasks

**P1 Stories (Critical Path)**: US1, US2, US3, US4, US7 (can ship MVP)
**P2 Stories (Enhancements)**: US5, US6 (add after MVP)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tasks fail before implementing (if tests were included)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
