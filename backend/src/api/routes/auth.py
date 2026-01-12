"""Authentication API routes."""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status, Request
from sqlalchemy.orm import Session

from src.database import get_db
from src.services.auth import AuthService
from src.schemas.user import UserCreate, UserSignin, UserResponse, TokenResponse
from src.api.deps import get_auth_service


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def extract_token_from_request(request: Request) -> str | None:
    """Extract JWT token from request cookies or headers."""
    # Try cookie first
    token = request.cookies.get("access_token")
    if token:
        return token

    # Try Authorization header
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]

    return None


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db),
):
    """Register a new user account."""
    auth_service = AuthService(db)

    try:
        user = auth_service.create_user(user_data)
        return auth_service.get_user_response(user)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.post("/signin", response_model=TokenResponse)
async def signin(
    credentials: UserSignin,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate a user and create a session."""
    auth_service = AuthService(db)

    user = auth_service.authenticate_user(credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Create access token
    access_token = auth_service.create_access_token(user.id)

    # Set cookie for web client
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=False,  # Accessible by frontend JS
        secure=False,
        samesite="lax",
        max_age=86400,
    )

    return TokenResponse(
        access_token=access_token,
        user=auth_service.get_user_response(user),
    )


@router.post("/signout")
async def signout(
    response: Response,
):
    """Sign out the current user."""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return {"message": "Successfully signed out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    request: Request,
    db: Session = Depends(get_db),
):
    """Get the current authenticated user's information."""
    token = extract_token_from_request(request)

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

    return auth_service.get_user_response(user)
