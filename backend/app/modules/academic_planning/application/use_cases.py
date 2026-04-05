"""
Academic Planning Application Use Cases.

Application layer use cases for academic planning operations:
    - Semester management (CRUD + activation)
    - Subject management (CRUD with conflict detection)
    - ClassSession management (CRUD with conflict detection)

Following architecture-patterns skill:
    - Use cases depend on abstractions (ports)
    - Use cases orchestrate, don't implement business rules
    - Business rules live in domain entities
    - Input DTOs are dataclasses for type safety
"""
from dataclasses import dataclass
from datetime import date, time
from typing import List, Optional
from uuid import UUID, uuid4

from app.modules.academic_planning.domain.entities import (
    ClassSession,
    DifficultyLevel,
    Semester,
    Subject,
    SubjectType,
)
from app.modules.academic_planning.domain.services import ConflictDetectionService
from app.modules.academic_planning.port.repository import IAcademicPlanningRepository
from app.shared.domain.exceptions import EntityNotFoundException, ValidationException
from app.shared.domain.value_objects import DayOfWeek, HexColor


# =============================================================================
# Input DTOs (Data Transfer Objects)
# =============================================================================

@dataclass
class CreateSemesterDTO:
    """Input DTO for creating a semester."""
    name: str
    start_date: date
    end_date: date


@dataclass
class UpdateSemesterDTO:
    """Input DTO for updating a semester."""
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None


@dataclass
class CreateSubjectDTO:
    """Input DTO for creating a subject."""
    name: str
    semester_id: UUID
    credits: int = 3
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    subject_type: SubjectType = SubjectType.DISCIPLINAR_OBLIGATORIA
    color: str = HexColor.DEFAULT
    professor_name: Optional[str] = None
    class_sessions: list['CreateClassSessionDTO'] = field(default_factory=list)


@dataclass
class UpdateSubjectDTO:
    """Input DTO for updating a subject."""
    name: Optional[str] = None
    credits: Optional[int] = None
    difficulty: Optional[DifficultyLevel] = None
    subject_type: Optional[SubjectType] = None
    color: Optional[str] = None
    professor_name: Optional[str] = None


@dataclass
class CreateClassSessionDTO:
    """Input DTO for creating a class session."""
    subject_id: UUID
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    classroom: Optional[str] = None


@dataclass
class UpdateClassSessionDTO:
    """Input DTO for updating a class session."""
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    classroom: Optional[str] = None


# =============================================================================
# Semester Use Cases
# =============================================================================

@dataclass
class CreateSemesterUseCase:
    """
    Use case: Create a new semester.
    
    1. Validate dates (end_date > start_date)
    2. Create Semester entity
    3. Persist semester
    4. Return created semester
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, dto: CreateSemesterDTO, user_id: UUID) -> Semester:
        """Execute the create semester use case."""
        # Validate date range
        if dto.end_date <= dto.start_date:
            raise ValidationException(
                code="INVALID_DATE_RANGE",
                message=f"end_date ({dto.end_date}) must be after start_date ({dto.start_date})",
            )
        
        # Create domain entity
        semester = Semester(
            id=uuid4(),
            name=dto.name,
            start_date=dto.start_date,
            end_date=dto.end_date,
            is_active=False,
            user_id=user_id,
        )
        
        # Persist
        return await self.repository.save_semester(semester)


@dataclass
class GetSemesterByIdUseCase:
    """
    Use case: Get a semester by ID.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, semester_id: UUID) -> Semester:
        """Execute the get semester by ID use case."""
        semester = await self.repository.get_semester_by_id(semester_id)
        
        if not semester:
            raise EntityNotFoundException(
                code="SEMESTER_NOT_FOUND",
                message=f"Semester with id {semester_id} not found",
                entity_type="Semester",
                entity_id=semester_id,
            )
        
        return semester


@dataclass
class GetSemestersByUserUseCase:
    """
    Use case: Get all semesters for a user.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, user_id: UUID) -> List[Semester]:
        """Execute the get semesters by user use case."""
        return await self.repository.get_semesters_by_user(user_id)


@dataclass
class GetActiveSemesterUseCase:
    """
    Use case: Get the currently active semester for a user.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, user_id: UUID) -> Optional[Semester]:
        """Execute the get active semester use case."""
        return await self.repository.get_active_semester_by_user(user_id)


