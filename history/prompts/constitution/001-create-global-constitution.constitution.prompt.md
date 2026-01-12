---
id: "001"
title: "Create Global Constitution"
stage: "constitution"
date: "2025-12-29"
surface: "agent"
model: "sonnet-4-5-20250929"
feature: "none"
branch: "master"
user: "cz 3"
command: "/sp.constitution"
labels: ["constitution","governance","sdd"]
links:
spec: "null"
ticket: "null"
adr: "null"
pr: "null"
files:
  - ".specify/memory/constitution.md"
tests:
  - "none"
---

## Prompt

Create a single global constitution for the entire "Evolution of Todo" project covering Phase I through Phase V.

This constitution must define:

Spec-Driven Development as mandatory

- No agent may write code without approved specs and tasks
- All work must follow: Constitution → Specs → Plan → Tasks → Implement

Agent Behavior Rules

- No manual coding by humans
- No feature invention
- No deviation from approved specifications
- Refinement must occur at spec level, not code level

Phase Governance

- Each phase is strictly scoped by its specification
- Future-phase features must never leak into earlier phases
- Architecture may evolve only through updated specs and plans

Technology Constraints

- Python for backend
- Next.js for frontend (later phases)
- FastAPI, SQLModel, Neon DB
- OpenAI Agents SDK, MCP
- Docker, Kubernetes, Kafka, Dapr (later phases)

Quality Principles

- Clean architecture
- Stateless services where required
- Clear separation of concerns
- Cloud-native readiness

This constitution must remain stable across all phases and act as the supreme governing document for all agents

## Response snapshot

Created comprehensive constitution at `.specify/memory/constitution.md` with:
- Six core principles covering SDD workflow, agent behavior, phase governance, technology constraints, quality principles, and documentation requirements
- Detailed development workflow with mandatory sequence and change protocol
- Phase-by-phase technology stack reference (Phases I-V)
- Governance section with amendment procedure, versioning policy, and compliance verification requirements
- Sync impact report documenting initial ratification (v1.0.0)

## Outcome

- ✅ Impact: Established supreme governing document for Evolution of Todo project
- 🧪 Tests: N/A (governance document)
- 📁 Files: 1 created (`.specify/memory/constitution.md`)
- 🔁 Next prompts: Ready for Phase I feature specification creation
- 🧠 Reflection: Constitution provides clear guardrails for all agent behavior across all five phases

## Evaluation notes (flywheel)

- Failure modes observed: "none"
- Graders run and results (PASS/FAIL): "N/A"
- Prompt variant (if applicable): "none"
- Next experiment (smallest change to try): "none"
