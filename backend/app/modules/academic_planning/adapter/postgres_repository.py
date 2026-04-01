"""
PostgreSQL Academic Planning Repository Adapter.

Implements IAcademicPlanningRepository using SQLAlchemy async session.
Maps between domain entities and ORM models.

Following Clean Architecture / Hexagonal pattern:
    - Adapter implements the Port interface
    - Repository handles persistence, not business logic
    - Domain entities are returned, not ORM models
    - Uses eager loading for efficient relationship queries
    - Defensive programming: validates inputs, handles None cases

SQLAlchemy 2.0 async style:
    - Uses await session.execute() for queries
    - Uses selectinload for relationship eager loading
    - Proper async/await throughout
"""
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.academic_planning.domain.entities import (
    ClassSession,
    Semester,
    Subject,
    DifficultyLevel,
    SubjectType,
)
from app.modules.academic_planning.infrastructure.models import (
    ClassSessionModel,
    SemesterModel,
    SubjectModel,
)
from app.modules.academic_planning.port.repository import (
    IAcademicPlanningRepository,
)
from app.shared.domain.exceptions import EntityNotFoundException
from app.shared.domain.value_objects import DayOfWeek, HexColor


class PostgresAcademicPlanningRepository(IAcademicPlanningRepository):
    """
    PostgreSQL implementation of the academic planning repository.
    
    Uses SQLAlchemy async session for database operations.
    Handles bidirectional mapping between domain entities and ORM models.
    
    Eager Loading Strategy:
        - Semester queries load subjects (for total_credits calculation)
        - Subject queries load class_sessions (for schedule information)
        - This prevents N+1 query issues when accessing relationships
    
    Defensive Programming:
        - Validates UUID inputs before querying
        - Returns empty lists instead of None for collection queries
        - Raises EntityNotFoundException for missing entities on delete/get
    """
    
    def __init__(self, session: AsyncSession):
        """
        Initialize repository with async session.
        
        Args:
            session: SQLAlchemy AsyncSession for database operations
        """
        self.session = session
    
    # ==========================================================================
    # Semester Operations
    # ==========================================================================
    
    async def save_semester(self, semester: Semester) -> Semester:
        """
        Persist a semester entity.
        
        Creates new semester if ID doesn't exist, updates if it does.
        
        Args:
            semester: The Semester entity to persist
            
        Returns:
            The persisted Semester entity
        """
        # Check if semester exists
        existing = await self.session.get(SemesterModel, semester.id)
        
        if existing:
            # Update existing
            existing.name = semester.name
            existing.start_date = semester.start_date
            existing.end_date = semester.end_date
            existing.is_active = semester.is_active
            existing.updated_at = semester.updated_at
        else:
            # Create new
            model = SemesterModel(
                id=semester.id,
                user_id=semester.user_id,
                name=semester.name,
                start_date=semester.start_date,
                end_date=semester.end_date,
                is_active=semester.is_active,
                created_at=semester.created_at,
                updated_at=semester.updated_at,
            )
            self.session.add(model)
        
        await self.session.flush()
        return semester
    
    async def get_semester_by_id(self, semester_id: UUID) -> Optional[Semester]:
        """
        Find a semester by its unique ID.
        
        Uses eager loading to include subjects for efficient access.
        
        Args:
            semester_id: The UUID of the semester to find
            
        Returns:
            The Semester entity if found, None otherwise
        """
        if semester_id is None:
            return None
            
        result = await self.session.execute(
            select(SemesterModel)
            .where(SemesterModel.id == semester_id)
            .options(selectinload(SemesterModel.subjects))
        )
        model = result.scalar_one_or_none()
        return self._semester_to_entity(model) if model else None
    
    async def get_semesters_by_user(self, user_id: UUID) -> List[Semester]:
        """
        Get all semesters for a specific user.
        
        Uses eager loading to include subjects for efficient access.
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            List of Semester entities (empty list if none found)
        """
        if user_id is None:
            return []
            
        result = await self.session.execute(
            select(SemesterModel)
            .where(SemesterModel.user_id == user_id)
            .options(selectinload(SemesterModel.subjects))
            .order_by(SemesterModel.start_date.desc())
        )
        models = result.scalars().all()
        return [self._semester_to_entity(model) for model in models]
    
    async def get_active_semester_by_user(self, user_id: UUID) -> Optional[Semester]:
        """
        Get the currently active semester for a user.
        
        Uses eager loading to include subjects for efficient access.
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            The active Semester entity if found, None otherwise
        """
        if user_id is None:
            return None
            
        result = await self.session.execute(
            select(SemesterModel)
            .where(
                SemesterModel.user_id == user_id,
                SemesterModel.is_active == True
            )
            .options(selectinload(SemesterModel.subjects))
        )
        model = result.scalar_one_or_none()
        return self._semester_to_entity(model) if model else None
    
    async def delete_semester(self, semester_id: UUID) -> None:
        """
        Delete a semester by ID.
        
        Args:
            semester_id: The UUID of the semester to delete
            
        Raises:
            EntityNotFoundException: If semester with given ID doesn't exist
        """
        if semester_id is None:
            raise EntityNotFoundException(
                entity_type="Semester",
                entity_id=semester_id,
                code="SEMESTER_NOT_FOUND",
                message="Cannot delete semester: ID is None",
            )
            
        result = await self.session.execute(
            select(SemesterModel).where(SemesterModel.id == semester_id)
        )
        model = result.scalar_one_or_none()
        
        if model is None:
            raise EntityNotFoundException(
                entity_type="Semester",
                entity_id=semester_id,
                code="SEMESTER_NOT_FOUND",
                message=f"Semester with id {semester_id} not found",
            )
        
        await self.session.delete(model)
        await self.session.flush()
    
    # ==========================================================================
    # Subject Operations
    # ==========================================================================
    
    async def save_subject(self, subject: Subject) -> Subject:
        """
        Persist a subject entity.
        
        Creates new subject if ID doesn't exist, updates if it does.
        
        Args:
            subject: The Subject entity to persist
            
        Returns:
            The persisted Subject entity
        """
        # Check if subject exists
        existing = await self.session.get(SubjectModel, subject.id)
        
        if existing:
            # Update existing
            existing.name = subject.name
            existing.credits = subject.credits
            existing.difficulty = subject.difficulty
            existing.type = subject.subject_type
            existing.color = str(subject.color)
            existing.professor_name = subject.professor_name
            existing.updated_at = subject.updated_at
        else:
            # Create new
            model = SubjectModel(
                id=subject.id,
                semester_id=subject.semester_id,
                name=subject.name,
                credits=subject.credits,
                difficulty=subject.difficulty,
                type=subject.subject_type,
                color=str(subject.color),
                professor_name=subject.professor_name,
                created_at=subject.created_at,
                updated_at=subject.updated_at,
            )
            self.session.add(model)
        
        await self.session.flush()
        return subject
    
    async def get_subject_by_id(self, subject_id: UUID) -> Optional[Subject]:
        """
        Find a subject by its unique ID.
        
        Uses eager loading to include class_sessions for efficient access.
        
        Args:
            subject_id: The UUID of the subject to find
            
        Returns:
            The Subject entity if found, None otherwise
        """
        if subject_id is None:
            return None
            
        result = await self.session.execute(
            select(SubjectModel)
            .where(SubjectModel.id == subject_id)
            .options(selectinload(SubjectModel.class_sessions))
        )
        model = result.scalar_one_or_none()
        return self._subject_to_entity(model) if model else None
    
    async def get_subjects_by_semester(self, semester_id: UUID) -> List[Subject]:
        """
        Get all subjects for a specific semester.
        
        Uses eager loading to include class_sessions for efficient access.
        
        Args:
            semester_id: The UUID of the semester
            
        Returns:
            List of Subject entities (empty list if none found)
        """
        if semester_id is None:
            return []
            
        result = await self.session.execute(
            select(SubjectModel)
            .where(SubjectModel.semester_id == semester_id)
            .options(selectinload(SubjectModel.class_sessions))
            .order_by(SubjectModel.name)
        )
        models = result.scalars().all()
        return [self._subject_to_entity(model) for model in models]
    
    async def get_subjects_by_user(self, user_id: UUID) -> List[Subject]:
        """
        Get all subjects for a specific user (across all semesters).
        
        Uses eager loading to include class_sessions for efficient access.
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            List of Subject entities (empty list if none found)
        """
        if user_id is None:
            return []
            
        result = await self.session.execute(
            select(SubjectModel)
            .join(SemesterModel)
            .where(SemesterModel.user_id == user_id)
            .options(selectinload(SubjectModel.class_sessions))
            .order_by(SubjectModel.name)
        )
        models = result.scalars().all()
        return [self._subject_to_entity(model) for model in models]
    
    async def delete_subject(self, subject_id: UUID) -> None:
        """
        Delete a subject by ID.
        
        Args:
            subject_id: The UUID of the subject to delete
            
        Raises:
            EntityNotFoundException: If subject with given ID doesn't exist
        """
        if subject_id is None:
            raise EntityNotFoundException(
                entity_type="Subject",
                entity_id=subject_id,
                code="SUBJECT_NOT_FOUND",
                message="Cannot delete subject: ID is None",
            )
            
        result = await self.session.execute(
            select(SubjectModel).where(SubjectModel.id == subject_id)
        )
        model = result.scalar_one_or_none()
        
        if model is None:
            raise EntityNotFoundException(
                entity_type="Subject",
                entity_id=subject_id,
                code="SUBJECT_NOT_FOUND",
                message=f"Subject with id {subject_id} not found",
            )
        
        await self.session.delete(model)
        await self.session.flush()
    
    # ==========================================================================
    # ClassSession Operations
    # ==========================================================================
    
    async def save_class_session(self, session: ClassSession) -> ClassSession:
        """
        Persist a class session entity.
        
        Creates new class session if ID doesn't exist, updates if it does.
        
        Args:
            session: The ClassSession entity to persist
            
        Returns:
            The persisted ClassSession entity
        """
        # Check if session exists
        existing = await self.session.get(ClassSessionModel, session.id)
        
        if existing:
            # Update existing
            existing.day_of_week = session.day_of_week.value
            existing.start_time = session.start_time
            existing.end_time = session.end_time
            existing.location = session.classroom
            existing.updated_at = session.updated_at
        else:
            # Create new
            model = ClassSessionModel(
                id=session.id,
                subject_id=session.subject_id,
                day_of_week=session.day_of_week.value,
                start_time=session.start_time,
                end_time=session.end_time,
                location=session.classroom,
                created_at=session.created_at,
                updated_at=session.updated_at,
            )
            self.session.add(model)
        
        await self.session.flush()
        return session
    
    async def get_class_session_by_id(self, session_id: UUID) -> Optional[ClassSession]:
        """
        Find a class session by its unique ID.
        
        Args:
            session_id: The UUID of the class session to find
            
        Returns:
            The ClassSession entity if found, None otherwise
        """
        if session_id is None:
            return None
            
        result = await self.session.execute(
            select(ClassSessionModel).where(ClassSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        return self._class_session_to_entity(model) if model else None
    
    async def get_class_sessions_by_subject(self, subject_id: UUID) -> List[ClassSession]:
        """
        Get all class sessions for a specific subject.
        
        Args:
            subject_id: The UUID of the subject
            
        Returns:
            List of ClassSession entities (empty list if none found)
        """
        if subject_id is None:
            return []
            
        result = await self.session.execute(
            select(ClassSessionModel)
            .where(ClassSessionModel.subject_id == subject_id)
            .order_by(ClassSessionModel.day_of_week, ClassSessionModel.start_time)
        )
        models = result.scalars().all()
        return [self._class_session_to_entity(model) for model in models]
    
    async def get_class_sessions_by_user(self, user_id: UUID) -> List[ClassSession]:
        """
        Get all class sessions for a specific user (across all subjects).
        
        Joins through subjects and semesters to filter by user.
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            List of ClassSession entities (empty list if none found)
        """
        if user_id is None:
            return []
            
        result = await self.session.execute(
            select(ClassSessionModel)
            .join(SubjectModel)
            .join(SemesterModel)
            .where(SemesterModel.user_id == user_id)
            .order_by(ClassSessionModel.day_of_week, ClassSessionModel.start_time)
        )
        models = result.scalars().all()
        return [self._class_session_to_entity(model) for model in models]
    
    async def delete_class_session(self, session_id: UUID) -> None:
        """
        Delete a class session by ID.
        
        Args:
            session_id: The UUID of the class session to delete
            
        Raises:
            EntityNotFoundException: If class session with given ID doesn't exist
        """
        if session_id is None:
            raise EntityNotFoundException(
                entity_type="ClassSession",
                entity_id=session_id,
                code="CLASS_SESSION_NOT_FOUND",
                message="Cannot delete class session: ID is None",
            )
            
        result = await self.session.execute(
            select(ClassSessionModel).where(ClassSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        
        if model is None:
            raise EntityNotFoundException(
                entity_type="ClassSession",
                entity_id=session_id,
                code="CLASS_SESSION_NOT_FOUND",
                message=f"Class session with id {session_id} not found",
            )
        
        await self.session.delete(model)
        await self.session.flush()
    
    # ==========================================================================
    # Entity-to-Model Mapping Functions (Private)
    # ==========================================================================
    
    def _semester_to_entity(self, model: SemesterModel) -> Semester:
        """
        Map SemesterModel ORM model to Semester domain entity.
        
        Args:
            model: The SemesterModel from database
            
        Returns:
            Semester domain entity
        """
        # Create base semester entity
        semester = Semester(
            id=model.id,
            user_id=model.user_id,
            name=model.name,
            start_date=model.start_date,
            end_date=model.end_date,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
        
        # Attach subjects if they were eagerly loaded
        if hasattr(model, 'subjects') and model.subjects is not None:
            for subject_model in model.subjects:
                subject = self._subject_to_entity(subject_model)
                semester._subjects.append(subject)
        
        return semester
    
    def _subject_to_entity(self, model: SubjectModel) -> Subject:
        """
        Map SubjectModel ORM model to Subject domain entity.
        
        Args:
            model: The SubjectModel from database
            
        Returns:
            Subject domain entity
        """
        # Create base subject entity
        subject = Subject(
            id=model.id,
            semester_id=model.semester_id,
            user_id=model.semester.user_id if model.semester else None,
            name=model.name,
            credits=model.credits,
            difficulty=model.difficulty,
            subject_type=model.type,
            color=HexColor(model.color),
            professor_name=model.professor_name,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
        
        # Attach class sessions if they were eagerly loaded
        if hasattr(model, 'class_sessions') and model.class_sessions is not None:
            for session_model in model.class_sessions:
                session = self._class_session_to_entity(session_model)
                subject._class_sessions.append(session)
        
        return subject
    
    def _class_session_to_entity(self, model: ClassSessionModel) -> ClassSession:
        """
        Map ClassSessionModel ORM model to ClassSession domain entity.
        
        Args:
            model: The ClassSessionModel from database
            
        Returns:
            ClassSession domain entity
        """
        return ClassSession(
            id=model.id,
            subject_id=model.subject_id,
            day_of_week=DayOfWeek(model.day_of_week),
            start_time=model.start_time,
            end_time=model.end_time,
            classroom=model.location,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
