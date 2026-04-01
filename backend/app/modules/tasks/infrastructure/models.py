"""
SQLAlchemy ORM Models for Tasks Module.

Tables:
    - tasks: Tasks, exams, projects

Following erd.puml specification.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.infrastructure.database import Base

if TYPE_CHECKING:
    from app.modules.users.infrastructure.models import UserModel
    from app.modules.academic_planning.infrastructure.models import SubjectModel
    from app.modules.academic_progress.infrastructure.models import GradeModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# =============================================================================
# Enums (from erd.puml)
# =============================================================================

class TaskStatus(str, enum.Enum):
    """Task status for Kanban board.
    
    Following task_lifecycle_state.puml:
    [*] --> TODO --> InProgress --> Done --> Archived
    """
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    ARCHIVED = "ARCHIVED"


class TaskPriority(str, enum.Enum):
    """Task priority levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TaskCategory(str, enum.Enum):
    """Task category types."""
    TASK = "TASK"
    EXAM = "EXAM"
    PROJECT = "PROJECT"
    READING = "READING"


# =============================================================================
# Model
# =============================================================================

class TaskModel(Base):
    """
    Task model.
    
    Maps to 'tasks' table in database.
    """
    __tablename__ = "tasks"
    
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
    subject_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subjects.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name="task_status"),
        default=TaskStatus.TODO,
        nullable=False,
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority, name="task_priority"),
        default=TaskPriority.MEDIUM,
        nullable=False,
    )
    category: Mapped[TaskCategory] = mapped_column(
        Enum(TaskCategory, name="task_category"),
        default=TaskCategory.TASK,
        nullable=False,
    )
    is_synced_gcal: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    gcal_event_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
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
        back_populates="tasks",
    )
    subject: Mapped[Optional["SubjectModel"]] = relationship(
        "SubjectModel",
        back_populates="tasks",
    )
    grades: Mapped[list["GradeModel"]] = relationship(
        "GradeModel",
        back_populates="task",
    )
    
    def __repr__(self) -> str:
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"
