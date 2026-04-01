"""
Academic Planning Repository Port (Interface).

Defines the contract for academic planning persistence operations.
The domain layer depends on this interface, not the concrete implementation.

Following Clean Architecture / Hexagonal pattern:
    - Port defines the interface (abstract methods)
    - Adapter (PostgresAcademicPlanningRepository) implements the interface
    - Domain never imports infrastructure (Dependency Inversion Principle)
    - All methods are async to support async database operations

Coverage:
    - Semester CRUD operations
    - Subject CRUD operations  
    - ClassSession CRUD operations
    - Query operations with filters by user and relationships
"""
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

from app.modules.academic_planning.domain.entities import (
    ClassSession,
    Semester,
    Subject,
)


class IAcademicPlanningRepository(ABC):
    """
    Port interface for academic planning persistence operations.
    
    Implementations:
        - PostgresAcademicPlanningRepository (production)
        - InMemoryAcademicPlanningRepository (testing)
    
    This interface provides full CRUD operations for the three main
    academic planning entities: Semester, Subject, and ClassSession.
    All methods are async to support SQLAlchemy async sessions.
    """
    
    # ==========================================================================
    # Semester Operations
    # ==========================================================================
    
    @abstractmethod
    async def save_semester(self, semester: Semester) -> Semester:
        """
        Persist a semester entity.
        
        Creates a new semester if ID doesn't exist, updates if it does.
        
        Args:
            semester: The Semester entity to persist
            
        Returns:
            The persisted Semester entity (may have updated timestamps)
        """
        pass
    
    @abstractmethod
    async def get_semester_by_id(self, semester_id: UUID) -> Optional[Semester]:
        """
        Find a semester by its unique ID.
        
        Args:
            semester_id: The UUID of the semester to find
            
        Returns:
            The Semester entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_semesters_by_user(self, user_id: UUID) -> list[Semester]:
        """
        Get all semesters for a specific user.
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            List of Semester entities (empty list if none found)
        """
        pass
    
    @abstractmethod
    async def get_active_semester_by_user(self, user_id: UUID) -> Optional[Semester]:
        """
        Get the currently active semester for a user.
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            The active Semester entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def delete_semester(self, semester_id: UUID) -> None:
        """
        Delete a semester by ID.
        
        Args:
            semester_id: The UUID of the semester to delete
            
        Raises:
            EntityNotFoundException: If semester with given ID doesn't exist
        """
        pass
    
    # ==========================================================================
    # Subject Operations
    # ==========================================================================
    
    @abstractmethod
    async def save_subject(self, subject: Subject) -> Subject:
        """
        Persist a subject entity.
        
        Creates a new subject if ID doesn't exist, updates if it does.
        
        Args:
            subject: The Subject entity to persist
            
        Returns:
            The persisted Subject entity (may have updated timestamps)
        """
        pass
    
    @abstractmethod
    async def get_subject_by_id(self, subject_id: UUID) -> Optional[Subject]:
        """
        Find a subject by its unique ID.
        
        Args:
            subject_id: The UUID of the subject to find
            
        Returns:
            The Subject entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_subjects_by_semester(self, semester_id: UUID) -> list[Subject]:
        """
        Get all subjects for a specific semester.
        
        Args:
            semester_id: The UUID of the semester
            
        Returns:
            List of Subject entities (empty list if none found)
        """
        pass
    
    @abstractmethod
    async def get_subjects_by_user(self, user_id: UUID) -> list[Subject]:
        """
        Get all subjects for a specific user (across all semesters).
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            List of Subject entities (empty list if none found)
        """
        pass
    
    @abstractmethod
    async def delete_subject(self, subject_id: UUID) -> None:
        """
        Delete a subject by ID.
        
        Args:
            subject_id: The UUID of the subject to delete
            
        Raises:
            EntityNotFoundException: If subject with given ID doesn't exist
        """
        pass
    
    # ==========================================================================
    # ClassSession Operations
    # ==========================================================================
    
    @abstractmethod
    async def save_class_session(self, session: ClassSession) -> ClassSession:
        """
        Persist a class session entity.
        
        Creates a new class session if ID doesn't exist, updates if it does.
        
        Args:
            session: The ClassSession entity to persist
            
        Returns:
            The persisted ClassSession entity (may have updated timestamps)
        """
        pass
    
    @abstractmethod
    async def get_class_session_by_id(self, session_id: UUID) -> Optional[ClassSession]:
        """
        Find a class session by its unique ID.
        
        Args:
            session_id: The UUID of the class session to find
            
        Returns:
            The ClassSession entity if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_class_sessions_by_subject(self, subject_id: UUID) -> list[ClassSession]:
        """
        Get all class sessions for a specific subject.
        
        Args:
            subject_id: The UUID of the subject
            
        Returns:
            List of ClassSession entities (empty list if none found)
        """
        pass
    
    @abstractmethod
    async def get_class_sessions_by_user(self, user_id: UUID) -> list[ClassSession]:
        """
        Get all class sessions for a specific user (across all subjects).
        
        Args:
            user_id: The UUID of the user
            
        Returns:
            List of ClassSession entities (empty list if none found)
        """
        pass
    
    @abstractmethod
    async def delete_class_session(self, session_id: UUID) -> None:
        """
        Delete a class session by ID.
        
        Args:
            session_id: The UUID of the class session to delete
            
        Raises:
            EntityNotFoundException: If class session with given ID doesn't exist
        """
        pass
