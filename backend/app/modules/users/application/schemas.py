"""
Authentication Pydantic Schemas (DTOs).

Data Transfer Objects for API request/response validation.
These are the "contract" between the API and the outside world.

Following defensive_programming skill:
    - Validate input immediately (Pydantic does this)
    - Fail-fast with clear error messages
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


# =============================================================================
# Request Schemas (Input)
# =============================================================================

class RegisterUserRequest(BaseModel):
    """Request body for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=255)
    
    @field_validator('password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        """Validate password has minimum complexity."""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


class LoginRequest(BaseModel):
    """Request body for user login."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Request body for token refresh."""
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    """Request body for profile update."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)


# =============================================================================
# Response Schemas (Output)
# =============================================================================

class UserResponse(BaseModel):
    """User data returned in API responses."""
    id: UUID
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT tokens returned after login/register."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Access token expiry in seconds")


class AuthResponse(BaseModel):
    """Full response after login/register including user and tokens."""
    user: UserResponse
    tokens: TokenResponse


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


# =============================================================================
# Settings Schemas
# =============================================================================

class SettingsResponse(BaseModel):
    """User settings response."""
    dark_mode: bool
    email_notifications: bool
    alert_preferences: dict
    
    model_config = {"from_attributes": True}


class UpdateSettingsRequest(BaseModel):
    """Request to update user settings."""
    dark_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None
    alert_preferences: Optional[dict] = None
