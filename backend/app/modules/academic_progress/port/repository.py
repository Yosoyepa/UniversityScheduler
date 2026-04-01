"""
Repository Port Interfaces for the Academic Progress module.

Following Hexagonal Architecture — backend-hexagonal-module skill:
- Use ABC + @abstractmethod for all interfaces
- All methods are async
- Import ONLY domain types (entities from this module's domain layer)
- Named with 'I' prefix: IGradeRepository, IEvaluationCriteriaRepository
- Inner layers (domain/port) NEVER import from adapter or infrastructure
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.modules.academic_progress.domain.entities import (
    EvaluationCriteria,
    Grade,
)


class IGradeRepository(ABC):
    """
    Abstract port for Grade persistence operations.

    Implemented by:
      - PostgresGradeRepository (adapter/postgres_repository.py)
      - InMemoryGradeRepository (tests)
    """

    @abstractmethod
    async def create(self, grade: Grade) -> Grade:
        """Persist a new grade and return it with the assigned id."""
        pass

    @abstractmethod
    async def get_by_id(self, grade_id: UUID) -> Optional[Grade]:
        """Return a grade by its id, or None if not found."""
        pass

    @abstractmethod
    async def get_by_subject(self, subject_id: UUID, user_id: UUID) -> List[Grade]:
        """Return all grades for a subject belonging to a specific user."""
        pass

    @abstractmethod
    async def get_by_user(self, user_id: UUID) -> List[Grade]:
        """Return all grades belonging to a user across all subjects."""
        pass

    @abstractmethod
    async def update(self, grade: Grade) -> Grade:
        """Persist updates to an existing grade entity."""
        pass

    @abstractmethod
    async def delete(self, grade_id: UUID) -> bool:
        """Delete a grade by id. Returns True if deleted, False if not found."""
        pass


class IEvaluationCriteriaRepository(ABC):
    """
    Abstract port for EvaluationCriteria persistence operations.

    Implemented by:
      - PostgresEvaluationCriteriaRepository (adapter/postgres_repository.py)
      - InMemoryEvaluationCriteriaRepository (tests)
    """

    @abstractmethod
    async def create(self, criteria: EvaluationCriteria) -> EvaluationCriteria:
        """Persist a new evaluation criteria and return it with the assigned id."""
        pass

    @abstractmethod
    async def get_by_id(self, criteria_id: UUID) -> Optional[EvaluationCriteria]:
        """Return a criteria by its id, or None if not found."""
        pass

    @abstractmethod
    async def get_by_subject(self, subject_id: UUID) -> List[EvaluationCriteria]:
        """Return all evaluation criteria for a given subject."""
        pass

    @abstractmethod
    async def update(self, criteria: EvaluationCriteria) -> EvaluationCriteria:
        """Persist updates to an existing criteria entity."""
        pass

    @abstractmethod
    async def delete(self, criteria_id: UUID) -> bool:
        """Delete a criteria by id. Returns True if deleted, False if not found."""
        pass