@dataclass
class UpdateSemesterUseCase:
    """
    Use case: Update semester details.
    
    1. Get existing semester
    2. Update fields
    3. Persist changes
    """
    repository: IAcademicPlanningRepository
    
    async def execute(
        self,
        semester_id: UUID,
        dto: UpdateSemesterDTO,
        user_id: UUID,
    ) -> Semester:
        """Execute the update semester use case."""
        # Get existing semester
        semester = await self.repository.get_semester_by_id(semester_id)
        
        if not semester:
            raise EntityNotFoundException(
                code="SEMESTER_NOT_FOUND",
                message=f"Semester with id {semester_id} not found",
                entity_type="Semester",
                entity_id=semester_id,
            )
        
        # Verify ownership
        if semester.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to update this semester",
            )
        
        # Update fields
        if dto.name is not None:
            semester.name = dto.name
        if dto.start_date is not None:
            semester.start_date = dto.start_date
        if dto.end_date is not None:
            semester.end_date = dto.end_date
        
        # Validate date range after updates
        if semester.end_date <= semester.start_date:
            raise ValidationException(
                code="INVALID_DATE_RANGE",
                message=f"end_date ({semester.end_date}) must be after start_date ({semester.start_date})",
            )
        
        semester.touch()
        return await self.repository.save_semester(semester)


@dataclass
class DeleteSemesterUseCase:
    """
    Use case: Delete a semester.
    
    Note: Cascade deletion of subjects and sessions is handled at repository level.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, semester_id: UUID, user_id: UUID) -> None:
        """Execute the delete semester use case."""
        # Verify semester exists and user owns it
        semester = await self.repository.get_semester_by_id(semester_id)
        
        if not semester:
            raise EntityNotFoundException(
                code="SEMESTER_NOT_FOUND",
                message=f"Semester with id {semester_id} not found",
                entity_type="Semester",
                entity_id=semester_id,
            )
        
        if semester.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to delete this semester",
            )
        
        await self.repository.delete_semester(semester_id)


@dataclass
class ActivateSemesterUseCase:
    """
    Use case: Activate a semester.
    
    1. Get semester
    2. Call activate() which emits SemesterActivatedEvent
    3. Persist changes
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, semester_id: UUID, user_id: UUID) -> Semester:
        """Execute the activate semester use case."""
        # Get semester
        semester = await self.repository.get_semester_by_id(semester_id)
        
        if not semester:
            raise EntityNotFoundException(
                code="SEMESTER_NOT_FOUND",
                message=f"Semester with id {semester_id} not found",
                entity_type="Semester",
                entity_id=semester_id,
            )
        
        # Verify ownership
        if semester.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to activate this semester",
            )
        
        # Ensure only one semester is active at a time
        all_semesters = await self.repository.get_semesters_by_user(user_id)
        for other in all_semesters:
            if other.id != semester_id and other.is_active:
                other.deactivate()
                await self.repository.save_semester(other)
        
        # Activate target semester (this emits SemesterActivatedEvent)
        semester.activate()
        
        return await self.repository.save_semester(semester)


# =============================================================================
# Subject Use Cases
# =============================================================================

@dataclass
class CreateSubjectUseCase:
    """
    Use case: Create a new subject with conflict detection.
    
    1. Verify semester exists and belongs to user
    2. Create Subject entity
    3. Check for schedule conflicts with existing subjects
    4. Persist subject
    5. Return created subject
    """
    repository: IAcademicPlanningRepository
    conflict_service: ConflictDetectionService
    
    async def execute(self, dto: CreateSubjectDTO, user_id: UUID) -> Subject:
        """Execute the create subject use case."""
        # Verify semester exists and belongs to user
        semester = await self.repository.get_semester_by_id(dto.semester_id)
        
        if not semester:
            raise EntityNotFoundException(
                code="SEMESTER_NOT_FOUND",
                message=f"Semester with id {dto.semester_id} not found",
                entity_type="Semester",
                entity_id=dto.semester_id,
            )
        
        if semester.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to add subjects to this semester",
            )
        
        # Create domain entity
        subject = Subject(
            id=uuid4(),
            name=dto.name,
            credits=dto.credits,
            difficulty=dto.difficulty,
            subject_type=dto.subject_type,
            color=HexColor(dto.color),
            professor_name=dto.professor_name,
            semester_id=dto.semester_id,
            user_id=user_id,
        )
        
        # Add class sessions
        for session_dto in dto.class_sessions:
            session = ClassSession(
                id=uuid4(),
                subject_id=subject.id,
                day_of_week=session_dto.day_of_week,
                start_time=session_dto.start_time,
                end_time=session_dto.end_time,
                classroom=session_dto.classroom,
            )
            subject.add_session(session)
        
        # Check for conflicts with existing subjects in the same semester
        existing_subjects = await self.repository.get_subjects_by_semester(dto.semester_id)
        self.conflict_service.validate_no_conflicts(subject, existing_subjects)
        
        # Persist
        saved_subject = await self.repository.save_subject(subject)
        
        # Also persist all class sessions
        for session in subject.class_sessions:
            await self.repository.save_class_session(session)
            
        return saved_subject


