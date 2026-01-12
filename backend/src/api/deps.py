"""API dependencies for dependency injection."""
from typing import Generator, Optional

from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.auth import AuthService
from src.models.user import User


async def get_current_user(
    token: Optional[str] = None,
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user from JWT token."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    auth_service = AuthService(db)
    user_id = auth_service.verify_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = auth_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_user_from_cookie(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user from cookie."""
    print(f"DEBUG: Headers: {request.headers}")
    token = request.cookies.get("access_token")
    print(f"DEBUG: Cookie token: {token}")

    if not token:
        # Try Authorization header as fallback
        auth_header = request.headers.get("Authorization")
        print(f"DEBUG: Auth Header: {auth_header}")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            print(f"DEBUG: Header token: {token}")
        else:
            print("DEBUG: No token found")
            msg = f"Not authenticated. Headers: {request.headers}"
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=msg,
                headers={"WWW-Authenticate": "Bearer"},
            )

    return await get_current_user(token, db)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """Dependency to get AuthService instance."""
    return AuthService(db)
