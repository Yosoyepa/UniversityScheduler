"""
PostgreSQL SQLAlchemy implementations of Academic Progress repository ports.

Following Hexagonal Architecture — backend-hexagonal-module skill:
- Adapter layer: implements ports, depends on infrastructure models
- Translates ORM models <-> domain entities (pure dataclasses)
- Wraps SQLAlchemy exceptions in domain/infrastructure exceptions
- Never imported by domain or port layers
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy import exc
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.academic_progress.domain.entities import (
    EvaluationCriteria,
    Grade,
    GradeCategory,
)
from app.modules.academic_progress.infrastructure.models import (
    EvaluationCriteriaModel,
    GradeModel,
)
from app.modules.academic_progress.port.repository import (
    IEvaluationCriteriaRepository,
    IGradeRepository,
)
from app.shared.domain.exceptions import EntityNotFoundException, InfrastructureException


# =============================================================================
# PostgresGradeRepository
# =============================================================================

class PostgresGradeRepository(IGradeRepository):
    """SQLAlchemy Async implementation of IGradeRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_domain(self, model: GradeModel) -> Grade:
        """Convert ORM model to domain dataclass entity."""
        return Grade(
            id=model.id,
            user_id=model.user_id,
            subject_id=model.subject_id,
            criteria_id=model.criteria_id,
            task_id=model.task_id,
            score=float(model.score),
            max_score=float(model.max_score),
            graded_at=model.graded_at,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _apply_to_model(self, entity: Grade, model: GradeModel) -> None:
        """Sync domain entity fields onto ORM model (in-place update)."""
        model.user_id = entity.user_id
        model.subject_id = entity.subject_id
        model.criteria_id = entity.criteria_id
        model.task_id = entity.task_id
        model.score = entity.score
        model.max_score = entity.max_score
        model.graded_at = entity.graded_at
        model.notes = entity.notes
        model.updated_at = entity.updated_at

    async def create(self, grade: Grade) -> Grade:
        try:
            model = GradeModel(
                id=grade.id,
                user_id=grade.user_id,
                subject_id=grade.subject_id,
                criteria_id=grade.criteria_id,
                task_id=grade.task_id,
                score=grade.score,
                max_score=grade.max_score,
                graded_at=grade.graded_at,
                notes=grade.notes,
                created_at=grade.created_at,
                updated_at=grade.updated_at,
            )
            self._session.add(model)
            await self._session.flush()
            return self._to_domain(model)
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error creating grade: {str(e)}",
                service_name="postgres",
            )

    async def get_by_id(self, grade_id: UUID) -> Optional[Grade]:
        try:
            stmt = select(GradeModel).where(GradeModel.id == grade_id)
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            return self._to_domain(model) if model else None
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching grade {grade_id}: {str(e)}",
                service_name="postgres",
            )

    async def get_by_subject(self, subject_id: UUID, user_id: UUID) -> List[Grade]:
        try:
            stmt = (
                select(GradeModel)
                .where(GradeModel.subject_id == subject_id)
                .where(GradeModel.user_id == user_id)
                .order_by(GradeModel.created_at)
            )
            result = await self._session.execute(stmt)
            return [self._to_domain(m) for m in result.scalars().all()]
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching grades for subject {subject_id}: {str(e)}",
                service_name="postgres",
            )

    async def get_by_user(self, user_id: UUID) -> List[Grade]:
        try:
            stmt = (
                select(GradeModel)
                .where(GradeModel.user_id == user_id)
                .order_by(GradeModel.subject_id, GradeModel.created_at)
            )
            result = await self._session.execute(stmt)
            return [self._to_domain(m) for m in result.scalars().all()]
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching grades for user {user_id}: {str(e)}",
                service_name="postgres",
            )

    async def update(self, grade: Grade) -> Grade:
        try:
            stmt = select(GradeModel).where(GradeModel.id == grade.id)
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            if not model:
                raise EntityNotFoundException(
                    code="GRADE_NOT_FOUND",
                    message=f"Grade with id {grade.id} not found",
                    entity_type="Grade",
                )
            self._apply_to_model(grade, model)
            await self._session.flush()
            return self._to_domain(model)
        except EntityNotFoundException:
            raise
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error updating grade {grade.id}: {str(e)}",
                service_name="postgres",
            )

    async def delete(self, grade_id: UUID) -> bool:
        try:
            stmt = select(GradeModel).where(GradeModel.id == grade_id)
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            if not model:
                raise EntityNotFoundException(
                    code="GRADE_NOT_FOUND",
                    message=f"Grade with id {grade_id} not found",
                    entity_type="Grade",
                )
            await self._session.delete(model)
            await self._session.flush()
            return True
        except EntityNotFoundException:
            raise
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error deleting grade {grade_id}: {str(e)}",
                service_name="postgres",
            )


