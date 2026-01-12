---
id: "002"
title: "Database schema design for conversation history"
stage: "spec"
date: "2026-01-08"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-conversational-ai-todos"
branch: "001-conversational-ai-todos"
user: "user"
command: "Propose a schema design for Conversation and Message tables."
labels:
  - "database"
  - "schema"
  - "sqlmodel"
  - "postgresql"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "backend/src/models/conversation.py"
  - "backend/src/models/user.py"
tests: []
---

# Prompt
I need to design the database schema for persisting conversation history and integrating it with the AI agent.

Specific questions:
1. What is the optimal schema for storing conversation threads and messages in PostgreSQL using SQLModel?
2. How to efficiently retrieve the "last N messages" context for the agent?
3. How to store "tool calls" and "tool outputs" in the message history for full reproducibility?
4. Any constraints from the existing User/Todo schema?

Please:
1. Read existing models in `backend/src/models/` to understand current schema.
2. Propose a schema design for `Conversation` and `Message` tables.
3. Verify relationships with `User` table.

# Response
Proposed a schema design with two new models: `Conversation` and `Message`.
- `Conversation`: Links to `User`, tracks thread metadata.
- `Message`: Stores role, content, and uses a JSON column for `tool_calls` relative to OpenAI/Anthropic schemas.
- add `tool_call_id` for linking tool outputs.
- updates `User` model to include `conversations` relationship.
- provided implementation code for `models/conversation.py`.
- explained efficient retrieval using indexed `created_at` and `conversation_id`.
