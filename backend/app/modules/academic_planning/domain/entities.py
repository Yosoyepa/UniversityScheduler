"""
Academic Planning Domain Entities.

Contains the core domain entities for academic planning:
    - Semester: Academic time periods
    - Subject: Courses within a semester
    - ClassSession: Weekly class time blocks

Following Clean Architecture / Hexagonal pattern:
    - Pure domain logic, no framework dependencies
    - Defensive programming with invariant validation
    - Domain event emission for significant state changes
"""
from dataclasses import dataclass, field
from datetime import date, time
from enum import Enum
from typing import List, Optional
from uuid import UUID

from app.shared.domain.entities import Entity
from app.shared.domain.events import (
    SemesterActivatedEvent,
    SubjectCreatedEvent,
    get_event_bus,
)
from app.shared.domain.exceptions import (
    InvalidEntityStateException,
    ScheduleConflictException,
    ValidationException,
)
from app.shared.domain.value_objects import DayOfWeek, HexColor, TimeRange


# =============================================================================
# Domain Enums (defined here to avoid infrastructure dependency)
# These mirror the database enums in infrastructure.models
# =============================================================================

class DifficultyLevel(str, Enum):
    """Difficulty level for subjects."""
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class SubjectType(str, Enum):
    """Type of subject/course (Colombian university system)."""
    DISCIPLINAR_OBLIGATORIA = "DISCIPLINAR_OBLIGATORIA"
    DISCIPLINAR_OPTATIVA = "DISCIPLINAR_OPTATIVA"
    FUNDAMENTAL_OBLIGATORIA = "FUNDAMENTAL_OBLIGATORIA"
    FUNDAMENTAL_OPTATIVA = "FUNDAMENTAL_OPTATIVA"
    LIBRE_ELECCION = "LIBRE_ELECCION"
    TRABAJO_DE_GRADO = "TRABAJO_DE_GRADO"


# =============================================================================
# Domain Entities
# =============================================================================

@dataclass
class ClassSession(Entity):
    """
    Class session entity representing a weekly time block.
    
    A class session is a specific day/time when a subject is taught.
    Multiple sessions can exist for a single subject.
    
    Attributes:
        day_of_week: Day of the week (Monday=1, Sunday=7)
        start_time: Start time of the session
        end_time: End time of the session
        classroom: Optional location/classroom name
        subject_id: Reference to the parent subject
    """
    day_of_week: DayOfWeek = field(default=DayOfWeek.MONDAY)
    start_time: time = field(default_factory=lambda: time(8, 0))
    end_time: time = field(default_factory=lambda: time(10, 0))
    classroom: Optional[str] = None
    subject_id: Optional[UUID] = None
    
    def __post_init__(self):
        """Validate class session invariants."""
        if self.subject_id is None:
            raise ValidationException(
                code="MISSING_SUBJECT_ID",
                message="ClassSession must have a subject_id",
            )
        
        # Validate time order
        if self.end_time <= self.start_time:
            raise ValidationException(
                code="INVALID_TIME_RANGE",
                message=f"end_time ({self.end_time}) must be after start_time ({self.start_time})",
            )
    
    def overlaps(self, other: "ClassSession") -> bool:
        """
        Check if this session overlaps with another session.
        
        Overlap occurs when:
        - Same day of week, AND
        - Time ranges overlap
        
        Adjacent sessions (e.g., 10:00-11:00 and 11:00-12:00) do NOT overlap.
        
        Args:
            other: Another ClassSession to check against
            
        Returns:
            True if sessions overlap, False otherwise
        """
        # Different days cannot overlap
        if self.day_of_week != other.day_of_week:
            return False
        
        # Check time range overlap
        return self.get_time_range().overlaps(other.get_time_range())
    
    def get_time_range(self) -> TimeRange:
        """
        Get the time range for this session.
        
        Returns:
            TimeRange value object representing start to end time
        """
        return TimeRange(start_time=self.start_time, end_time=self.end_time)
    
    def __repr__(self) -> str:
        return (
            f"<ClassSession(day={self.day_of_week.name_en}, "
            f"time={self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')})>"
        )