# =============================================================================
# PostgresEvaluationCriteriaRepository
# =============================================================================

class PostgresEvaluationCriteriaRepository(IEvaluationCriteriaRepository):
    """SQLAlchemy Async implementation of IEvaluationCriteriaRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_domain(self, model: EvaluationCriteriaModel) -> EvaluationCriteria:
        """Convert ORM model to domain dataclass entity."""
        return EvaluationCriteria(
            id=model.id,
            subject_id=model.subject_id,
            name=model.name,
            weight=float(model.weight),
            category=GradeCategory(model.category.value) if model.category else None,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _apply_to_model(
        self, entity: EvaluationCriteria, model: EvaluationCriteriaModel
    ) -> None:
        """Sync domain entity fields onto ORM model (in-place update)."""
        model.name = entity.name
        model.weight = entity.weight
        model.updated_at = entity.updated_at

    async def create(self, criteria: EvaluationCriteria) -> EvaluationCriteria:
        try:
            model = EvaluationCriteriaModel(
                id=criteria.id,
                subject_id=criteria.subject_id,
                name=criteria.name,
                weight=criteria.weight,
                category=criteria.category,
                created_at=criteria.created_at,
                updated_at=criteria.updated_at,
            )
            self._session.add(model)
            await self._session.flush()
            return self._to_domain(model)
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error creating evaluation criteria: {str(e)}",
                service_name="postgres",
            )

    async def get_by_id(self, criteria_id: UUID) -> Optional[EvaluationCriteria]:
        try:
            stmt = select(EvaluationCriteriaModel).where(
                EvaluationCriteriaModel.id == criteria_id
            )
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            return self._to_domain(model) if model else None
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching criteria {criteria_id}: {str(e)}",
                service_name="postgres",
            )

    async def get_by_subject(self, subject_id: UUID) -> List[EvaluationCriteria]:
        try:
            stmt = (
                select(EvaluationCriteriaModel)
                .where(EvaluationCriteriaModel.subject_id == subject_id)
                .order_by(EvaluationCriteriaModel.name)
            )
            result = await self._session.execute(stmt)
            return [self._to_domain(m) for m in result.scalars().all()]
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching criteria for subject {subject_id}: {str(e)}",
                service_name="postgres",
            )

    async def update(self, criteria: EvaluationCriteria) -> EvaluationCriteria:
        try:
            stmt = select(EvaluationCriteriaModel).where(
                EvaluationCriteriaModel.id == criteria.id
            )
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            if not model:
                raise EntityNotFoundException(
                    code="CRITERIA_NOT_FOUND",
                    message=f"EvaluationCriteria with id {criteria.id} not found",
                    entity_type="EvaluationCriteria",
                )
            self._apply_to_model(criteria, model)
            await self._session.flush()
            return self._to_domain(model)
        except EntityNotFoundException:
            raise
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error updating criteria {criteria.id}: {str(e)}",
                service_name="postgres",
            )

    async def delete(self, criteria_id: UUID) -> bool:
        try:
            stmt = select(EvaluationCriteriaModel).where(
                EvaluationCriteriaModel.id == criteria_id
            )
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            if not model:
                raise EntityNotFoundException(
                    code="CRITERIA_NOT_FOUND",
                    message=f"EvaluationCriteria with id {criteria_id} not found",
                    entity_type="EvaluationCriteria",
                )
            await self._session.delete(model)
            await self._session.flush()
            return True
        except EntityNotFoundException:
            raise
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error deleting criteria {criteria_id}: {str(e)}",
                service_name="postgres",
            )
