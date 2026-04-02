"""
User Domain Entity.

Pure domain entity with business logic, independent of any framework.
The User entity represents a registered user in the system.

Following architecture-patterns skill:
    - Entity has identity (UUID) that persists over time
    - Contains business logic (validate_password concept, not implementation)
    - No framework dependencies (SQLAlchemy, FastAPI, etc.)
"""
from dataclasses import dataclass, field
from typing import Optional
from uuid import UUID

from app.shared.domain.entities import Entity, utc_now
from app.shared.domain.value_objects import Email




@dataclass
class User(Entity):
    """
    User domain entity.
    
    Represents a registered user in the University Scheduler system.
    Contains identity and authentication information.
    
    Attributes:
        email: User's email (validated value object)
        full_name: Display name
        is_active: Whether the user can login
        hashed_password: Password hash (set by infrastructure, not domain concern)
    """
    email: Email = field(default=None)
    full_name: str = ""
    is_active: bool = True
    hashed_password: str = ""  # Infrastructure concern, stored here for convenience
    
    def __post_init__(self):
        """Validate entity invariants."""
        if self.email is None:
            raise ValueError("User must have an email")
        if not self.full_name:
            raise ValueError("User must have a full name")
    
    def deactivate(self) -> None:
        """
        Deactivate user account.
        
        Deactivated users cannot login but their data is preserved.
        """
        self.is_active = False
        self.touch()
    
    def activate(self) -> None:
        """Reactivate a deactivated user account."""
        self.is_active = True
        self.touch()
    
    def can_login(self) -> bool:
        """Check if user is allowed to login."""
        return self.is_active
    
    def update_profile(self, full_name: Optional[str] = None) -> None:
        """Update user profile information."""
        if full_name:
            self.full_name = full_name
            self.touch()
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


def _default_alert_preferences() -> dict:
    return {"days_before": [1], "hours_before": [1]}


@dataclass
class Settings:
    """
    User settings value object.

    Holds all user preferences: appearance, notification channels,
    and reminder timing. Aligned with API spec and mockups.

    Attributes:
        user_id: FK to the owning User entity
        dark_mode: Activate dark theme across the app
        email_notifications: Receive email digests and alerts
        push_notifications: Receive push notifications (future implementation)
        sms_alerts: Receive SMS alerts for critical events (future)
        class_reminder_minutes: Minutes before a class session to remind (default 15)
        exam_reminder_days: Days before an exam due date to remind (default 1)
        assignment_reminder_hours: Hours before assignment deadline to remind (default 2)
        alert_preferences: Legacy JSONB kept for backward-compat.
    """
    user_id: UUID
    # Appearance
    dark_mode: bool = False
    # Notification channels
    email_notifications: bool = True
    push_notifications: bool = True
    sms_alerts: bool = False
    # Reminder timing (matching mockup dropdowns)
    class_reminder_minutes: int = 15
    exam_reminder_days: int = 1
    assignment_reminder_hours: int = 2
    # Legacy field — kept for backward compatibility
    alert_preferences: dict = field(default_factory=_default_alert_preferences)

    def enable_dark_mode(self) -> None:
        self.dark_mode = True

    def disable_dark_mode(self) -> None:
        self.dark_mode = False

    def toggle_email_notifications(self) -> None:
        self.email_notifications = not self.email_notifications


# =============================================================================
# Notification Entity
# =============================================================================

NOTIFICATION_TYPE_TASK_COMPLETED = "TASK_COMPLETED"
NOTIFICATION_TYPE_TASK_OVERDUE = "TASK_OVERDUE"
NOTIFICATION_TYPE_SYSTEM = "SYSTEM"


@dataclass
class Notification(Entity):
    """
    Persistent notification for a user.

    Created by domain event listeners (NotificationListener) and displayed
    in the header bell dropdown. Supports read/unread state.

    Attributes:
        user_id: The user this notification belongs to
        type: One of TASK_COMPLETED, TASK_OVERDUE, SYSTEM
        title: Short headline for the notification
        message: Full notification body text
        is_read: Whether the user has acknowledged this notification
        related_entity_id: Optional FK to related entity (e.g. task_id)
    """
    user_id: UUID = field(default=None)
    type: str = NOTIFICATION_TYPE_SYSTEM
    title: str = ""
    message: str = ""
    is_read: bool = False
    related_entity_id: Optional[UUID] = None

    def __post_init__(self):
        if not self.user_id:
            raise ValueError("Notification must have a user_id")
        if not self.title:
            raise ValueError("Notification must have a title")

    def mark_as_read(self) -> None:
        """Mark this notification as read."""
        self.is_read = True
        self.touch()

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.type}, user={self.user_id})>"
