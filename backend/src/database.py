import os
import ssl
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

from dotenv import load_dotenv
load_dotenv()  # Ensure .env is loaded

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables!")

# Convert DATABASE_URL to use asyncpg driver for async support
# This handles various formats: postgresql://, postgresql+psycopg2://, postgres://
if DATABASE_URL.startswith("postgresql+psycopg2://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

# Handle parameters that asyncpg doesn't support (psycopg2-specific params)
# Parse URL and remove incompatible params, handle SSL via connect_args
parsed = urlparse(DATABASE_URL)
query_params = parse_qs(parsed.query)

# Extract and remove psycopg2-specific parameters that asyncpg doesn't understand
ssl_mode = query_params.pop('sslmode', [None])[0]
query_params.pop('channel_binding', None)  # Not supported by asyncpg
query_params.pop('connect_timeout', None)  # Different handling in asyncpg
query_params.pop('application_name', None)  # Can cause issues

# Rebuild URL without incompatible parameters
new_query = urlencode({k: v[0] for k, v in query_params.items()})
DATABASE_URL = urlunparse((
    parsed.scheme, parsed.netloc, parsed.path,
    parsed.params, new_query, parsed.fragment
))

# Prepare connect_args for SSL if needed
connect_args = {}
if ssl_mode and ssl_mode != 'disable':
    # Create SSL context for asyncpg
    ssl_context = ssl.create_default_context()
    if ssl_mode == 'require':
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
    connect_args['ssl'] = ssl_context

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=True,
    future=True,
    connect_args=connect_args,
)

# Async session
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Dependency for routes
async def get_async_db():
    async with async_session() as session:
        yield session

# Initialize DB
async def init_db():
    from src.models.user import User
    from src.models.todo import Todo
    from src.models.conversation import Conversation, Message

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

# Close DB (engine cleanup)
async def close_db():
    await engine.dispose()
