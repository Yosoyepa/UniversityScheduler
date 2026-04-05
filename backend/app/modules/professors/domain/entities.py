"""
Professors Module — Domain Entities.

Pure domain layer: zero external framework dependencies.

Entities:
  - Professor: A professor/tutor entry in the student's private directory.
  - OfficeHour: A recurring weekly time block when the professor is available.
  - TutoringSession: A specific, pre-agreed tutoring appointment.

Following backend-hexagonal-module skill:
  - Inherits from app.shared.domain.entities.Entity
  - Business invariants in __post_init__
  - Domain methods call self.touch()
  - Exceptions from app.shared.domain.exceptions only
"""
from dataclasses import dataclass, field
from datetime import date, datetime, time, timezone
from enum import Enum
from typing import List, Optional
from uuid import UUID

from app.shared.domain.entities import Entity
from app.shared.domain.exceptions import (
    InvalidEntityStateException,
    ValidationException,
)


# =============================================================================
# Domain Enums
# =============================================================================

class TutoringSessionStatus(str, Enum):
    """Lifecycle of a tutoring session."""
    SCHEDULED = "SCHEDULED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class OfficeHourLocationType(str, Enum):
    """Type of location for an office hour block."""
    OFFICE = "OFFICE"
    LAB = "LAB"
    VIRTUAL = "VIRTUAL"


# =============================================================================
# Value helpers
# =============================================================================

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


# =============================================================================
# Entities
# =============================================================================

@dataclass
class OfficeHour(Entity):
    """
    A recurring weekly time block when the professor holds office hours.

    Attributes:
        professor_id: FK to the owning professor.
        day_of_week:  ISO week-day (1=Monday … 7=Sunday).
        start_time:   Block start.
        end_time:     Block end.
        location_type: OFFICE | LAB | VIRTUAL.
        location_details: Room number, lab name, or meeting link.
    """
    professor_id: Optional[UUID] = None
    day_of_week: int = 1
    start_time: time = field(default_factory=lambda: time(8, 0))
    end_time: time = field(default_factory=lambda: time(10, 0))
    location_type: OfficeHourLocationType = OfficeHourLocationType.OFFICE
    location_details: Optional[str] = None

    def __post_init__(self) -> None:
        """Validate invariants."""
        if self.professor_id is None:
            raise ValidationException(
                code="MISSING_PROFESSOR_ID",
                message="OfficeHour must belong to a professor.",
            )
        if not (1 <= self.day_of_week <= 7):
            raise ValidationException(
                code="INVALID_DAY_OF_WEEK",
                message=f"day_of_week must be 1–7, got {self.day_of_week}.",
            )
        if self.end_time <= self.start_time:
            raise ValidationException(
                code="INVALID_TIME_RANGE",
                message=(
                    f"end_time ({self.end_time}) must be after "
                    f"start_time ({self.start_time})."
                ),
            )

    def is_active_now(self) -> bool:
        """Return True if the current UTC time falls within this block today."""
        now = _utc_now()
        # ISO weekday: Mon=1 … Sun=7 — matches our day_of_week convention
        if now.isoweekday() != self.day_of_week:
            return False
        current_time = now.time().replace(tzinfo=None)
        return self.start_time <= current_time < self.end_time


