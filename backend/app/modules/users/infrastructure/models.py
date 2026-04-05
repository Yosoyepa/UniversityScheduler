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
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.infrastructure.database import Base

if TYPE_CHECKING:
    from app.modules.academic_planning.infrastructure.models import SemesterModel
    from app.modules.tasks.infrastructure.models import TaskModel
    from app.modules.academic_progress.infrastructure.models import GradeModel

import uuid


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
    notifications: Mapped[List["NotificationModel"]] = relationship(
        "NotificationModel",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="NotificationModel.created_at.desc()",
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
    grades: Mapped[List["GradeModel"]] = relationship(
        "GradeModel",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"


class SettingsModel(Base):
    """
    User settings/preferences model.

    Maps to 'settings' table in database.
    1:1 relationship with users. Extended with notification channels
    and reminder timing fields to match mockups and API spec.
    """
    __tablename__ = "settings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    # Appearance
    dark_mode: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    # Notification channels
    email_notifications: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    push_notifications: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    sms_alerts: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    # Reminder timing
    class_reminder_minutes: Mapped[int] = mapped_column(
        Integer,
        default=15,
        nullable=False,
    )
    exam_reminder_days: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )
    assignment_reminder_hours: Mapped[int] = mapped_column(
        Integer,
        default=2,
        nullable=False,
    )
    # Legacy JSONB field for backward compatibility
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


class NotificationModel(Base):
    """
    Persistent notification for a user.

    Maps to 'notifications' table in database.
    Created by domain event listeners (on TaskCompletedEvent, TaskOverdueEvent).
    Displayed in the header bell dropdown.
    """
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    message: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
    )
    related_entity_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
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
    user: Mapped["UserModel"] = relationship(
        "UserModel",
        back_populates="notifications",
    )

    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, type={self.type}, user={self.user_id})>"
