"""
JWT Token Service.

Infrastructure service for creating and verifying JWT tokens.
Handles access tokens and refresh tokens.

Following architecture-patterns skill:
    - Infrastructure service (not domain)
    - Can be mocked for testing
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from jose import JWTError, jwt

from app.config import get_settings


settings = get_settings()


class TokenService:
    """
    JWT token management service.
    
    Creates and verifies access and refresh tokens.
    """
    
    def __init__(
        self,
        secret_key: str = settings.SECRET_KEY,
        algorithm: str = settings.ALGORITHM,
        access_expire_minutes: int = settings.ACCESS_TOKEN_EXPIRE_MINUTES,
        refresh_expire_days: int = 7,
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.access_expire_minutes = access_expire_minutes
        self.refresh_expire_days = refresh_expire_days
    
    def create_access_token(self, user_id: UUID, email: str) -> str:
        """
        Create a JWT access token.
        
        Args:
            user_id: User's UUID
            email: User's email
            
        Returns:
            JWT access token string
        """
        expire = datetime.now(timezone.utc) + timedelta(minutes=self.access_expire_minutes)
        to_encode = {
            "sub": str(user_id),
            "email": email,
            "type": "access",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def create_refresh_token(self, user_id: UUID) -> str:
        """
        Create a JWT refresh token.
        
        Refresh tokens have longer expiry and fewer claims.
        
        Args:
            user_id: User's UUID
            
        Returns:
            JWT refresh token string
        """
        expire = datetime.now(timezone.utc) + timedelta(days=self.refresh_expire_days)
        to_encode = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
    
    def verify_access_token(self, token: str) -> Optional[dict]:
        """
        Verify and decode an access token.
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload if valid, None if invalid or expired
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != "access":
                return None
            return payload
        except JWTError:
            return None
    
    def verify_refresh_token(self, token: str) -> Optional[UUID]:
        """
        Verify a refresh token and extract user ID.
        
        Args:
            token: JWT refresh token
            
        Returns:
            User UUID if valid, None if invalid or expired
        """
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            if payload.get("type") != "refresh":
                return None
            return UUID(payload.get("sub"))
        except (JWTError, ValueError):
            return None
    
    def get_access_token_expire_seconds(self) -> int:
        """Get access token expiry in seconds for API responses."""
        return self.access_expire_minutes * 60


# Singleton instance
_token_service = TokenService()


def get_token_service() -> TokenService:
    """Get the token service instance. Used for FastAPI Depends."""
    return _token_service
