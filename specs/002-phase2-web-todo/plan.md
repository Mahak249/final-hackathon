# Implementation Plan: Phase II Full-Stack Todo Web Application

**Branch**: `002-phase2-web-todo` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-phase2-web-todo/spec.md`

## Summary

This plan defines the technical architecture for Phase II: a full-stack web todo application with user authentication. The application will use FastAPI for the backend REST API, Neon Serverless PostgreSQL for data persistence, Next.js for the frontend, and Better Auth for authentication. All todo data will be isolated per authenticated user.

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Pydantic, Next.js 14+, React, Better Auth
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (backend), Jest/Vitest (frontend)
**Target Platform**: Web browser (desktop + mobile)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: API responses < 500ms, page loads < 2 seconds
**Constraints**: No AI, no agents, no background workers, no future phase features
**Scale/Scope**: Single-user focus, no multi-tenancy

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase Gate Verification

| Gate | Requirement | Status | Notes |
|------|-------------|--------|-------|
| Phase II Allowed | FastAPI, Neon PostgreSQL, Next.js, Better Auth | ✅ PASS | All technologies permitted in Phase II |
| Phase I Forbidden | In-memory only, no persistence | ✅ N/A | Phase I complete, Phase II builds on it |
| Phase III Forbidden | AI/Agents, Cloud Infrastructure | ✅ PASS | Not used in this plan |
| Clean Architecture | Models, services, interfaces | ✅ PASS | Layered structure defined |
| Stateless Services | State externalized to DB | ✅ PASS | No server-side session state |
| Separation of Concerns | Single responsibility per component | ✅ PASS | Backend/frontend separated |

**Result**: All constitution gates pass. Ready for design.

---

## Backend Plan

### Backend Framework Responsibility (REST API)

The FastAPI backend will handle:
- HTTP request routing and handling
- Request validation using Pydantic models
- Response serialization to JSON
- Authentication middleware integration
- Error handling and status code mapping
- CORS configuration for frontend communication

**Framework Choice Rationale**:
- FastAPI provides automatic OpenAPI documentation
- Native async support for scalability
- Pydantic integration for validation
- Type hints enable IDE support and reduced errors

### API Routing and Controller Structure

```
backend/src/
├── api/
│   ├── __init__.py
│   ├── deps.py           # Dependencies (auth, database)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py       # Signup, signin, signout
│   │   └── todos.py      # CRUD + toggle operations
│   └── main.py           # Application entry point
├── models/
│   ├── __init__.py
│   ├── user.py           # User SQLModel
│   └── todo.py           # Todo SQLModel
├── schemas/
│   ├── __init__.py
│   ├── user.py           # User Pydantic schemas
│   └── todo.py           # Todo Pydantic schemas
└── services/
    ├── __init__.py
    ├── auth.py           # Authentication logic
    └── todo.py           # Todo business logic
```

**Route Organization**:
- Authentication routes: `/api/auth/` prefix
- Todo routes: `/api/todos/` prefix
- Health check: `/health`

### Authentication Integration (Better Auth)

Better Auth will provide:
- Email/password authentication flow
- Session management
- User registration
- User signin/signout

**Integration Approach**:
1. Better Auth handles credential validation
2. Backend creates session tokens on successful auth
3. Frontend stores session (cookie or localStorage)
4. Protected endpoints validate session on each request

**Session Strategy**:
- HTTP-only cookies for security
- Session token includes user ID claim
- Tokens validated on each API call

### Data Persistence (Neon PostgreSQL)

**Connection Strategy**:
- SQLModel for ORM and schema definition
- Environment variables for connection string
- Connection pooling via SQLModel/SQLAlchemy
- Neon serverless driver for optimal performance

**Database Location**:
- Neon cloud PostgreSQL instance
- Connection via DATABASE_URL environment variable

### User-to-Do Data Ownership Handling

**Ownership Enforcement**:
1. Every todo record includes `user_id` foreign key
2. All todo queries filter by `user_id` from session
3. Update/delete operations verify ownership before execution
4. Cross-user access returns 404 (not 403) for security

**Query Pattern**:
```python
# All queries include user_id filter
todos = session.query(Todo).filter(Todo.user_id == current_user.id).all()
```

### Error Handling and Validation Approach

**Error Categories**:
| Error Type | HTTP Status | Handling |
|------------|-------------|----------|
| Validation error | 422 | Return field-specific errors |
| Authentication required | 401 | Redirect to signin |
| Resource not found | 404 | Generic "not found" message |
| Resource not owned | 404 | Generic "not found" (security) |
| Conflict (duplicate) | 409 | Detail the conflict |
| Server error | 500 | Generic error, log details |

**Validation**:
- Pydantic models validate all input
- Custom validators for business rules
- Clear error messages in JSON format

---

## Frontend Plan

### Next.js Application Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── signup/page.tsx
│   │   │   └── signin/page.tsx
│   │   ├── (dashboard)/        # Protected route group
│   │   │   ├── layout.tsx      # Auth state check
│   │   │   └── page.tsx        # Todos list
│   │   ├── api/                # API routes (if needed)
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   ├── todo/               # Todo-specific components
│   │   └── auth/               # Auth-specific components
│   ├── lib/
│   │   ├── api.ts              # API client
│   │   └── auth.ts             # Auth utilities
│   └── types/
│       └── index.ts            # TypeScript types
├── public/
└── tests/
```

