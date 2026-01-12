"""FastAPI application entry point."""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.database import init_db
from src.api.routes import auth, todos, chat
from src.mcp.server import mcp

@asynccontextmanager
async def lifespan(app: FastAPI):

    """Application lifespan handler."""
    # Startup
    init_db()
    yield
    # Shutdown


# Create FastAPI application
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

# Mount MCP Server (this enables SSE transport at /sse)
# mcp.mount_to_fastapi(app, path="/sse")
# TODO: FastMCP 1.2.0 does not support mount_to_fastapi. Need to implement custom SSE adapter.




@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Todo API",
        "version": "1.0.0",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8000"))

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
    )
