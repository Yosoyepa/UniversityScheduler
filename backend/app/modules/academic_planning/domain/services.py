"""
Academic Planning Domain Services.

Contains domain services for academic planning operations:
    - ConflictDetectionService: Detects schedule conflicts between class sessions

Domain services are stateless operations that don't belong to any specific entity.
They encapsulate complex domain logic that spans multiple entities.

Following Clean Architecture:
    - Pure domain logic, no I/O, no framework dependencies
    - Deterministic output for given input (testable)
    - Defensive programming with input validation
"""
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

from app.modules.academic_planning.domain.entities import ClassSession, Subject
from app.shared.domain.exceptions import ScheduleConflictException, ValidationException


# =============================================================================
# Conflict Result Data Classes
# =============================================================================

@dataclass
class ClassSessionConflict:
    """
    Represents a conflict between two class sessions.
    
    Attributes:
        existing_session: The existing session that conflicts
        conflict_type: Type of conflict (e.g., "TIME_OVERLAP")
        message: Human-readable description of the conflict
    """
    existing_session: ClassSession
    conflict_type: str = "TIME_OVERLAP"
    message: str = ""
    
    def __post_init__(self):
        """Generate default message if not provided."""
        if not self.message:
            time_range = self.existing_session.get_time_range()
            day_name = self.existing_session.day_of_week.name_en
            self.message = (
                f"Conflicts with existing session on {day_name} "
                f"at {time_range}"
            )


@dataclass
class SubjectConflict:
    """
    Represents conflicts between a new subject and an existing subject.
    
    Contains all conflicting session pairs between the two subjects.
    
    Attributes:
        existing_subject: The existing subject that conflicts
        conflicting_sessions: List of (new_session, existing_session) tuples
        message: Human-readable description of the conflict
    """
    existing_subject: Subject
    conflicting_sessions: List[Tuple[ClassSession, ClassSession]] = field(default_factory=list)
    message: str = ""
    
    def __post_init__(self):
        """Generate default message if not provided."""
        if not self.message and self.conflicting_sessions:
            session_count = len(self.conflicting_sessions)
            self.message = (
                f"{session_count} conflicting session(s) with '{self.existing_subject.name}'"
            )


# =============================================================================
# Conflict Detection Service
# =============================================================================