@dataclass
class Subject(Entity):
    """
    Subject entity representing a course within a semester.
    
    A subject contains multiple class sessions and belongs to a semester.
    It tracks course metadata like credits, difficulty, and professor.
    
    Attributes:
        name: Subject/course name
        credits: Number of academic credits
        difficulty: Difficulty level (EASY, MEDIUM, HARD)
        subject_type: Type of subject (obligatoria, optativa, etc.)
        color: Hex color for UI representation
        professor_name: Optional professor name
        semester_id: Reference to parent semester
        user_id: Reference to owner user
        _class_sessions: Internal list of class sessions
    """
    name: str = ""
    credits: int = 3
    difficulty: DifficultyLevel = field(default=DifficultyLevel.MEDIUM)
    subject_type: SubjectType = field(default=SubjectType.DISCIPLINAR_OBLIGATORIA)
    color: HexColor = field(default_factory=lambda: HexColor(HexColor.DEFAULT))
    professor_id: Optional[UUID] = None
    semester_id: Optional[UUID] = None
    user_id: Optional[UUID] = None
    _class_sessions: List[ClassSession] = field(default_factory=list, repr=False)
    
    def __post_init__(self):
        """Validate subject invariants and emit creation event."""
        # Validate required fields
        if not self.name or not self.name.strip():
            raise ValidationException(
                code="MISSING_SUBJECT_NAME",
                message="Subject must have a name",
            )
        
        if self.semester_id is None:
            raise ValidationException(
                code="MISSING_SEMESTER_ID",
                message="Subject must have a semester_id",
            )
        
        if self.user_id is None:
            raise ValidationException(
                code="MISSING_USER_ID",
                message="Subject must have a user_id",
            )
        
        # Validate credits
        if self.credits < 1 or self.credits > 20:
            raise ValidationException(
                code="INVALID_CREDITS",
                message=f"Credits must be between 1 and 20, got {self.credits}",
            )
        
        # Emit creation event (only for new entities, not reconstructed ones)
        # Note: In a real implementation, we might use a factory pattern
        # to separate construction from event emission
        self._emit_created_event()
    
    def _emit_created_event(self) -> None:
        """Emit SubjectCreatedEvent."""
        event = SubjectCreatedEvent(
            subject_id=self.id,
            semester_id=self.semester_id,
            subject_name=self.name,
            session_count=len(self._class_sessions),
        )
        get_event_bus().publish(event)
    
    @property
    def class_sessions(self) -> List[ClassSession]:
        """Get a copy of the class sessions list (read-only access)."""
        return self._class_sessions.copy()
    
    def add_session(self, session: ClassSession) -> None:
        """
        Add a class session to this subject.
        
        Validates that the session doesn't overlap with existing sessions.
        
        Args:
            session: The ClassSession to add
            
        Raises:
            ScheduleConflictException: If the session overlaps with existing sessions
        """
        # Validate session belongs to this subject
        if session.subject_id != self.id:
            raise ValidationException(
                code="INVALID_SESSION_SUBJECT",
                message="Session subject_id does not match this subject's id",
            )
        
        # Check for overlaps with existing sessions
        for existing in self._class_sessions:
            if session.overlaps(existing):
                raise ScheduleConflictException(
                    code="SESSION_OVERLAP",
                    message=f"New session overlaps with existing session on {existing.day_of_week.name_en}",
                    conflicts=[{
                        "existing_session": str(existing.id),
                        "existing_time": f"{existing.day_of_week.name_en} {existing.get_time_range()}",
                        "new_session": str(session.id),
                        "new_time": f"{session.day_of_week.name_en} {session.get_time_range()}",
                    }],
                )
        
        self._class_sessions.append(session)
        self.touch()
    
    def remove_session(self, session_id: UUID) -> None:
        """
        Remove a class session by ID.
        
        Args:
            session_id: The UUID of the session to remove
            
        Raises:
            InvalidEntityStateException: If session not found
        """
        for i, session in enumerate(self._class_sessions):
            if session.id == session_id:
                self._class_sessions.pop(i)
                self.touch()
                return
        
        raise InvalidEntityStateException(
            code="SESSION_NOT_FOUND",
            message=f"Class session {session_id} not found in subject {self.id}",
            current_state="active",
            expected_states=["session exists"],
        )
    
    def update_professor(self, professor_id: Optional[UUID]) -> None:
        """
        Update the linked professor by ID.

        Args:
            professor_id: UUID of the professor entity, or None to clear.
        """
        self.professor_id = professor_id
        self.touch()
    
    def update_color(self, color: HexColor) -> None:
        """
        Update the subject color.
        
        Args:
            color: New HexColor value
        """
        self.color = color
        self.touch()
    
    def total_weekly_hours(self) -> float:
        """
        Calculate total weekly hours based on class sessions.
        
        Returns:
            Total hours per week
        """
        total_minutes = sum(
            session.get_time_range().duration_minutes
            for session in self._class_sessions
        )
        return total_minutes / 60.0
    
    def __repr__(self) -> str:
        return f"<Subject(id={self.id}, name={self.name}, sessions={len(self._class_sessions)})>"


