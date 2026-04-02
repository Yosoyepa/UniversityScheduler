"""
JWT Authentication Middleware.

FastAPI dependencies for JWT authentication.
Extracts and validates JWT token from Authorization header.

Following architecture-patterns skill:
    - Middleware is infrastructure concern
    - Dependencies are injectable (FastAPI Depends)
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.modules.users.infrastructure.token_service import TokenService, get_token_service


# HTTP Bearer security scheme
security = HTTPBearer(auto_error=False)


class AuthenticatedUser:
    """
    Represents the currently authenticated user.
    
    Extracted from a valid JWT token.
    """
    def __init__(self, id: UUID, email: str):
        self.id = id
        self.email = email
    
    def __repr__(self) -> str:
        return f"<AuthenticatedUser(id={self.id}, email={self.email})>"


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    token_service: TokenService = Depends(get_token_service),
) -> AuthenticatedUser:
    """
    FastAPI dependency that extracts and validates the current user from JWT.
    
    Usage:
        @router.get("/me")
        async def get_me(user: AuthenticatedUser = Depends(get_current_user)):
            return {"user_id": user.user_id}
    
    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verify the token
    payload = token_service.verify_access_token(credentials.credentials)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract user info from payload
    try:
        user_id = UUID(payload.get("sub"))
        email = payload.get("email", "")
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return AuthenticatedUser(id=user_id, email=email)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    token_service: TokenService = Depends(get_token_service),
) -> Optional[AuthenticatedUser]:
    """
    Optional authentication - returns None if no token provided.
    
    Useful for endpoints that behave differently for authenticated vs anonymous users.
    """
    if credentials is None:
        return None
    
    payload = token_service.verify_access_token(credentials.credentials)
    
    if payload is None:
        return None
    
    try:
        user_id = UUID(payload.get("sub"))
        email = payload.get("email", "")
        return AuthenticatedUser(id=user_id, email=email)
    except (ValueError, TypeError):
        return None