**Structure Rationale**:
- Route groups separate auth and dashboard
- App Router for modern Next.js patterns
- Shared components in dedicated directories

### Page-Level Routing

| Path | Page | Auth Required | Purpose |
|------|------|---------------|---------|
| `/signup` | Signup | No | User registration |
| `/signin` | Signin | No | User authentication |
| `/` | Todos | Yes | View, add, edit, delete todos |

**Navigation Rules**:
- Unauthenticated users accessing `/` redirect to `/signin`
- Authenticated users accessing `/signup` or `/signin` redirect to `/`
- Signout clears session and redirects to `/signin`

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `TodoList` | Display all todos for user |
| `TodoItem` | Individual todo with actions |
| `TodoForm` | Create/edit todo modal or inline |
| `AuthForm` | Signup/signin form with validation |
| `Layout` | Navigation, auth state display |

**Component Pattern**:
- Server components where possible
- Client components for interactivity
- Prop-driven data flow

### API Communication Strategy

**API Client Pattern**:
```typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export const api = {
  todos: {
    list: () => request<Todo[]>('/api/todos'),
    create: (data: CreateTodo) => request<Todo>('/api/todos', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateTodo) => request<Todo>(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<void>(`/api/todos/${id}`, { method: 'DELETE' }),
    toggle: (id: string, completed: boolean) => request<Todo>(`/api/todos/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
  },
  auth: {
    signup: (data: SignupData) => request<User>('/api/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
    signin: (data: SigninData) => request<Session>('/api/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
    signout: () => request<void>('/api/auth/signout', { method: 'POST' }),
  },
};
```

### Authentication State Handling

**State Management**:
- React Context for auth state
- Provider wraps protected routes
- State includes: user, isAuthenticated, isLoading

**Token Storage**:
- HTTP-only cookie (preferred for security)
- Fallback to sessionStorage if needed

**Auth Flow**:
1. App loads, check for existing session
2. If session exists, validate with backend
3. If valid, set auth state, show dashboard
4. If invalid/expired, redirect to signin
5. On signout, clear session, redirect to signin

### Responsive UI Strategy

**Approach**:
- Mobile-first CSS (Tailwind CSS recommended)
- Flexbox and Grid for layouts
- Breakpoints: sm (640px), md (768px), lg (1024px)

**Responsive Components**:
- Todo list: Stack on mobile, grid on desktop
- Navigation: Hamburger menu on mobile, visible on desktop
- Forms: Full width on mobile, constrained on desktop

---

## Database Plan

### User Data Model

```sql
-- PostgreSQL schema (SQLModel will generate this)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
```

**Field Details**:
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User identifier for login |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last profile update |

### Todo Data Model

```sql
-- PostgreSQL schema (SQLModel will generate this)
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(user_id, completed);
```

**Field Details**:
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| id | UUID | PRIMARY KEY | Unique todo identifier |
| user_id | UUID | NOT NULL, REFERENCES users | Ownership link |
| title | VARCHAR(500) | NOT NULL | Todo title (required) |
| description | TEXT | NULLABLE | Optional details |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last modification |

### Relationship Between User and Todo

**Relationship Type**: One-to-Many
- One User can have Many Todos
- Each Todo belongs to exactly One User
- Cascade delete: When user is deleted, all their todos are deleted

**SQLModel Definition**:
```python
class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    todos: list["Todo"] = Relationship(back_populates="user", cascade_delete=True)

class Todo(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", on_delete="CASCADE", index=True)
    title: str
    description: str | None = None
    completed: bool = False
    user: "User" = Relationship(back_populates="todos")
```

### Migration or Schema Management Approach

**Strategy**: SQLModel with Alembic migrations

**Workflow**:
1. Define models in code (SQLModel)
2. Generate initial migration with Alembic
3. Apply migrations on deployment
4. Future changes: create new migrations

**Migration Commands**:
```bash
# Generate migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

**Development**: Auto-generate schema from models for rapid iteration

---

## Integration Plan

### Frontend ↔ Backend Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ Auth Pages  │    │ Todo Pages  │    │ API Client      │  │
│  │ (/signup,   │───▶│ (/todos)    │───▶│ (fetch wrapper) │  │
│  │  /signin)   │    │             │    │                 │  │
│  └─────────────┘    └─────────────┘    └────────┬────────┘  │
└─────────────────────────────────────────────────────────────┘
                                                    │
                                                    │ HTTP/JSON
                                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │
│  │ Auth Routes │    │ Todo Routes │    │ Auth Middleware │  │
│  │ /api/auth/  │    │ /api/todos/ │    │ (session check) │  │
│  └──────┬──────┘    └──────┬──────┘    └─────────────────┘  │
│         │                  │                                  │
│         ▼                  ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              SQLModel + Neon PostgreSQL              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Communication Pattern**:
1. Frontend calls REST API endpoints
2. Backend validates session via middleware
3. Database operations via SQLModel
4. Responses serialized to JSON
5. Frontend updates UI state

### Auth Token/Session Flow

**Signup Flow**:
```
1. User submits signup form
2. Frontend → POST /api/auth/signup {email, password}
3. Backend validates, creates user, returns success
4. Frontend redirects to signin
```

**Signin Flow**:
```
1. User submits signin form
2. Frontend → POST /api/auth/signin {email, password}
3. Backend validates credentials, creates session
4. Backend returns session cookie + user data
5. Frontend stores session, redirects to todos
```

**Authenticated Request Flow**:
```
1. Frontend makes API call (e.g., GET /api/todos)
2. Browser automatically includes session cookie
3. Backend middleware extracts and validates session
4. If valid: proceed with request
5. If invalid: return 401
6. Frontend handles 401 → redirect to signin
```

**Signout Flow**:
```
1. User clicks signout
2. Frontend → POST /api/auth/signout
3. Backend invalidates session, returns success
4. Frontend clears local state, redirects to signin
```

### Local Development Setup

**Prerequisites**:
- Python 3.11+
- Node.js 18+
- PostgreSQL-compatible client (psql or GUI)

**Environment Variables** (`.env`):
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Backend
BACKEND_HOST="127.0.0.1"
BACKEND_PORT=8000
JWT_SECRET="your-jwt-secret-change-in-production"

# Frontend
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

**Development Workflow**:
```bash
# 1. Start backend
cd backend
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# 2. Start frontend (separate terminal)
cd frontend
npm run dev

# 3. Access application
# Frontend: http://localhost:3000
# Backend API docs: http://localhost:8000/docs
```

**Database Setup**:
```bash
# Create database (Neon console or local)
# Run migrations
alembic upgrade head

# Or for development: auto-create tables
SQLModel.metadata.create_all(engine)
```

---

## Project Structure

### Documentation (this feature)

```text
specs/002-phase2-web-todo/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (technology decisions)
├── data-model.md        # Phase 1 output (database models)
├── quickstart.md        # Phase 1 output (development guide)
├── contracts/           # Phase 1 output (API specifications)
│   ├── auth.yaml        # Authentication API contract
│   └── todos.yaml       # Todo API contract
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
todo-app/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   ├── routes/
│   │   │   │   ├── auth.py
│   │   │   │   └── todos.py
│   │   │   └── main.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   └── todo.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   └── todo.py
│   │   └── services/
│   │       ├── auth.py
│   │       └── todo.py
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── contract/
│   ├── alembic/
│   │   └── versions/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── signup/
│   │   │   │   └── signin/
│   │   │   ├── (dashboard)/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── todo/
│   │   │   └── auth/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── auth.ts
│   │   └── types/
│   ├── public/
│   ├── tests/
│   ├── .env.example
│   └── package.json
├── .env.example
└── README.md
```

**Structure Decision**: Web application with separate backend and frontend directories. This aligns with Phase II architecture requirements and enables independent scaling and deployment.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Two projects (backend + frontend) | Required by Phase II architecture spec | N/A - full-stack requires separation |
| JWT/session tokens | Better Auth requires token-based auth | Cookie-only insufficient for API access |

---

## Follow-Up Actions

- [ ] Run `/sp.tasks` to generate implementation tasks
- [ ] Set up Neon PostgreSQL database
- [ ] Initialize backend project structure
- [ ] Initialize frontend project structure
- [ ] Configure environment variables
- [ ] Begin implementation following task order
