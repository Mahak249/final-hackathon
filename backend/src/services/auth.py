"""Authentication service for user management."""
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import bcrypt
from jose import jwt
import os

from src.models.user import User
from src.schemas.user import UserCreate, UserResponse

# JWT settings
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user with hashed password."""
        # Check if user exists
        result = await self.db.execute(select(User).where(User.email == user_data.email))
        existing = result.scalar_one_or_none()
        if existing:
            raise ValueError("Email already registered")

        # Create user with hashed password
        user = User(
            email=user_data.email,
            password_hash=self.hash_password(user_data.password),
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user by email and password."""
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            return None
        if not self.verify_password(password, user.password_hash):
            return None
        return user

    def create_access_token(self, user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode = {
            "sub": user_id,
            "exp": expire,
            "type": "access"
        }
        return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def verify_token(self, token: str) -> Optional[str]:
        """Verify a JWT token and return user ID."""
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return user_id
        except jwt.JWTError:
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    def get_user_response(self, user: User) -> UserResponse:
        """Convert User model to UserResponse schema."""
        return UserResponse(
            id=user.id,
            email=user.email,
            created_at=user.created_at,
        )