class ConflictDetectionService:
    """
    Domain service for detecting schedule conflicts.
    
    This service provides methods to check for time overlaps between class
    sessions and subjects. It's a pure domain service with no I/O operations,
    making it fully deterministic and easily testable.
    
    Usage:
        service = ConflictDetectionService()
        conflicts = service.check_conflicts(new_session, existing_sessions)
        if conflicts:
            # Handle conflicts
    """
    
    @staticmethod
    def _validate_session(session: Optional[ClassSession], param_name: str) -> None:
        """
        Validate that a session parameter is not None.
        
        Args:
            session: The session to validate
            param_name: Name of the parameter for error messages
            
        Raises:
            ValidationException: If session is None
        """
        if session is None:
            raise ValidationException(
                code="NULL_PARAMETER",
                message=f"Parameter '{param_name}' cannot be None",
            )
    
    @staticmethod
    def _validate_subject(subject: Optional[Subject], param_name: str) -> None:
        """
        Validate that a subject parameter is not None.
        
        Args:
            subject: The subject to validate
            param_name: Name of the parameter for error messages
            
        Raises:
            ValidationException: If subject is None
        """
        if subject is None:
            raise ValidationException(
                code="NULL_PARAMETER",
                message=f"Parameter '{param_name}' cannot be None",
            )
    
    def check_conflicts(
        self,
        new_session: ClassSession,
        existing_sessions: List[ClassSession],
    ) -> List[ClassSessionConflict]:
        """
        Check if a new session overlaps with any existing sessions.
        
        This method compares the new session against all existing sessions
        and returns a list of conflicts found. An empty list means no conflicts.
        
        Algorithm:
            For each existing session:
                If same day of week AND time ranges overlap:
                    Record conflict
        
        Args:
            new_session: The new class session to check
            existing_sessions: List of existing sessions to check against
            
        Returns:
            List of ClassSessionConflict (empty if no conflicts)
            
        Raises:
            ValidationException: If new_session is None
        """
        # Defensive programming: validate inputs
        self._validate_session(new_session, "new_session")
        
        # Empty list is OK - no conflicts possible
        if not existing_sessions:
            return []
        
        conflicts: List[ClassSessionConflict] = []
        
        for existing in existing_sessions:
            # Skip None entries in existing_sessions (defensive)
            if existing is None:
                continue
                
            # Check for overlap using the entity's overlaps() method
            if new_session.overlaps(existing):
                conflict = ClassSessionConflict(
                    existing_session=existing,
                    conflict_type="TIME_OVERLAP",
                    message=self._format_session_conflict_message(new_session, existing),
                )
                conflicts.append(conflict)
        
        return conflicts
    
    def check_subject_conflicts(
        self,
        new_subject: Subject,
        existing_subjects: List[Subject],
    ) -> List[SubjectConflict]:
        """
        Check for conflicts between a new subject and existing subjects.
        
        For each session in the new subject, checks against all sessions in
        existing subjects. Returns detailed conflict information including
        which specific sessions conflict.
        
        Algorithm:
            For each new_session in new_subject.class_sessions:
                For each existing_subject in existing_subjects:
                    For each existing_session in existing_subject.class_sessions:
                        If new_session.day_of_week == existing_session.day_of_week:
                            If new_session.overlaps(existing_session):
                                Record conflict
        
        Args:
            new_subject: The new subject to check
            existing_subjects: List of existing subjects to check against
            
        Returns:
            List of SubjectConflict (empty if no conflicts)
            
        Raises:
            ValidationException: If new_subject is None
        """
        # Defensive programming: validate inputs
        self._validate_subject(new_subject, "new_subject")
        
        # Empty list is OK - no conflicts possible
        if not existing_subjects:
            return []
        
        subject_conflicts: List[SubjectConflict] = []
        new_sessions = new_subject.class_sessions
        
        for existing_subject in existing_subjects:
            # Skip None entries in existing_subjects (defensive)
            if existing_subject is None:
                continue
            
            # Skip comparing subject to itself (by ID)
            if existing_subject.id == new_subject.id:
                continue
            
            conflicting_pairs: List[Tuple[ClassSession, ClassSession]] = []
            existing_sessions = existing_subject.class_sessions
            
            # Check each new session against each existing session
            for new_session in new_sessions:
                for existing_session in existing_sessions:
                    if new_session.overlaps(existing_session):
                        conflicting_pairs.append((new_session, existing_session))
            
            # If we found conflicts with this subject, record them
            if conflicting_pairs:
                subject_conflict = SubjectConflict(
                    existing_subject=existing_subject,
                    conflicting_sessions=conflicting_pairs,
                    message=self._format_subject_conflict_message(
                        new_subject, existing_subject, conflicting_pairs
                    ),
                )
                subject_conflicts.append(subject_conflict)
        
        return subject_conflicts
    
    def validate_no_conflicts(
        self,
        new_subject: Subject,
        existing_subjects: List[Subject],
    ) -> None:
        """
        Validate that a new subject has no conflicts with existing subjects.
        
        Uses check_subject_conflicts internally. If any conflicts are found,
        raises ScheduleConflictException with detailed conflict information.
        
        Args:
            new_subject: The new subject to validate
            existing_subjects: List of existing subjects to check against
            
        Raises:
            ValidationException: If new_subject is None
            ScheduleConflictException: If any conflicts are found
        """
        # This will raise ValidationException if new_subject is None
        conflicts = self.check_subject_conflicts(new_subject, existing_subjects)
        
        if conflicts:
            # Build detailed conflict information for the exception
            conflict_details = []
            for subject_conflict in conflicts:
                for new_session, existing_session in subject_conflict.conflicting_sessions:
                    conflict_details.append({
                        "new_session_id": str(new_session.id),
                        "new_session_time": (
                            f"{new_session.day_of_week.name_en} "
                            f"{new_session.get_time_range()}"
                        ),
                        "existing_subject_id": str(subject_conflict.existing_subject.id),
                        "existing_subject_name": subject_conflict.existing_subject.name,
                        "existing_session_id": str(existing_session.id),
                        "existing_session_time": (
                            f"{existing_session.day_of_week.name_en} "
                            f"{existing_session.get_time_range()}"
                        ),
                    })
            
            # Format a human-readable message
            conflict_count = sum(
                len(sc.conflicting_sessions) for sc in conflicts
            )
            subject_names = [sc.existing_subject.name for sc in conflicts]
            
            raise ScheduleConflictException(
                code="SUBJECT_SCHEDULE_CONFLICT",
                message=(
                    f"Cannot add '{new_subject.name}': "
                    f"{conflict_count} conflict(s) detected with: "
                    f"{', '.join(subject_names)}"
                ),
                conflicts=conflict_details,
            )
    
    def _format_session_conflict_message(
        self,
        new_session: ClassSession,
        existing_session: ClassSession,
    ) -> str:
        """
        Format a human-readable conflict message for session overlap.
        
        Args:
            new_session: The new session
            existing_session: The existing session it conflicts with
            
        Returns:
            Formatted message string
        """
        day_name = existing_session.day_of_week.name_en
        time_range = existing_session.get_time_range()
        return (
            f"Session on {day_name} at {time_range} "
            f"overlaps with existing session"
        )
    
    def _format_subject_conflict_message(
        self,
        new_subject: Subject,
        existing_subject: Subject,
        conflicting_pairs: List[Tuple[ClassSession, ClassSession]],
    ) -> str:
        """
        Format a human-readable conflict message for subject conflicts.
        
        Args:
            new_subject: The new subject
            existing_subject: The existing subject it conflicts with
            conflicting_pairs: List of conflicting session pairs
            
        Returns:
            Formatted message string
        """
        session_count = len(conflicting_pairs)
        return (
            f"'{new_subject.name}' has {session_count} conflicting session(s) "
            f"with '{existing_subject.name}'"
        )
