"""
Application Use Cases for Academic Progress Module.

Following Hexagonal Architecture — backend-hexagonal-module skill:
- Use cases receive port interfaces via constructor injection (DIP)
- Each use case has a single execute() method (SRP)
- Orchestrates: validate input → call domain → call repository → return DTO
- Never imports from adapter or infrastructure layers
- Raises domain exceptions from app.shared.domain.exceptions

Use Cases:
    EvaluationCriteria:
        - CreateEvaluationCriteriaUseCase
        - ListCriteriaBySubjectUseCase
        - UpdateEvaluationCriteriaUseCase
        - DeleteEvaluationCriteriaUseCase

    Grade:
        - CreateGradeUseCase
        - ListGradesBySubjectUseCase
        - ListGradesByUserUseCase
        - UpdateGradeUseCase
        - DeleteGradeUseCase

    Calculation:
        - CalculateSubjectAverageUseCase (pure domain logic, no side effects)
"""
import logging
from typing import List, Optional
from uuid import UUID

from app.modules.academic_progress.domain.entities import (
    EvaluationCriteria,
    Grade,
)
from app.modules.academic_progress.port.repository import (
    IEvaluationCriteriaRepository,
    IGradeRepository,
)
from app.modules.academic_progress.application.schemas import SubjectAverageResponse
from app.shared.domain.exceptions import (
    EntityNotFoundException,
    ValidationException,
)

logger = logging.getLogger(__name__)


# =============================================================================
# DTOs (plain dataclasses for use case input)
# =============================================================================

from dataclasses import dataclass
from datetime import datetime


@dataclass
class CreateEvaluationCriteriaDTO:
    subject_id: UUID
    name: str
    weight: float
    category: Optional[str] = None


@dataclass
class UpdateEvaluationCriteriaDTO:
    name: Optional[str] = None
    weight: Optional[float] = None


@dataclass
class CreateGradeDTO:
    subject_id: UUID
    score: float
    max_score: float = 5.0
    criteria_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    graded_at: Optional[datetime] = None
    notes: Optional[str] = None


@dataclass
class UpdateGradeDTO:
    score: Optional[float] = None
    notes: Optional[str] = None


# =============================================================================
# EvaluationCriteria Use Cases
# =============================================================================

class CreateEvaluationCriteriaUseCase:
    """Create a new grading rubric item for a subject."""

    def __init__(self, repository: IEvaluationCriteriaRepository):
        self._repository = repository

    async def execute(self, dto: CreateEvaluationCriteriaDTO) -> EvaluationCriteria:
        """Validate, create domain entity, and persist."""
        from app.modules.academic_progress.domain.entities import GradeCategory
        category = GradeCategory(dto.category) if dto.category else None

        criteria = EvaluationCriteria(
            subject_id=dto.subject_id,
            name=dto.name,
            weight=dto.weight,
            category=category,
        )
        created = await self._repository.create(criteria)
        logger.info(
            "Created EvaluationCriteria %s for subject %s", created.id, dto.subject_id
        )
        return created


class ListCriteriaBySubjectUseCase:
    """List all grading criteria for a specific subject."""

    def __init__(self, repository: IEvaluationCriteriaRepository):
        self._repository = repository

    async def execute(self, subject_id: UUID) -> List[EvaluationCriteria]:
        return await self._repository.get_by_subject(subject_id)


class UpdateEvaluationCriteriaUseCase:
    """Update name or weight of an evaluation criteria."""

    def __init__(self, repository: IEvaluationCriteriaRepository):
        self._repository = repository

    async def execute(
        self, criteria_id: UUID, dto: UpdateEvaluationCriteriaDTO
    ) -> EvaluationCriteria:
        criteria = await self._repository.get_by_id(criteria_id)
        if not criteria:
            raise EntityNotFoundException(
                code="CRITERIA_NOT_FOUND",
                message=f"EvaluationCriteria with id {criteria_id} not found",
                entity_type="EvaluationCriteria",
            )
        # Delegate validation to domain entity method
        criteria.update(name=dto.name, weight=dto.weight)
        return await self._repository.update(criteria)


class DeleteEvaluationCriteriaUseCase:
    """Delete an evaluation criteria by id."""

    def __init__(self, repository: IEvaluationCriteriaRepository):
        self._repository = repository

    async def execute(self, criteria_id: UUID) -> bool:
        criteria = await self._repository.get_by_id(criteria_id)
        if not criteria:
            raise EntityNotFoundException(
                code="CRITERIA_NOT_FOUND",
                message=f"EvaluationCriteria with id {criteria_id} not found",
                entity_type="EvaluationCriteria",
            )
        return await self._repository.delete(criteria_id)


# =============================================================================
# Grade Use Cases
# =============================================================================