@dataclass
class GetSubjectByIdUseCase:
    """
    Use case: Get a subject by ID.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, subject_id: UUID) -> Subject:
        """Execute the get subject by ID use case."""
        subject = await self.repository.get_subject_by_id(subject_id)
        
        if not subject:
            raise EntityNotFoundException(
                code="SUBJECT_NOT_FOUND",
                message=f"Subject with id {subject_id} not found",
                entity_type="Subject",
                entity_id=subject_id,
            )
        
        return subject


@dataclass
class GetSubjectsBySemesterUseCase:
    """
    Use case: Get all subjects for a semester.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, semester_id: UUID) -> List[Subject]:
        """Execute the get subjects by semester use case."""
        return await self.repository.get_subjects_by_semester(semester_id)


@dataclass
class GetSubjectsByUserUseCase:
    """
    Use case: Get all subjects for a user (across all semesters).
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, user_id: UUID) -> List[Subject]:
        """Execute the get subjects by user use case."""
        return await self.repository.get_subjects_by_user(user_id)


@dataclass
class UpdateSubjectUseCase:
    """
    Use case: Update subject details.
    
    1. Get existing subject
    2. Update fields
    3. Persist changes
    """
    repository: IAcademicPlanningRepository
    
    async def execute(
        self,
        subject_id: UUID,
        dto: UpdateSubjectDTO,
        user_id: UUID,
    ) -> Subject:
        """Execute the update subject use case."""
        # Get existing subject
        subject = await self.repository.get_subject_by_id(subject_id)
        
        if not subject:
            raise EntityNotFoundException(
                code="SUBJECT_NOT_FOUND",
                message=f"Subject with id {subject_id} not found",
                entity_type="Subject",
                entity_id=subject_id,
            )
        
        # Verify ownership
        if subject.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to update this subject",
            )
        
        # Update fields
        if dto.name is not None:
            subject.name = dto.name
        if dto.credits is not None:
            subject.credits = dto.credits
        if dto.difficulty is not None:
            subject.difficulty = dto.difficulty
        if dto.subject_type is not None:
            subject.subject_type = dto.subject_type
        if dto.color is not None:
            subject.color = HexColor(dto.color)
        if dto.professor_name is not None:
            subject.professor_name = dto.professor_name
        
        subject.touch()
        return await self.repository.save_subject(subject)


@dataclass
class DeleteSubjectUseCase:
    """
    Use case: Delete a subject.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, subject_id: UUID, user_id: UUID) -> None:
        """Execute the delete subject use case."""
        # Verify subject exists and user owns it
        subject = await self.repository.get_subject_by_id(subject_id)
        
        if not subject:
            raise EntityNotFoundException(
                code="SUBJECT_NOT_FOUND",
                message=f"Subject with id {subject_id} not found",
                entity_type="Subject",
                entity_id=subject_id,
            )
        
        if subject.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to delete this subject",
            )
        
        await self.repository.delete_subject(subject_id)


# =============================================================================
# ClassSession Use Cases
# =============================================================================