@dataclass
class Semester(Entity):
    """
    Semester entity representing an academic time period.
    
    A semester contains subjects and has a start/end date.
    Only one semester should be active per user at a time.
    
    Attributes:
        name: Semester name (e.g., "2025-1")
        start_date: First day of the semester
        end_date: Last day of the semester
        is_active: Whether this is the currently active semester
        user_id: Reference to owner user
        _subjects: Internal list of subjects (optional tracking)
    """
    name: str = ""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = False
    user_id: Optional[UUID] = None
    _subjects: List[Subject] = field(default_factory=list, repr=False)
    
    def __post_init__(self):
        """Validate semester invariants."""
        # Validate required fields
        if not self.name or not self.name.strip():
            raise ValidationException(
                code="MISSING_SEMESTER_NAME",
                message="Semester must have a name",
            )
        
        if self.user_id is None:
            raise ValidationException(
                code="MISSING_USER_ID",
                message="Semester must have a user_id",
            )
        
        # Validate date range
        if self.start_date is None:
            raise ValidationException(
                code="MISSING_START_DATE",
                message="Semester must have a start_date",
            )
        
        if self.end_date is None:
            raise ValidationException(
                code="MISSING_END_DATE",
                message="Semester must have an end_date",
            )
        
        if self.end_date <= self.start_date:
            raise ValidationException(
                code="INVALID_DATE_RANGE",
                message=f"end_date ({self.end_date}) must be after start_date ({self.start_date})",
            )
    
    def activate(self) -> None:
        """
        Activate this semester.
        
        Emits SemesterActivatedEvent. Note: The application layer should
        ensure only one semester per user is active at a time.
        """
        if self.is_active:
            raise InvalidEntityStateException(
                code="ALREADY_ACTIVE",
                message=f"Semester {self.id} is already active",
                current_state="active",
                expected_states=["inactive"],
            )
        
        self.is_active = True
        self.touch()
        
        # Emit activation event
        event = SemesterActivatedEvent(
            semester_id=self.id,
            user_id=self.user_id,
            semester_name=self.name,
        )
        get_event_bus().publish(event)
    
    def deactivate(self) -> None:
        """
        Deactivate this semester.
        
        Deactivated semesters are still visible but not the "current" one.
        """
        if not self.is_active:
            raise InvalidEntityStateException(
                code="ALREADY_INACTIVE",
                message=f"Semester {self.id} is already inactive",
                current_state="inactive",
                expected_states=["active"],
            )
        
        self.is_active = False
        self.touch()
    
    def is_current(self, current_date: Optional[date] = None) -> bool:
        """
        Check if the semester is currently in progress.
        
        Args:
            current_date: Date to check against, defaults to today
            
        Returns:
            True if current_date is within semester dates
        """
        if current_date is None:
            current_date = date.today()
        return self.start_date <= current_date <= self.end_date
    
    def duration_days(self) -> int:
        """
        Calculate the duration of the semester in days.
        
        Returns:
            Number of days between start and end dates (inclusive)
        """
        return (self.end_date - self.start_date).days + 1
    
    def add_subject(self, subject: Subject) -> None:
        """
        Add a subject to this semester.
        
        Args:
            subject: The Subject to add
            
        Raises:
            ValidationException: If subject doesn't belong to this semester
        """
        if subject.semester_id != self.id:
            raise ValidationException(
                code="INVALID_SUBJECT_SEMESTER",
                message="Subject semester_id does not match this semester's id",
            )
        
        self._subjects.append(subject)
    
    @property
    def subjects(self) -> List[Subject]:
        """Get a copy of the subjects list (read-only access)."""
        return self._subjects.copy()
    
    def total_credits(self) -> int:
        """
        Calculate total credits across all subjects.
        
        Returns:
            Sum of credits for all subjects in this semester
        """
        return sum(subject.credits for subject in self._subjects)
    
    def __repr__(self) -> str:
        return f"<Semester(id={self.id}, name={self.name}, active={self.is_active})>"
