"""
SQLAlchemy ORM Models for Academic Planning Module.

Tables:
    - semesters: Academic semesters
    - subjects: Courses/subjects within a semester
    - class_sessions: Weekly class time blocks

Following erd.puml specification.
"""
from __future__ import annotations

import enum
import uuid
from datetime import datetime, date, time, timezone
from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.infrastructure.database import Base

if TYPE_CHECKING:
    from app.modules.users.infrastructure.models import UserModel
    from app.modules.tasks.infrastructure.models import TaskModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


# =============================================================================
# Enums (from erd.puml)
# =============================================================================

class DifficultyLevel(str, enum.Enum):
    """Difficulty level for subjects."""
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class SubjectType(str, enum.Enum):
    """Type of subject/course."""
    DISCIPLINAR_OBLIGATORIA = "DISCIPLINAR_OBLIGATORIA"
    DISCIPLINAR_OPTATIVA = "DISCIPLINAR_OPTATIVA"
    FUNDAMENTAL_OBLIGATORIA = "FUNDAMENTAL_OBLIGATORIA"
    FUNDAMENTAL_OPTATIVA = "FUNDAMENTAL_OPTATIVA"
    LIBRE_ELECCION = "LIBRE_ELECCION"
    TRABAJO_DE_GRADO = "TRABAJO_DE_GRADO"


# =============================================================================
# Models
# =============================================================================

class SemesterModel(Base):
    """
    Academic semester model.
    
    Maps to 'semesters' table in database.
    """
    __tablename__ = "semesters"
    
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
    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    start_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    end_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
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
    user: Mapped["UserModel"] = relationship(
        "UserModel",
        back_populates="semesters",
    )
    subjects: Mapped[List["SubjectModel"]] = relationship(
        "SubjectModel",
        back_populates="semester",
        cascade="all, delete-orphan",
    )
    
    def __repr__(self) -> str:
        return f"<Semester(id={self.id}, name={self.name})>"


class SubjectModel(Base):
    """
    Subject/course model.
    
    Maps to 'subjects' table in database.
    """
    __tablename__ = "subjects"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    semester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("semesters.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )
    group_code: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    credits: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )
    color: Mapped[str] = mapped_column(
        String(7),
        default="#3b82f6",
        nullable=False,
    )
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel, name="difficulty_level"),
        default=DifficultyLevel.MEDIUM,
        nullable=False,
    )
    type: Mapped[SubjectType] = mapped_column(
        Enum(SubjectType, name="subject_type"),
        nullable=False,
    )
    professor_name: Mapped[Optional[str]] = mapped_column(
        String(200),
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
    semester: Mapped["SemesterModel"] = relationship(
        "SemesterModel",
        back_populates="subjects",
    )
    class_sessions: Mapped[List["ClassSessionModel"]] = relationship(
        "ClassSessionModel",
        back_populates="subject",
        cascade="all, delete-orphan",
    )
    tasks: Mapped[List["TaskModel"]] = relationship(
        "TaskModel",
        back_populates="subject",
    )
    
    def __repr__(self) -> str:
        return f"<Subject(id={self.id}, name={self.name})>"


class ClassSessionModel(Base):
    """
    Class session model (weekly time block).
    
    Maps to 'class_sessions' table in database.
    """
    __tablename__ = "class_sessions"
    
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
    day_of_week: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )  # 1=Monday, 7=Sunday (ISO 8601)
    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )
    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )
    location: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )
    attendance_required: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    
    # Relationships
    subject: Mapped["SubjectModel"] = relationship(
        "SubjectModel",
        back_populates="class_sessions",
    )
    
    def __repr__(self) -> str:
        return f"<ClassSession(id={self.id}, day={self.day_of_week}, time={self.start_time}-{self.end_time})>"
