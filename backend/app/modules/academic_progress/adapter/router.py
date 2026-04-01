"""
FastAPI Router for Phase 3: Academic Progress (Grades & Evaluation Criteria).

Following Hexagonal Architecture — backend-hexagonal-module skill:
- Defines REST endpoints, delegates to use cases
- Uses Depends() for dependency injection
- Auth guard via get_current_user from users adapter
- Prefix: /grades and /evaluation-criteria
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.academic_progress.adapter.postgres_repository import (
    PostgresEvaluationCriteriaRepository,
    PostgresGradeRepository,
)
from app.modules.academic_progress.application.schemas import (
    CreateEvaluationCriteriaRequest,
    CreateGradeRequest,
    EvaluationCriteriaResponse,
    GradeResponse,
    SubjectAverageResponse,
    UpdateEvaluationCriteriaRequest,
    UpdateGradeRequest,
    MessageResponse,
)
from app.modules.academic_progress.application.use_cases import (
    CalculateSubjectAverageUseCase,
    CreateEvaluationCriteriaDTO,
    CreateEvaluationCriteriaUseCase,
    CreateGradeDTO,
    CreateGradeUseCase,
    DeleteEvaluationCriteriaUseCase,
    DeleteGradeUseCase,
    ListCriteriaBySubjectUseCase,
    ListGradesBySubjectUseCase,
    ListGradesByUserUseCase,
    UpdateEvaluationCriteriaDTO,
    UpdateEvaluationCriteriaUseCase,
    UpdateGradeDTO,
    UpdateGradeUseCase,
)
from app.modules.users.adapter.router import get_current_user
from app.modules.users.domain.entities import User
from app.shared.infrastructure.database import get_async_session

router = APIRouter(tags=["Academic Progress"])


# =============================================================================
# Dependencies
# =============================================================================

async def get_grade_repository(
    session: AsyncSession = Depends(get_async_session),
) -> PostgresGradeRepository:
    return PostgresGradeRepository(session)


async def get_criteria_repository(
    session: AsyncSession = Depends(get_async_session),
) -> PostgresEvaluationCriteriaRepository:
    return PostgresEvaluationCriteriaRepository(session)


# =============================================================================
# Grades Endpoints
# =============================================================================

grades_router = APIRouter(prefix="/grades")


@grades_router.post(
    "",
    response_model=GradeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record a new grade",
    description="Record a grade for an evaluation criteria in a subject.",
)
async def create_grade(
    request: CreateGradeRequest,
    grade_repo: PostgresGradeRepository = Depends(get_grade_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> GradeResponse:
    use_case = CreateGradeUseCase(repository=grade_repo)
    dto = CreateGradeDTO(
        subject_id=request.subject_id,
        criteria_id=request.criteria_id,
        task_id=request.task_id,
        score=request.score,
        max_score=request.max_score,
        graded_at=request.graded_at,
        notes=request.notes,
    )
    grade = await use_case.execute(dto=dto, user_id=current_user.id)
    await session.commit()
    return GradeResponse.from_entity(grade)


@grades_router.get(
    "",
    response_model=List[GradeResponse],
    summary="List grades",
    description="Get all grades for the current user, optionally filtered by subject.",
)
async def list_grades(
    subject_id: Optional[UUID] = Query(None, description="Filter by subject ID"),
    grade_repo: PostgresGradeRepository = Depends(get_grade_repository),
    current_user: User = Depends(get_current_user),
) -> List[GradeResponse]:
    if subject_id:
        use_case = ListGradesBySubjectUseCase(repository=grade_repo)
        grades = await use_case.execute(subject_id=subject_id, user_id=current_user.id)
    else:
        use_case = ListGradesByUserUseCase(repository=grade_repo)
        grades = await use_case.execute(user_id=current_user.id)
    return [GradeResponse.from_entity(g) for g in grades]


@grades_router.get(
    "/subjects/{subject_id}/average",
    response_model=SubjectAverageResponse,
    summary="Get subject average",
    description="Calculate the weighted average grade for a subject using evaluation criteria weights.",
)
async def get_subject_average(
    subject_id: UUID,
    grade_repo: PostgresGradeRepository = Depends(get_grade_repository),
    criteria_repo: PostgresEvaluationCriteriaRepository = Depends(get_criteria_repository),
    current_user: User = Depends(get_current_user),
) -> SubjectAverageResponse:
    use_case = CalculateSubjectAverageUseCase(
        grade_repository=grade_repo,
        criteria_repository=criteria_repo,
    )
    return await use_case.execute(subject_id=subject_id, user_id=current_user.id)


@grades_router.patch(
    "/{grade_id}",
    response_model=GradeResponse,
    summary="Update a grade",
    description="Update the score or notes of an existing grade.",
)
async def update_grade(
    grade_id: UUID,
    request: UpdateGradeRequest,
    grade_repo: PostgresGradeRepository = Depends(get_grade_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> GradeResponse:
    use_case = UpdateGradeUseCase(repository=grade_repo)
    dto = UpdateGradeDTO(score=request.score, notes=request.notes)
    grade = await use_case.execute(grade_id=grade_id, dto=dto, user_id=current_user.id)
    await session.commit()
    return GradeResponse.from_entity(grade)


@grades_router.delete(
    "/{grade_id}",
    response_model=MessageResponse,
    summary="Delete a grade",
    description="Permanently delete a grade record.",
)
async def delete_grade(
    grade_id: UUID,
    grade_repo: PostgresGradeRepository = Depends(get_grade_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> MessageResponse:
    use_case = DeleteGradeUseCase(repository=grade_repo)
    await use_case.execute(grade_id=grade_id, user_id=current_user.id)
    await session.commit()
    return MessageResponse(message="Grade deleted successfully")


# =============================================================================
# Evaluation Criteria Endpoints
# =============================================================================

criteria_router = APIRouter(prefix="/evaluation-criteria")


@criteria_router.post(
    "",
    response_model=EvaluationCriteriaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create evaluation criteria",
    description="Add a grading rubric item (e.g. 'Parcial 1 = 30%') to a subject.",
)
async def create_criteria(
    request: CreateEvaluationCriteriaRequest,
    criteria_repo: PostgresEvaluationCriteriaRepository = Depends(get_criteria_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> EvaluationCriteriaResponse:
    use_case = CreateEvaluationCriteriaUseCase(repository=criteria_repo)
    dto = CreateEvaluationCriteriaDTO(
        subject_id=request.subject_id,
        name=request.name,
        weight=request.weight,
        category=request.category.value if request.category else None,
    )
    criteria = await use_case.execute(dto=dto)
    await session.commit()
    return EvaluationCriteriaResponse.from_entity(criteria)


@criteria_router.get(
    "",
    response_model=List[EvaluationCriteriaResponse],
    summary="List evaluation criteria",
    description="Get all evaluation criteria for a subject.",
)
async def list_criteria(
    subject_id: UUID = Query(..., description="Subject ID to filter criteria"),
    criteria_repo: PostgresEvaluationCriteriaRepository = Depends(get_criteria_repository),
    current_user: User = Depends(get_current_user),
) -> List[EvaluationCriteriaResponse]:
    use_case = ListCriteriaBySubjectUseCase(repository=criteria_repo)
    criteria_list = await use_case.execute(subject_id=subject_id)
    return [EvaluationCriteriaResponse.from_entity(c) for c in criteria_list]


@criteria_router.patch(
    "/{criteria_id}",
    response_model=EvaluationCriteriaResponse,
    summary="Update evaluation criteria",
    description="Update name or weight of an evaluation criteria.",
)
async def update_criteria(
    criteria_id: UUID,
    request: UpdateEvaluationCriteriaRequest,
    criteria_repo: PostgresEvaluationCriteriaRepository = Depends(get_criteria_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> EvaluationCriteriaResponse:
    use_case = UpdateEvaluationCriteriaUseCase(repository=criteria_repo)
    dto = UpdateEvaluationCriteriaDTO(name=request.name, weight=request.weight)
    criteria = await use_case.execute(criteria_id=criteria_id, dto=dto)
    await session.commit()
    return EvaluationCriteriaResponse.from_entity(criteria)


@criteria_router.delete(
    "/{criteria_id}",
    response_model=MessageResponse,
    summary="Delete evaluation criteria",
    description="Permanently delete an evaluation criteria. Grades linked to it will have criteria_id set to null.",
)
async def delete_criteria(
    criteria_id: UUID,
    criteria_repo: PostgresEvaluationCriteriaRepository = Depends(get_criteria_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> MessageResponse:
    use_case = DeleteEvaluationCriteriaUseCase(repository=criteria_repo)
    await use_case.execute(criteria_id=criteria_id)
    await session.commit()
    return MessageResponse(message="Evaluation criteria deleted successfully")


# Compose both sub-routers under a single router for main.py inclusion
router.include_router(grades_router)
router.include_router(criteria_router)
