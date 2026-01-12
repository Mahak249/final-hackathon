# Data Model: Phase II Full-Stack Todo Web Application

**Feature**: Phase II Full-Stack Todo Web Application
**Date**: 2025-12-31

## Overview

This document defines the database schema for the Phase II todo application. The data model consists of two main entities: User and Todo, with a one-to-many relationship between them.

## Entity Relationship Diagram

```
┌─────────────┐       1:N       ┌─────────────┐
│    User     │───────────────▶│     Todo    │
├─────────────┤                ├─────────────┤
│ id (PK)     │                │ id (PK)     │
│ email       │                │ user_id (FK)│
│ password    │                │ title       │
│ created_at  │                │ description │
│ updated_at  │                │ completed   │
└─────────────┘                │ created_at  │
                               │ updated_at  │
                               └─────────────┘
```

## User Entity

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    todos: List["Todo"] = Relationship(back_populates="user", cascade_delete=True)
```

### Database Schema (PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

### Field Definitions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL, indexed | User's email address (login identifier) |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | When the account was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the account was last updated |

---

## Todo Entity

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

class Todo(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", on_delete="CASCADE", index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None, nullable=True)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship
    user: "User" = Relationship(back_populates="todos")
```

### Database Schema (PostgreSQL)

```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(user_id, completed);
```

### Field Definitions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for the todo |
| user_id | UUID | NOT NULL, FK REFERENCES users(id), indexed | Owner of the todo |
| title | VARCHAR(500) | NOT NULL | Todo title (required) |
| description | TEXT | NULLABLE | Optional todo details |
| completed | BOOLEAN | DEFAULT FALSE | Completion status |
| created_at | TIMESTAMP | DEFAULT NOW() | When the todo was created |
| updated_at | TIMESTAMP | DEFAULT NOW() | When the todo was last updated |

---

## Validation Rules

### User Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| email | Must be valid email format | "Invalid email format" |
| email | Must be unique | "Email already registered" |
| email | Max 255 characters | "Email too long" |
| password | Min 8 characters | "Password must be at least 8 characters" |
| password | Max 128 characters | "Password too long" |

### Todo Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required | "Title is required" |
| title | Max 500 characters | "Title too long (max 500 characters)" |
| title | Min 1 character | "Title cannot be empty" |
| description | Max 10,000 characters | "Description too long" |

---

## State Transitions

### Todo State Machine

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ┌─────────┐     ┌─────────┐     ┌─────────┐    │
│     │ CREATE  │────▶│ ACTIVE  │────▶│COMPLETED│    │
│     └─────────┘     └────┬────┘     └────┬────┘    │
│                          │               │         │
│                          │               │         │
│                          │      ┌────────┘         │
│                          │      │                  │
│                          ▼      ▼                  │
│                     ┌─────────┐                    │
│                     │ INACTIVE│◀───────────────────┘
│                     │(reopen) │
│                     └─────────┘
│
└─────────────────────────────────────────────────────┘
```

**Valid Transitions**:
- CREATE → ACTIVE (initial state is ACTIVE)
- ACTIVE → COMPLETED (mark done)
- COMPLETED → INACTIVE (reopen task)
- INACTIVE → COMPLETED (mark done again)

**Note**: The `completed` boolean field represents the state. When `completed=false`, the todo is ACTIVE. When `completed=true`, the todo is COMPLETED.

---

## Pydantic Schemas (API Layer)

### Request Schemas

```python
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Auth
class UserCreate(BaseModel):
    email: EmailStr
    password: str  # Min 8, max 128 chars

class UserSignin(BaseModel):
    email: EmailStr
    password: str

# Todos
class TodoCreate(BaseModel):
    title: str  # Min 1, max 500 chars
    description: Optional[str] = None  # Max 10000 chars

class TodoUpdate(BaseModel):
    title: Optional[str] = None  # Min 1, max 500 chars
    description: Optional[str] = None  # Max 10000 chars

class TodoToggle(BaseModel):
    completed: bool
```

### Response Schemas

```python
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserResponse(BaseModel):
    id: UUID
    email: str
    created_at: datetime

class TodoResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    completed: bool
    created_at: datetime
    updated_at: datetime

class TodoListResponse(BaseModel):
    todos: list[TodoResponse]
    total: int
```

---

## Index Strategy

| Index | Columns | Type | Purpose |
|-------|---------|------|---------|
| idx_users_email | email | Unique | Fast email lookup for auth |
| idx_todos_user_id | user_id | Regular | Filter todos by owner |
| idx_todos_completed | user_id, completed | Composite | Filter + sort by completion |

---

## Cascade Rules

| Operation | Behavior |
|-----------|----------|
| Delete User | All associated todos are deleted (ON DELETE CASCADE) |
| Delete Todo | Only the specific todo is removed |
| Update User ID | Todos' user_id automatically updated |

---

## Migration Strategy

### Initial Migration (Alembic)

```python
# alembic/versions/001_initial_migration.py

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=func.gen_random_uuid()),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=func.now()),
        sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=func.now()),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

def downgrade():
    op.drop_index('idx_users_email', table_name='users')
    op.drop_table('users')
```
