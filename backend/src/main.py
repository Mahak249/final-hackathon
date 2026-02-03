"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load .env first
load_dotenv()  # .env should be in the same folder as main.py or adjust path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database import init_db, close_db  # async DB functions
from src.api.routes import auth, todos, chat
# from src.mcp.server import mcp  # Uncomment if you use MCP

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    await init_db()
    yield
    await close_db()


# Create FastAPI app
app = FastAPI(
    title="Todo API",
    description="REST API for the Todo application",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(chat.router)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Root endpoint
@app.get("/")
async def root():
    return {"name": "Todo API", "version": "1.0.0", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8000"))

    uvicorn.run("src.main:app", host=host, port=port, reload=True)
