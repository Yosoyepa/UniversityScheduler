"""
SQLAlchemy ORM Models for Users Module.

Tables:
    - users: User accounts
    - settings: User preferences (1:1 relationship with users)

Following erd.puml specification.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    String,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.infrastructure.database import Base

if TYPE_CHECKING:
    from app.modules.academic_planning.infrastructure.models import SemesterModel
    from app.modules.tasks.infrastructure.models import TaskModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class UserModel(Base):
    """
    User account model.
    
    Maps to 'users' table in database.
    """
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )
    
    # Relationships
    settings: Mapped[Optional["SettingsModel"]] = relationship(
        "SettingsModel",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    semesters: Mapped[List["SemesterModel"]] = relationship(
        "SemesterModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[List["TaskModel"]] = relationship(
        "TaskModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


class SettingsModel(Base):
    """
    User settings/preferences model.
    
    Maps to 'settings' table in database.
    1:1 relationship with users.
    """
    __tablename__ = "settings"
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    dark_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    email_notifications: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    alert_preferences: Mapped[dict] = mapped_column(
        JSONB,
        server_default='{"days_before": [1], "hours_before": [1]}',
        nullable=False,
    )
    
    # Relationships
    user: Mapped["UserModel"] = relationship(
        "UserModel",
        back_populates="settings",
    )
    
    def __repr__(self) -> str:
        return f"<Settings(user_id={self.user_id})>"
