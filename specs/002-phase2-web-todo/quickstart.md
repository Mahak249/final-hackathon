# Quickstart: Phase II Full-Stack Todo Application

**Feature**: Phase II Full-Stack Todo Web Application
**Date**: 2025-12-31

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| PostgreSQL | 14+ | Database client |
| Git | Any | Version control |

## Environment Setup

### 1. Clone and Checkout

```bash
git checkout 002-phase2-web-todo
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your settings (see Environment Variables below)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your settings
```

### 4. Database Setup (Neon PostgreSQL)

#### Option A: Neon Cloud

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. Add to your `.env` files

#### Option B: Local PostgreSQL

```bash
# Create database
createdb todo_app

# Or using psql
psql -U postgres -c "CREATE DATABASE todo_app;"
```

### 5. Environment Variables

#### Backend (`.env`)

```bash
# Database connection (Neon or local)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Server settings
BACKEND_HOST="127.0.0.1"
BACKEND_PORT=8000

# Auth settings
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

#### Frontend (`.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
```

## Running the Application

### 1. Start the Backend

```bash
# In backend directory (with venv activated)
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at**: `http://localhost:8000`
**API Documentation**: `http://localhost:8000/docs`

### 2. Start the Frontend

```bash
# In frontend directory
npm run dev
```

**Frontend will be available at**: `http://localhost:3000`

### 3. Access the Application

1. Open browser to `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Sign in with your new credentials
4. Start adding todos!

## Development Workflow

### Database Migrations

```bash
# Generate a new migration after model changes
alembic revision --autogenerate -m "description of changes"

# Apply pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show current migration version
alembic current
```

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Formatting

```bash
# Backend
cd backend
black src/
isort src/

# Frontend
cd frontend
npm run format
```

## Project Structure

```
todo-app/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── api/           # Routes and controllers
│   │   ├── models/        # SQLModel entities
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── tests/             # Backend tests
│   ├── alembic/           # Database migrations
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API client
│   │   └── types/        # TypeScript types
│   ├── tests/            # Frontend tests
│   ├── package.json      # Node dependencies
│   └── .env.example      # Environment template
└── README.md
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PID> /F
```

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Neon firewall settings allow your IP
3. Ensure `sslmode=require` for Neon

### Module Not Found Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt
# or
npm install
```

### CORS Errors

Ensure frontend URL is in CORS origins in backend config:
```python
# In backend/src/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Next Steps

1. Review the [Specification](./spec.md)
2. Review the [Plan](./plan.md)
3. Run `/sp.tasks` to generate implementation tasks
4. Start implementing following the task order
