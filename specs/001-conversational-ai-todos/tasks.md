# Tasks: Conversational AI Todo Management

**Input**: Feature specification from `/specs/001-conversational-ai-todos/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Tests are only included where critical for the integrity of the agent flow.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the AI ecosystem (SDKs, Database Models, Migrations)

- [X] T001 Install OpenAI Agents SDK and MCP SDK in `backend/requirements.txt`
- [X] T002 Create `Conversation` and `Message` models in `backend/src/models/conversation.py`
- [X] T003 Update `User` model to include relationship to `Conversation` in `backend/src/models/user.py`
- [X] T004 Generate and apply Alembic migration for conversation tables
- [X] T005 [P] Implement `PostgresSession` storage adapter in `backend/src/agents/storage.py`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core MCP Server and Agent Logic acting as the brain of the system.

- [X] T006 Initialize embedded MCP server using `FastMCP` in `backend/src/mcp/server.py`
- [X] T007 Mount MCP server to FastAPI app in `backend/src/main.py`
- [X] T008 [P] Implement `create_todo` stateless MCP tool in `backend/src/mcp/tools.py`
- [X] T009 [P] Implement `get_todos` stateless MCP tool in `backend/src/mcp/tools.py`
- [X] T010 [P] Implement `update_todo` stateless MCP tool in `backend/src/mcp/tools.py`
- [X] T011 [P] Implement `delete_todo` stateless MCP tool in `backend/src/mcp/tools.py`
- [X] T012 Define `TodoAgent` with instructions and tool bindings in `backend/src/agents/todo_agent.py`
- [X] T013 Create chat API endpoint structure in `backend/src/api/routes/chat.py`

## Phase 3: User Story 1 - Create & View Todos (Priority: P1 & P2)

**Goal**: Enable creation and viewing of tasks via natural language.

- [X] T014 [US1] P Implement logic to handle chat request and invoke `TodoAgent` in `backend/src/api/routes/chat.py`
- [X] T015 [US1] P Connect `PostgresSession` to Agent Runner for state persistence in `backend/src/agents/runner.py`
- [X] T016 [US1] P Verify `create_todo` tool works end-to-end via chat API
- [X] T017 [US2] P Verify `get_todos` tool works end-to-end via chat API
- [X] T018 [US2] P Implement handling for empty search results in Agent instructions

## Phase 4: User Story 2 - Update & Delete (Priority: P3 & P4)

**Goal**: Full CRUD conversational capabilities.

- [X] T019 [US3] P Update Agent instructions to handle ambiguity for updates
- [X] T020 [US3] P Verify `update_todo` tool works end-to-end via chat API
- [X] T021 [US4] P Verify `delete_todo` tool works end-to-end via chat API
- [X] T022 [US4] P Add specific "mark as complete" intent handling in Agent instructions

## Phase 5: User Story 3 - Multi-Turn Context (Priority: P5)

**Goal**: Robust conversation history usage.

- [X] T023 [US5] Implement "Last N messages" retrieval optimization in `backend/src/api/routes/chat.py`
- [X] T024 [US5] Validate context carry-over (e.g., "delete it" refers to previous task)

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T025 P Add error handling for MCP tool failures (try/catch in tools)
- [X] T026 P Implement input validation (max length) for chat endpoint
- [X] T027 Security check: Verify user isolation in MCP tools (ensure `user_id` filter is always applied)

## Dependencies & Execution Order

- **Setup (Phase 1)**: Must run first. Database changes block everything.
- **Foundational (Phase 2)**: MCP Server must be running before Agent can invoke tools.
- **User Stories (Phase 3+)**: Chat API endpoint (T014) is key entry point for all stories.

## Implementation Strategy

### MVP First
1.  Complete T001-T007 (Infrastructure)
2.  Implement T013, T014 (API)
3.  Implement T008 (Create Tool)
4.  Test: "Add buy milk"

### Incremental Delivery
1.  Add `get_todos` (T009) -> Enable "What do I have to do?"
2.  Add `update/delete` (T010, T011) -> Enable full management
3.  Refine context window (T023) -> Enable better conversations
