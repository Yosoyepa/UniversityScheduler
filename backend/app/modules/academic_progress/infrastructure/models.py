"""
SQLAlchemy ORM Models for Academic Progress Module.

Tables:
    - evaluation_criteria: grading rubric items per subject
    - grades: individual scores per evaluation criteria

Following erd.puml specification and tasks/infrastructure/models.py pattern:
- SQLAlchemy 2.0 style: Mapped[type] + mapped_column()
- Separate ORM models from domain entities (never mix)
- TYPE_CHECKING imports to avoid circular dependency
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.infrastructure.database import Base

if TYPE_CHECKING:
    from app.modules.users.infrastructure.models import UserModel
    from app.modules.academic_planning.infrastructure.models import SubjectModel
    from app.modules.tasks.infrastructure.models import TaskModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# =============================================================================
# Enums
# =============================================================================

class GradeCategory(str, enum.Enum):
    """Mirrors task_category for EvaluationCriteria → Task category linking."""
    TASK = "TASK"
    EXAM = "EXAM"
    PROJECT = "PROJECT"
    READING = "READING"


# =============================================================================
# EvaluationCriteriaModel
# =============================================================================

class EvaluationCriteriaModel(Base):
    """
    Grading rubric item per subject.

    Maps to 'evaluation_criteria' table in database.
    Each row represents one scored component (e.g. 'Parcial 1' = 30%).
    """
    __tablename__ = "evaluation_criteria"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    weight: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
    category: Mapped[Optional[GradeCategory]] = mapped_column(
        Enum(GradeCategory, name="grade_category"),
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
    subject: Mapped["SubjectModel"] = relationship(
        "SubjectModel",
        back_populates="evaluation_criteria",
    )
    grades: Mapped[list["GradeModel"]] = relationship(
        "GradeModel",
        back_populates="criteria",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<EvaluationCriteria(id={self.id}, name={self.name}, weight={self.weight})>"


# =============================================================================
# GradeModel
# =============================================================================

class GradeModel(Base):
    """
    Individual score record for a student's evaluation criteria.

    Maps to 'grades' table in database.
    Links a user's score on a specific evaluation criteria.
    Optionally linked to a Task (e.g. exam task) for traceability.
    """
    __tablename__ = "grades"

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
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subjects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    criteria_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("evaluation_criteria.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    task_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("tasks.id", ondelete="SET NULL"),
        nullable=True,
    )
    score: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
    max_score: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=5.0,
    )
    graded_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    notes: Mapped[Optional[str]] = mapped_column(
        Text,
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
        back_populates="grades",
    )
    subject: Mapped["SubjectModel"] = relationship(
        "SubjectModel",
        back_populates="grades",
    )
    criteria: Mapped[Optional["EvaluationCriteriaModel"]] = relationship(
        "EvaluationCriteriaModel",
        back_populates="grades",
    )
    task: Mapped[Optional["TaskModel"]] = relationship(
        "TaskModel",
        back_populates="grades",
    )

    def __repr__(self) -> str:
        return f"<Grade(id={self.id}, score={self.score}/{self.max_score})>"
