"""
Professors Module — SQLAlchemy ORM Models.

Maps to tables created by migration 002_phase6_professors_module:
  - professors
  - office_hours
  - tutoring_sessions

Following backend-hexagonal-module skill:
  - SQLAlchemy 2.0 mapped_column style
  - Uses app.shared.infrastructure.database.Base
  - TYPE_CHECKING imports for cross-module relationships
"""
from __future__ import annotations

import enum
import uuid
from datetime import date, datetime, time, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.infrastructure.database import Base

if TYPE_CHECKING:
    from app.modules.users.infrastructure.models import UserModel


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# =============================================================================
# Enums
# =============================================================================

class TutoringSessionStatusOrm(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class OfficeHourLocationTypeOrm(str, enum.Enum):
    OFFICE = "OFFICE"
    LAB = "LAB"
    VIRTUAL = "VIRTUAL"


# =============================================================================
# ORM Models
# =============================================================================

class ProfessorModel(Base):
    """
    Persistent professor record (private per student/user).

    Maps to `professors` table.
    """
    __tablename__ = "professors"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False
    )

    # Relationships
    user: Mapped["UserModel"] = relationship("UserModel", back_populates="professors")
    office_hours: Mapped[List["OfficeHourModel"]] = relationship(
        "OfficeHourModel", back_populates="professor", cascade="all, delete-orphan"
    )
    tutoring_sessions: Mapped[List["TutoringSessionModel"]] = relationship(
        "TutoringSessionModel", back_populates="professor", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Professor(id={self.id}, name={self.name})>"


class OfficeHourModel(Base):
    """
    Recurring weekly availability block for a professor.

    Maps to `office_hours` table.
    """
    __tablename__ = "office_hours"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    professor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("professors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    location_type: Mapped[OfficeHourLocationTypeOrm] = mapped_column(
        Enum(OfficeHourLocationTypeOrm, name="office_hour_location_type"),
        nullable=False,
        default=OfficeHourLocationTypeOrm.OFFICE,
    )
    location_details: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    professor: Mapped["ProfessorModel"] = relationship(
        "ProfessorModel", back_populates="office_hours"
    )

    def __repr__(self) -> str:
        return f"<OfficeHour(id={self.id}, day={self.day_of_week})>"


class TutoringSessionModel(Base):
    """
    A specific tutoring appointment.

    Maps to `tutoring_sessions` table.
    """
    __tablename__ = "tutoring_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    professor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("professors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    meeting_link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    status: Mapped[TutoringSessionStatusOrm] = mapped_column(
        Enum(TutoringSessionStatusOrm, name="tutoring_session_status"),
        nullable=False,
        default=TutoringSessionStatusOrm.SCHEDULED,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utc_now, onupdate=_utc_now, nullable=False
    )

    # Relationships
    professor: Mapped["ProfessorModel"] = relationship(
        "ProfessorModel", back_populates="tutoring_sessions"
    )

    def __repr__(self) -> str:
        return f"<TutoringSession(id={self.id}, date={self.date}, status={self.status})>"
