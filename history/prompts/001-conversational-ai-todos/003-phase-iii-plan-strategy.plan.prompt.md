---
id: 003
title: Phase III Plan Strategy
stage: plan
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-conversational-ai-todos
branch: 001-conversational-ai-todos
user: Mahak249
command: /sp.plan
labels: ["plan", "phase-iii", "conversational-ai", "mcp", "architecture"]
links:
  spec: specs/001-conversational-ai-todos/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-conversational-ai-todos/plan.md
  - specs/001-conversational-ai-todos/spec.md
tests:
  - Constitution check (passed)
  - Research validation
---

## Prompt

Create the Phase III technical plan for the "Evolution of Todo" project.

The plan must be derived strictly from the Phase III specification and constitution.

AI & AGENT PLAN:
1. Agent responsibilities using OpenAI Agents SDK
2. How natural language input is processed
3. Tool selection and invocation strategy
4. Agent lifecycle per request

MCP SERVER PLAN:
1. MCP server responsibilities
2. Definition of stateless MCP tools for todo operations
3. Database interaction via MCP tools
4. Error propagation from MCP tools to agent

CHAT API PLAN:
1. Stateless chat endpoint structure
2. Conversation context retrieval and persistence
3. Authentication enforcement
4. Request/response lifecycle

DATA PLAN:
1. Conversation data model
2. Relationship between users, conversations, and todos
3. Persistence strategy

INTEGRATION PLAN:
1. Chat API ↔ Agent interaction
2. Agent ↔ MCP tool interaction
3. MCP ↔ Database interaction

CONSTRAINTS:
- No UI changes
- No autonomous agents
- No memory stored outside database
- No future phase infrastructure

The plan must explain HOW Phase III is implemented without adding new features.

## Response snapshot

Created comprehensive implementation plan for Phase III:

**Architectural Decisions**:
1. **Embedded MCP Server**: Running `mcp.server.fastmcp` within FastAPI for simpler deployment and shared database access.
2. **PostgresSession Adapter**: Custom storage adapter for OpenAI Agents SDK to persist conversation state in Postgres.
3. **Stateless Tools**: Tools accept context variables (user_id) to enforce isolation and reuse DB connections.

**Structure**:
- `backend/src/agents/`: Agent definitions and storage adapters.
- `backend/src/mcp/`: Server and tool implementations.
- `backend/src/api/routes/chat.py`: New endpoint.
- `backend/src/models/conversation.py`: New data models.

**Constitution Check**:
- Passed all Phase III requirements (Agents SDK, MCP, Stateless tools, Persistence).
- No forbidden tech (Docker/K8s) or out-of-scope UI changes.

**Complexity Justification**:
- JSON column in Postgres required for flexible tool call auditing.
- Custom storage adapter required because SDK defaults don't support our specific DB integration needs.

## Outcome

- ✅ Impact: Strategic architectural plan approved for conversational AI integration.
- 🧪 Tests: Constitution gates passed, Research validation complete.
- 📁 Files: `specs/001-conversational-ai-todos/plan.md` created.
- 🔁 Next prompts: Run `/sp.tasks` to generate atomic work items.
- 🧠 Reflection: The choice of an embedded MCP server simplifies the architecture significantly compared to a standalone process, reducing latency and operational complexity for this phase.

## Evaluation notes (flywheel)

- Failure modes observed: `spec.md` was initially empty and had to be restored from prompt history.
- Graders run and results (PASS/FAIL): Plan generation - PASS.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify `FastMCP` integration with `async` SQLModel sessions during implementation.
