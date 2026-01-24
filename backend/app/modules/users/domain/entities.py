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
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

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


@dataclass
class Settings:
    """
    User settings value object.
    
    Preferences for the user's experience in the app.
    """
    user_id: UUID
    dark_mode: bool = False
    email_notifications: bool = True
    alert_preferences: dict = field(default_factory=lambda: {
        "days_before": [1],
        "hours_before": [1],
    })
    
    def enable_dark_mode(self) -> None:
        self.dark_mode = True
    
    def disable_dark_mode(self) -> None:
        self.dark_mode = False
    
    def toggle_email_notifications(self) -> None:
        self.email_notifications = not self.email_notifications
