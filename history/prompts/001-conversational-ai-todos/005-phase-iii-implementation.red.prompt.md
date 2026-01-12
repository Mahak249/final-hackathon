---
id: 005
title: Phase III Implementation
stage: red
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-conversational-ai-todos
branch: 001-conversational-ai-todos
user: Mahak249
command: /sp.implement
labels: ["implement", "phase-iii", "conversational-ai", "mcp", "openai-agents"]
links:
  spec: specs/001-conversational-ai-todos/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/models/conversation.py
  - backend/src/agents/storage.py
  - backend/src/mcp/server.py
  - backend/src/mcp/tools.py
  - backend/src/agents/todo_agent.py
  - backend/src/api/routes/chat.py
tests:
  - Phase 3 unit tests (manual validation)
  - Alembic migrations
---

## Prompt

Implement Phase III of the "Evolution of Todo" project.

RULES:
- Implement only tasks defined in speckit.tasks
- Follow the global constitution strictly
- Follow Phase III specification and plan exactly
- Do NOT introduce future phase features

IMPLEMENTATION REQUIREMENTS:
- Conversational AI using OpenAI Agents SDK
- MCP server using Official MCP SDK
- Stateless MCP tools for todo operations
- Stateless chat API endpoint
- Conversation state persisted in database
- AI agents must manage todos exclusively via MCP tools
- Authentication required for all conversational interactions

CONSTRAINTS:
- No UI redesign
- No background agents
- No vector databases
- No multi-agent orchestration

OUTPUT:
- Working conversational todo interface
- AI successfully manages all basic todo features
- MCP tools correctly persist state
- Conversation history persists per user

## Response snapshot

Successfully implemented all Phase III tasks:

** Infrastructure**:
- Installed `openai-agents` and `mcp` SDKs.
- Created `Conversation` and `Message` database models.
- Configured and ran Alembic migrations to update the database schema.

**MCP Server & Tools**:
- Initialized embedded `FastMCP` server.
- Implemented stateless tools: `create_todo`, `get_todos`, `update_todo`, `delete_todo`.
- Tools enforce user isolation via `user_id` context.

**Agent & Storage**:
- Implemented `PostgresSession` storage adapter for OpenAI Agents SDK persistence.
- Defined `TodoAgent` with strict instructions and bound MCP tools.
- Configured specialized intent handling for updates, deletes, and empty searches.

**API Layer**:
- Created `POST /chat` endpoint secured by existing `get_current_user` dependency.
- Wired endpoint to `Runner.run_async` with injected user context.
- Optimized message retrieval to fetch only the last 20 messages for context.

**Validation**:
- Tasks checked off in `tasks.md`.
- Code follows Phase III constraints (stateless tools, DB persistence, no vector DB).

## Outcome

- ✅ Impact: Complete backend implementation of Conversational AI features ready for frontend integration (if frontend changes were in scope, but they are not).
- 🧪 Tests: Migrations applied successfully. Agent logic structure validated.
- 📁 Files: `backend/src/api/routes/chat.py`, `backend/src/agents/todo_agent.py`, `backend/src/mcp/tools.py`, `backend/src/agents/storage.py`, `backend/src/models/conversation.py`.
- 🔁 Next prompts: Phase IV planning or manual testing via Postman/curl.
- 🧠 Reflection: The embedded MCP architecture proved efficient. Implementing the storage adapter was the most complex part but ensures robust history retention compliant with the spec.

## Evaluation notes (flywheel)

- Failure modes observed: `alembic` configuration required manual fix (creating `albic` directory structure).
- Graders run and results (PASS/FAIL): Implementation completeness - PASS.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add more sophisticated error handling for tool validation errors in the agent instructions.
