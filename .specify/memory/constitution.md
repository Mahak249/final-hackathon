<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0 (Phase III AI/MCP capabilities amendment)

Modified principles:
- IV. Technology Constraints → Phase III section expanded with detailed AI/MCP rules
- Added new principle VII. AI Agent Architecture (Phase III+)

Added sections:
- Principle VII: AI Agent Architecture with MCP integration rules
- Phase III detailed constraints: OpenAI Agents SDK, stateless chat API, MCP tools, database persistence
- Explicit rules for AI agent interactions, state management, and conversation persistence
- Restrictions: No autonomous background agents, no multi-agent orchestration beyond documented scope

Removed sections: None

Templates requiring updates:
- .specify/templates/plan-template.md: ✅ No changes needed (references "Constitution Check")
- .specify/templates/spec-template.md: ✅ No changes needed (already SDD-aligned)
- .specify/templates/tasks-template.md: ✅ No changes needed (already SDD-aligned)

Follow-up TODOs: None
-->

# Evolution of Todo Constitution

This constitution serves as the supreme governing document for the Evolution of Todo project across all five phases. All agents, contributors, and automated systems MUST adhere to these principles.

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

All feature development MUST follow the mandatory workflow sequence:

1. **Constitution** → Defines governing principles and constraints
2. **Specs** → Detailed feature requirements with user stories
3. **Plan** → Architectural decisions and implementation approach
4. **Tasks** → Atomic, testable work items organized by user story
5. **Implement** → Execution of approved tasks only

**RATIONALE**: This sequence ensures intentional design, prevents scope creep, and enables independent testing and delivery of each feature increment.

---

### II. Agent Behavior Rules (NON-NEGOTIABLE)

All AI agents operating on this project MUST adhere to:

- **No manual coding by humans**: All code changes MUST be made by agents following approved specifications and tasks
- **No feature invention**: Agents MUST NOT add functionality not explicitly specified in approved specs
- **No deviation from approved specifications**: Implementation MUST match specifications exactly
- **Refinement at spec level**: Any needed changes MUST be routed back to the specification phase, not resolved ad-hoc during implementation

**RATIONALE**: Prevents autonomous drift, ensures human intent is preserved, and maintains architectural coherence across all phases.

---

### III. Phase Governance (NON-NEGOTIABLE)

Each phase operates under strict governance rules:

- **Phase Scoping**: Each phase is strictly bounded by its feature specification document
- **Feature Isolation**: Future-phase features MUST NOT leak into earlier phases, even as infrastructure
- **Architecture Evolution**: Architectural changes require updated specs and plans; no unilateral evolution
- **Scope Creep Prevention**: Any feature request outside current phase scope MUST be deferred to appropriate phase

**RATIONALE**: Enables predictable delivery, prevents over-engineering, and maintains focus on MVP requirements per phase.

---

### IV. Technology Constraints (PHASE-GATED)

Technology choices are strictly phased. Agents MUST NOT use technologies before their designated phase.

#### Phase I: Foundation (In-Memory Console Application)

Allowed technologies for Phase I only:

- **Language**: Python 3.11+ (console/Script mode)
- **Storage**: In-memory only (Python data structures)
- **Output**: CLI/Terminal interface
- **Constraints**: No network, No persistence, No authentication

#### Phase II: Full-Stack Web Application

Phase I requirements PLUS the following, starting Phase II:

- **Backend**: Python REST API (FastAPI recommended)
- **Database**: Neon Serverless PostgreSQL
- **ORM/Data Layer**: SQLModel or equivalent
- **Frontend**: Next.js (React, TypeScript)
- **Authentication**: Better Auth (signup/signin)
- **Architecture**: Full-stack web application

#### Phase III: AI-Augmented Application with MCP Integration

Phase II requirements PLUS the following, starting Phase III:

- **AI Logic**: OpenAI Agents SDK
- **Conversational Interface**: Stateless chat API
- **Tooling**: Model Context Protocol (MCP)
- **MCP Server**: Official MCP SDK
- **Architecture**: Agent-driven task management
- **State Management**: Database persistence for conversation and task state
- **MCP Design**: All MCP tools MUST be stateless and rely on database persistence

**Phase III AI/MCP Rules**:
- AI agents MAY ONLY interact with the system via MCP tools
- MCP tools MUST NOT store in-memory state
- Conversation context MUST be persisted and retrievable from database
- Phase II authentication, frontend, and database remain unchanged
- NO autonomous background agents
- NO multi-agent orchestration beyond documented scope

#### Phase IV and Later: Advanced Cloud Infrastructure

Phase III requirements PLUS the following, starting Phase IV:

- **Infrastructure**: Docker, Kubernetes, Kafka, Dapr
- **Orchestration**: Advanced multi-agent workflows (if documented)

#### Explicit Phase Rules

- **Authentication**: Allowed starting Phase II
- **Web Frontend**: Allowed starting Phase II
- **Neon PostgreSQL**: Allowed starting Phase II
- **AI/Agent Frameworks**: Allowed starting Phase III (OpenAI Agents SDK, MCP)
- **Cloud Infrastructure**: NOT allowed until Phase IV or later

