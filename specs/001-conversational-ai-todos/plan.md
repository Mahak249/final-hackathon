# Implementation Plan: Conversational AI Todo Management

**Branch**: `001-conversational-ai-todos` | **Date**: 2026-01-08 | **Spec**: [specs/001-conversational-ai-todos/spec.md](specs/001-conversational-ai-todos/spec.md)
**Input**: Feature specification from `/specs/001-conversational-ai-todos/spec.md`

## Summary

This plan outlines the architecture for Phase III: adding a conversational AI interface to the Evolution of Todo app. The system will leverage the **OpenAI Agents SDK** for reasoning and an **Embedded MCP Server** (Model Context Protocol) via Server-Sent Events (SSE) to safely execute todo operations. Conversation history will be persisted in PostgreSQL to maintain context across sessions. All tools will be stateless, ensuring robust and scalable agent interactions.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**:
- `openai-agents` (AI Logic)
- `mcp` (Model Context Protocol SDK)
- `fastapi` (Host application)
- `sqlmodel` (Persistence)
**Storage**: Neon Serverless PostgreSQL (Existing)
**Testing**: `pytest` with `pytest-asyncio`
**Target Platform**: Linux server (Dockerized in future phases)
**Project Type**: Full-stack Web Application (Back-end focus)
**Performance Goals**: API Latency < 2s p95
**Constraints**: Stateless MCP tools, No autonomous background agents

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Spec-Driven Development
- [x] Spec exists and is approved (`spec.md`).
- [x] Plan derived strictly from spec.

### II. Agent Behavior Rules
- [x] No autonomous agents (user-initiated only).
- [x] Agent actions restricted to defined MCP tools.

### III. Phase Governance
- [x] No structure changes to Phase II UI.
- [x] No future phase tech (Docker/K8s) introduced.

### IV. Technology Constraints (Phase III)
- [x] **AI Logic**: Uses OpenAI Agents SDK.
- [x] **Tooling**: Uses Official MCP SDK.
- [x] **Interface**: Stateless chat API endpoint.
- [x] **State**: Database-backed persistence (PostgreSQL).

### VII. AI Agent Architecture
- [x] **MCP-Only**: Agent interacts via MCP tools only.
- [x] **Stateless Tools**: Tools reuse database sessions, no local state.
- [x] **Persistence**: Full conversation history stored in DB.

## Phase 0: Research & Key Decisions

### Decision 1: Embedded MCP Server Architecture
**Choice**: Run MCP Server embedded within FastAPI using `mcp.server.fastmcp`.
**Rationale**:
- Simplifies deployment (single process).
- Direct access to `sqlmodel` dependency injection.
- Eliminates network overhead between internal agent and tool layer.
**Tradeoffs**: Tighter coupling than a standalone process, but acceptable for Phase III MVP.

### Decision 2: Database-Backed Session Adapter
**Choice**: Custom `PostgresSession` adapter for OpenAI Agents SDK.
**Rationale**:
- The SDK's default is ephemeral or file-based.
- We need robust, multi-device history retention (90 days).
- Uses `Conversation` and `Message` tables in existing Postgres DB.

### Decision 3: Stateless Tool Execution
**Choice**: Tools accept `user_id` context and instantiate fresh DB sessions.
**Rationale**:
- Adheres to "Stateless Tools" constitutional requirement.
- Prevents data leakage between users.
- Ensures scalar scalability.

## Phase 1: Design & Data Model

### Data Model (`data-model.md`)

#### New Entities
1.  **Conversation**
    - `id`: UUID (PK)
    - `user_id`: UUID (FK -> User)
    - `title`: String
    - `created_at`: Datetime

2.  **Message**
    - `id`: UUID (PK)
    - `conversation_id`: UUID (FK -> Conversation)
    - `role`: String (user, assistant, tool)
    - `content`: Text
    - `tool_calls`: JSON (audit log)
    - `tool_call_id`: String (linkage)

### Contracts (`contracts/`)

#### Chat API
- `POST /api/chat`
    - **Header**: `Authorization: Bearer <token>`
    - **Body**: `{ "message": "Buy milk", "conversation_id": "optional-uuid" }`
    - **Response**: `{ "response": "Added to list.", "conversation_id": "uuid" }`
    - **Stream**: Optional SSE support for typing indicators.

## Phase 2: Implementation Strategy

### 1. Foundation
- Install `openai-agents`, `mcp` SDKs.
- Create `Conversation` and `Message` SQLModels.
- Run Alembic migrations.

### 2. MCP Server Layer
- Implement `backend/src/mcp/server.py`.
- Define stateless tools:
    - `create_todo(ctx, title, due_date)`
    - `get_todos(ctx, filter)`
    - `update_todo(ctx, id, ...)`
    - `delete_todo(ctx, id)`

### 3. Agent & Runner Layer
- Implement `backend/src/agents/todo_agent.py`.
- Configure `PostgresSession` storage adapter.
- Define System Prompt with strict strict behavior rules.

### 4. API Layer
- Add `backend/src/api/routes/chat.py`.
- Wire `POST /chat` to `AgentRunner`.

## Project Structure

### Documentation
```text
specs/001-conversational-ai-todos/
├── plan.md              # This file
├── spec.md              # Requirements
├── data-model.md        # DB Schema
└── tasks.md             # Execution steps
```

### Source Code
```text
backend/src/
├── agents/             # NEW: Agent definitions
│   ├── todo_agent.py
│   └── secure_storage.py
├── mcp/                # NEW: MCP Server Integration
│   ├── server.py
│   └── tools.py
├── models/
│   ├── conversation.py # NEW: History models
│   └── ...
├── api/
│   └── routes/
│       └── chat.py     # NEW: Chat endpoint
└── main.py             # Mounts MCP server
```

## Complexity Analysis

| Violation | Justification |
|-----------|---------------|
| JSON Column in Postgres | **Required for Agent Memory**: Storing structured `tool_calls` requires flexible schema execution history essential for debugging agent behavior. |
| Custom Storage Adapter | **Required for Constitution**: Standard SDK does not support SQLModel/Postgres out-of-the-box in the way we need for strict persistence rules. |