class CreateGradeUseCase:
    """Record a new grade for a student's evaluation criteria."""

    def __init__(self, repository: IGradeRepository):
        self._repository = repository

    async def execute(self, dto: CreateGradeDTO, user_id: UUID) -> Grade:
        """Validate, create domain entity, and persist."""
        grade = Grade(
            user_id=user_id,
            subject_id=dto.subject_id,
            criteria_id=dto.criteria_id,
            task_id=dto.task_id,
            score=dto.score,
            max_score=dto.max_score,
            graded_at=dto.graded_at,
            notes=dto.notes,
        )
        created = await self._repository.create(grade)
        logger.info("Created Grade %s for user %s, subject %s", created.id, user_id, dto.subject_id)
        return created


class ListGradesBySubjectUseCase:
    """List all grades for a subject belonging to a specific user."""

    def __init__(self, repository: IGradeRepository):
        self._repository = repository

    async def execute(self, subject_id: UUID, user_id: UUID) -> List[Grade]:
        return await self._repository.get_by_subject(subject_id=subject_id, user_id=user_id)


class ListGradesByUserUseCase:
    """List all grades across all subjects for a user."""

    def __init__(self, repository: IGradeRepository):
        self._repository = repository

    async def execute(self, user_id: UUID) -> List[Grade]:
        return await self._repository.get_by_user(user_id)


class UpdateGradeUseCase:
    """Update the score or notes of a grade (ownership verified)."""

    def __init__(self, repository: IGradeRepository):
        self._repository = repository

    async def execute(self, grade_id: UUID, dto: UpdateGradeDTO, user_id: UUID) -> Grade:
        grade = await self._repository.get_by_id(grade_id)
        if not grade:
            raise EntityNotFoundException(
                code="GRADE_NOT_FOUND",
                message=f"Grade with id {grade_id} not found",
                entity_type="Grade",
            )
        if grade.user_id != user_id:
            raise ValidationException(
                code="PERMISSION_DENIED",
                message="Permission denied to modify this grade",
            )
        # Delegate validation to domain entity method
        if dto.score is not None:
            grade.update_score(score=dto.score, notes=dto.notes)
        elif dto.notes is not None:
            grade.notes = dto.notes
            grade.touch()

        return await self._repository.update(grade)


class DeleteGradeUseCase:
    """Delete a grade (ownership verified)."""

    def __init__(self, repository: IGradeRepository):
        self._repository = repository

    async def execute(self, grade_id: UUID, user_id: UUID) -> bool:
        grade = await self._repository.get_by_id(grade_id)
        if not grade:
            raise EntityNotFoundException(
                code="GRADE_NOT_FOUND",
                message=f"Grade with id {grade_id} not found",
                entity_type="Grade",
            )
        if grade.user_id != user_id:
            raise ValidationException(
                code="PERMISSION_DENIED",
                message="Permission denied to delete this grade",
            )
        return await self._repository.delete(grade_id)


# =============================================================================
# Calculation Use Case
# =============================================================================

class CalculateSubjectAverageUseCase:
    """
    Calculate the weighted average for a subject.

    Algorithm (pure domain logic — no side effects):
      1. Fetch all grades for the subject/user
      2. For each grade that has a criteria_id, get the criteria weight
      3. Compute: sum(grade.normalized_score() * criteria.weight) / sum(criteria.weight)
      4. If no criteria weights, fall back to simple arithmetic mean of normalized_scores

    This use case is designed to be fully testable with mocked repositories.
    """

    def __init__(
        self,
        grade_repository: IGradeRepository,
        criteria_repository: IEvaluationCriteriaRepository,
    ):
        self._grade_repo = grade_repository
        self._criteria_repo = criteria_repository

    async def execute(self, subject_id: UUID, user_id: UUID) -> SubjectAverageResponse:
        grades = await self._grade_repo.get_by_subject(
            subject_id=subject_id, user_id=user_id
        )
        criteria_list = await self._criteria_repo.get_by_subject(subject_id)

        criteria_map = {c.id: c for c in criteria_list}

        weighted_sum = 0.0
        weight_total = 0.0

        for grade in grades:
            criteria = criteria_map.get(grade.criteria_id) if grade.criteria_id else None
            if criteria:
                weighted_sum += grade.normalized_score() * criteria.weight
                weight_total += criteria.weight

        if weight_total > 0:
            average = weighted_sum / weight_total
        elif grades:
            # Fallback: simple arithmetic mean when no criteria weights defined
            average = sum(g.normalized_score() for g in grades) / len(grades)
        else:
            average = 0.0

        # Determine if all criteria have a grade
        graded_criteria_ids = {g.criteria_id for g in grades if g.criteria_id}
        all_criteria_ids = {c.id for c in criteria_list}
        is_complete = all_criteria_ids.issubset(graded_criteria_ids) if all_criteria_ids else False

        return SubjectAverageResponse(
            subject_id=subject_id,
            average=round(average, 2),
            grades_count=len(grades),
            criteria_count=len(criteria_list),
            is_complete=is_complete,
        )