@dataclass
class TutoringSession(Entity):
    """
    A specific, pre-agreed tutoring appointment.

    A session is created as SCHEDULED (the student has already coordinated
    with the professor; no second confirmation needed).

    Lifecycle: SCHEDULED → COMPLETED | CANCELLED
    """
    professor_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    date: Optional[date] = None
    start_time: time = field(default_factory=lambda: time(10, 0))
    end_time: time = field(default_factory=lambda: time(11, 0))
    notes: Optional[str] = None
    meeting_link: Optional[str] = None
    status: TutoringSessionStatus = TutoringSessionStatus.SCHEDULED

    def __post_init__(self) -> None:
        """Validate invariants."""
        if self.professor_id is None:
            raise ValidationException(
                code="MISSING_PROFESSOR_ID",
                message="TutoringSession must reference a professor.",
            )
        if self.user_id is None:
            raise ValidationException(
                code="MISSING_USER_ID",
                message="TutoringSession must reference a user.",
            )
        if self.date is None:
            raise ValidationException(
                code="MISSING_DATE",
                message="TutoringSession must have a date.",
            )
        if self.end_time <= self.start_time:
            raise ValidationException(
                code="INVALID_TIME_RANGE",
                message=(
                    f"end_time ({self.end_time}) must be after "
                    f"start_time ({self.start_time})."
                ),
            )

    def complete(self) -> None:
        """Mark the session as completed."""
        if self.status != TutoringSessionStatus.SCHEDULED:
            raise InvalidEntityStateException(
                code="INVALID_STATUS_TRANSITION",
                message=(
                    f"Cannot complete a session in status '{self.status.value}'."
                ),
                current_state=self.status.value,
                expected_states=[TutoringSessionStatus.SCHEDULED.value],
            )
        self.status = TutoringSessionStatus.COMPLETED
        self.touch()

    def cancel(self) -> None:
        """Cancel the session."""
        if self.status != TutoringSessionStatus.SCHEDULED:
            raise InvalidEntityStateException(
                code="INVALID_STATUS_TRANSITION",
                message=(
                    f"Cannot cancel a session in status '{self.status.value}'."
                ),
                current_state=self.status.value,
                expected_states=[TutoringSessionStatus.SCHEDULED.value],
            )
        self.status = TutoringSessionStatus.CANCELLED
        self.touch()


@dataclass
class Professor(Entity):
    """
    A professor entry in the student's private contact directory.

    Each Professor belongs to a single user (private per student).
    The student populates this directory manually or via subject assignment.

    Attributes:
        user_id:       Owner (student) user id.
        name:          Full name of the professor.
        email:         Optional contact email.
        department:    Optional department / faculty name.
        _office_hours: Recurring availability blocks (aggregated here).
    """
    user_id: Optional[UUID] = None
    name: str = ""
    email: Optional[str] = None
    department: Optional[str] = None
    _office_hours: List[OfficeHour] = field(default_factory=list, repr=False)

    def __post_init__(self) -> None:
        """Validate invariants."""
        if self.user_id is None:
            raise ValidationException(
                code="MISSING_USER_ID",
                message="Professor must be associated with a user.",
            )
        if not self.name or not self.name.strip():
            raise ValidationException(
                code="MISSING_PROFESSOR_NAME",
                message="Professor must have a name.",
            )
        if self.email and "@" not in self.email:
            raise ValidationException(
                code="INVALID_EMAIL",
                message=f"Invalid email format: {self.email}.",
            )

    # ------------------------------------------------------------------
    # Office Hours management
    # ------------------------------------------------------------------

    @property
    def office_hours(self) -> List[OfficeHour]:
        """Read-only access to office hours."""
        return self._office_hours.copy()

    def add_office_hour(self, oh: OfficeHour) -> None:
        """Append an office hour block, validating it belongs to this professor."""
        if oh.professor_id != self.id:
            raise ValidationException(
                code="OFFICE_HOUR_PROFESSOR_MISMATCH",
                message="OfficeHour.professor_id does not match this professor.",
            )
        self._office_hours.append(oh)
        self.touch()

    def remove_office_hour(self, oh_id: UUID) -> None:
        """Remove an office hour block by id."""
        for i, oh in enumerate(self._office_hours):
            if oh.id == oh_id:
                self._office_hours.pop(i)
                self.touch()
                return
        raise InvalidEntityStateException(
            code="OFFICE_HOUR_NOT_FOUND",
            message=f"OfficeHour {oh_id} not found in professor {self.id}.",
            current_state="active",
            expected_states=["office_hour_exists"],
        )

    # ------------------------------------------------------------------
    # Derived queries
    # ------------------------------------------------------------------

    def is_available_now(self) -> bool:
        """True if the professor has any office-hour block active right now."""
        return any(oh.is_active_now() for oh in self._office_hours)

    def update_info(
        self,
        name: Optional[str] = None,
        email: Optional[str] = None,
        department: Optional[str] = None,
    ) -> None:
        """Update mutable fields."""
        if name is not None:
            if not name.strip():
                raise ValidationException(
                    code="MISSING_PROFESSOR_NAME",
                    message="Professor name cannot be empty.",
                )
            self.name = name.strip()
        if email is not None:
            if email and "@" not in email:
                raise ValidationException(
                    code="INVALID_EMAIL",
                    message=f"Invalid email format: {email}.",
                )
            self.email = email or None
        if department is not None:
            self.department = department or None
        self.touch()

    def __repr__(self) -> str:
        return f"<Professor(id={self.id}, name={self.name})>"