@dataclass
class AddClassSessionUseCase:
    """
    Use case: Add a class session to a subject with conflict detection.
    
    1. Verify subject exists and belongs to user
    2. Create ClassSession entity
    3. Add to subject (validates no overlaps within subject)
    4. Persist session
    5. Return created session
    """
    repository: IAcademicPlanningRepository
    conflict_service: ConflictDetectionService
    
    async def execute(self, dto: CreateClassSessionDTO, user_id: UUID) -> ClassSession:
        """Execute the add class session use case."""
        # Verify subject exists and belongs to user
        subject = await self.repository.get_subject_by_id(dto.subject_id)
        
        if not subject:
            raise EntityNotFoundException(
                code="SUBJECT_NOT_FOUND",
                message=f"Subject with id {dto.subject_id} not found",
                entity_type="Subject",
                entity_id=dto.subject_id,
            )
        
        if subject.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to add sessions to this subject",
            )
        
        # Create domain entity
        session = ClassSession(
            id=uuid4(),
            day_of_week=dto.day_of_week,
            start_time=dto.start_time,
            end_time=dto.end_time,
            classroom=dto.classroom,
            subject_id=dto.subject_id,
        )
        
        # Check for conflicts with other subjects in the same semester
        semester_subjects = await self.repository.get_subjects_by_semester(subject.semester_id)
        
        # Create a temporary subject with this session to check conflicts
        temp_subject = Subject(
            id=subject.id,
            name=subject.name,
            credits=subject.credits,
            difficulty=subject.difficulty,
            subject_type=subject.subject_type,
            color=subject.color,
            professor_name=subject.professor_name,
            semester_id=subject.semester_id,
            user_id=subject.user_id,
            _class_sessions=list(subject.class_sessions) + [session],
        )
        
        # Check conflicts excluding the current subject itself
        other_subjects = [s for s in semester_subjects if s.id != subject.id]
        self.conflict_service.validate_no_conflicts(temp_subject, other_subjects)
        
        # Add session to subject (this validates no overlaps within the subject)
        subject.add_session(session)
        
        # Persist session
        return await self.repository.save_class_session(session)


@dataclass
class GetClassSessionByIdUseCase:
    """
    Use case: Get a class session by ID.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, session_id: UUID) -> ClassSession:
        """Execute the get class session by ID use case."""
        session = await self.repository.get_class_session_by_id(session_id)
        
        if not session:
            raise EntityNotFoundException(
                code="CLASS_SESSION_NOT_FOUND",
                message=f"Class session with id {session_id} not found",
                entity_type="ClassSession",
                entity_id=session_id,
            )
        
        return session


@dataclass
class GetClassSessionsBySubjectUseCase:
    """
    Use case: Get all class sessions for a subject.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, subject_id: UUID) -> List[ClassSession]:
        """Execute the get class sessions by subject use case."""
        return await self.repository.get_class_sessions_by_subject(subject_id)


@dataclass
class GetClassSessionsByUserUseCase:
    """
    Use case: Get all class sessions for a user (schedule view).
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, user_id: UUID) -> List[ClassSession]:
        """Execute the get class sessions by user use case."""
        return await self.repository.get_class_sessions_by_user(user_id)


@dataclass
class UpdateClassSessionUseCase:
    """
    Use case: Update class session details.
    
    1. Get existing session
    2. Verify subject ownership
    3. Update fields
    4. Persist changes
    """
    repository: IAcademicPlanningRepository
    conflict_service: ConflictDetectionService
    
    async def execute(
        self,
        session_id: UUID,
        dto: UpdateClassSessionDTO,
        user_id: UUID,
    ) -> ClassSession:
        """Execute the update class session use case."""
        # Get existing session
        session = await self.repository.get_class_session_by_id(session_id)
        
        if not session:
            raise EntityNotFoundException(
                code="CLASS_SESSION_NOT_FOUND",
                message=f"Class session with id {session_id} not found",
                entity_type="ClassSession",
                entity_id=session_id,
            )
        
        # Verify subject ownership
        subject = await self.repository.get_subject_by_id(session.subject_id)
        if not subject or subject.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to update this session",
            )
        
        # Update fields
        if dto.day_of_week is not None:
            session.day_of_week = dto.day_of_week
        if dto.start_time is not None:
            session.start_time = dto.start_time
        if dto.end_time is not None:
            session.end_time = dto.end_time
        if dto.classroom is not None:
            session.classroom = dto.classroom
        
        # Validate time range after updates
        if session.end_time <= session.start_time:
            raise ValidationException(
                code="INVALID_TIME_RANGE",
                message=f"end_time ({session.end_time}) must be after start_time ({session.start_time})",
            )
        
        session.touch()
        return await self.repository.save_class_session(session)


@dataclass
class RemoveClassSessionUseCase:
    """
    Use case: Remove a class session from a subject.
    """
    repository: IAcademicPlanningRepository
    
    async def execute(self, session_id: UUID, user_id: UUID) -> None:
        """Execute the remove class session use case."""
        # Get session
        session = await self.repository.get_class_session_by_id(session_id)
        
        if not session:
            raise EntityNotFoundException(
                code="CLASS_SESSION_NOT_FOUND",
                message=f"Class session with id {session_id} not found",
                entity_type="ClassSession",
                entity_id=session_id,
            )
        
        # Verify subject ownership
        subject = await self.repository.get_subject_by_id(session.subject_id)
        if not subject or subject.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You don't have permission to remove this session",
            )
        
        await self.repository.delete_class_session(session_id)
