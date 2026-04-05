"""
Application Schemas (DTOs) for User Module.

Pydantic models for request/response validation and serialization.
These are used in the adapter layer (routers) and application layer (use cases).

Following hexagonal architecture:
    - Schemas belong to the application/adapter boundary
    - Domain entities are converted to/from schemas at the adapter layer
    - Never expose domain entities directly from the API
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


# =============================================================================
# User Schemas
# =============================================================================


class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


# Alias kept for backward compatibility with existing auth router
RegisterUserRequest = RegisterRequest


class LoginRequest(BaseModel):
    """Request schema for user login."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh."""
    refresh_token: str


class UserResponse(BaseModel):
    """Response schema for user data."""
    id: UUID
    email: str
    full_name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Response schema for token pair (access + refresh)."""
    access_token: str
    refresh_token: str = ""
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    """Response schema for auth operations (login/register). Wraps user + tokens."""
    user: UserResponse
    tokens: TokenResponse


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


class UpdateProfileRequest(BaseModel):
    """Request schema for updating user profile."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)



# =============================================================================
# Settings Schemas — Aligned with API spec and mockups
# =============================================================================


class SettingsResponse(BaseModel):
    """
    Response schema for user settings.

    Aligned with API spec: GET /api/v1/settings response structure.
    Includes all notification channels and reminder timing fields.
    """
    dark_mode: bool
    email_notifications: bool
    push_notifications: bool
    sms_alerts: bool
    class_reminder_minutes: int
    exam_reminder_days: int
    assignment_reminder_hours: int
    alert_preferences: Dict[str, Any]

    class Config:
        from_attributes = True


class UpdateSettingsRequest(BaseModel):
    """
    Request schema for partial settings update.

    All fields optional — PATCH semantics.
    Constraint ranges match the mockup dropdown options.
    """
    dark_mode: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    sms_alerts: Optional[bool] = None
    # Class Reminders: 5min, 10min, 15min, 30min, 60min
    class_reminder_minutes: Optional[int] = Field(None, ge=5, le=1440)
    # Exam Reminders: 1–30 days before
    exam_reminder_days: Optional[int] = Field(None, ge=1, le=30)
    # Assignment Reminders: 1–72 hours before
    assignment_reminder_hours: Optional[int] = Field(None, ge=1, le=72)
    alert_preferences: Optional[Dict[str, Any]] = None


# =============================================================================
# Notification Schemas
# =============================================================================


class NotificationResponse(BaseModel):
    """Response schema for a single user notification."""
    id: UUID
    type: str
    title: str
    message: str
    is_read: bool
    related_entity_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    """Response schema for a list of notifications."""
    data: List[NotificationResponse]
    unread_count: int


class UnreadCountResponse(BaseModel):
    """Response schema for the bell badge count."""
    unread_count: int