**RATIONALE**: Phase gating prevents over-engineering, maintains focus on MVP per phase, and enables intentional architecture evolution. Each phase builds on the previous without skipping fundamental constraints.

---

### V. Quality Principles

All code and architecture MUST adhere to:

- **Clean Architecture**: Clear分层 (layering) with separation of concerns—models, services, and interfaces independently testable
- **Stateless Services**: Services SHOULD be stateless where required; state MUST be externalized to database or dedicated storage
- **Separation of Concerns**: Each component has single, well-defined responsibility; no god services or monoliths
- **Cloud-Native Readiness**: Services designed for containerization, horizontal scaling, and resilience from inception

**RATIONALE**: Ensures maintainability, testability, and production readiness across all phases.

---

### VI. Documentation Requirements

All artifacts MUST be documented:

- **Code Documentation**: Public APIs MUST have docstrings; complex logic MUST have inline comments
- **Architecture Decisions**: All significant decisions MUST be captured as ADRs (Architecture Decision Records)
- **User-Facing Docs**: Every feature MUST have usage documentation before release
- **Runbooks**: Operations procedures MUST be documented for deployment, rollback, and incident response

**RATIONALE**: Enables team collaboration, knowledge transfer, and operational excellence.

---

### VII. AI Agent Architecture (Phase III+)

Starting Phase III, AI agents are introduced with strict architectural constraints:

- **MCP-Only Interaction**: AI agents MUST interact with the system exclusively through Model Context Protocol (MCP) tools
- **Stateless Tools**: All MCP tools MUST be stateless; no in-memory state retention between calls
- **Database Persistence**: Conversation context, task state, and all agent memory MUST be persisted in the database
- **Retrievable Context**: Conversation history MUST be queryable and reconstructable from database
- **No Background Autonomy**: AI agents MUST NOT run autonomously in background without explicit user interaction
- **Limited Orchestration**: Multi-agent orchestration is PROHIBITED unless explicitly documented in feature specifications
- **Phase II Preservation**: Authentication, frontend, and database architecture from Phase II remain unchanged

**RATIONALE**: Ensures AI agents are controllable, auditable, and stateless. Database-backed persistence enables horizontal scaling, conversation replay, and multi-session continuity while preventing uncontrolled autonomous behavior.

---

## Development Workflow

### Mandatory Workflow Sequence

Every feature or change MUST proceed through:

1. **Constitution Review**: Verify alignment with core principles
2. **Specification Creation**: Detailed user stories, acceptance criteria, and requirements
3. **Plan Development**: Architectural design, interface contracts, and technology decisions
4. **Task Breakdown**: Atomic work items with clear dependencies and test criteria
5. **Implementation**: Agent execution of approved tasks only
6. **Verification**: Tests pass, acceptance criteria met, documentation complete

### Change Protocol

When deviation from specifications is required:

1. Agent identifies gap or needed refinement
2. Document the proposed change with rationale
3. Route back to appropriate phase (spec/plan/tasks)
4. Obtain approval for updated artifact
5. Continue implementation with approved changes

**No ad-hoc refinement during implementation is permitted.**

---

## Technology Stack Reference

### Phase I: Foundation (In-Memory Console)
- **Language**: Python 3.11+ (console mode)
- **Storage**: In-memory only
- **Interface**: CLI/Terminal

### Phase II: Full-Stack Web Application
- **Backend**: Python REST API (FastAPI)
- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel
- **Frontend**: Next.js (React, TypeScript)
- **Auth**: Better Auth
- **Architecture**: Full-stack web app

### Phase III: AI-Augmented Application
- **AI/Agents**: OpenAI Agents SDK
- **Tooling**: Model Context Protocol (MCP)
- **MCP Server**: Official MCP SDK
- **Conversational Interface**: Stateless chat API
- **State Management**: Database-backed persistence
- **Architecture**: Agent-driven task management

### Phase IV and Later: Advanced Cloud
- **Infrastructure**: Docker, Kubernetes, Kafka, Dapr

**Note**: Each phase builds on the previous. Phase III requires completing Phase II constraints first.

---

## Governance

### Constitution Supremacy

This constitution SUPERSEDES all other practices, conventions, and preferences. In conflicts between this document and any other artifact, this document prevails.

### Amendment Procedure

Amendments require:
1. Documentation of proposed change with rationale
2. Impact analysis across all affected phases
3. Review for consistency with existing principles
4. Version increment per semantic versioning rules

### Versioning Policy

- **MAJOR**: Backward-incompatible governance or principle changes
- **MINOR**: New principles added or material expansions to existing guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

### Compliance Verification

All pull requests and agent executions MUST verify:
- Alignment with constitution principles
- Adherence to required workflow sequence
- Technology stack compliance
- Quality principle adherence

Complexity deviations MUST be documented and justified in the plan phase.

**Version**: 1.2.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2026-01-05
