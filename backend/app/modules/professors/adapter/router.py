"""
Professors Module — FastAPI Router.

Endpoints:
  /api/v1/professors   — Professor directory CRUD + office hours management
  /api/v1/tutoring     — Tutoring session booking and lifecycle

Follows architecture-patterns skill:
  - Thin controller — delegates all logic to use cases
  - Uses get_current_user dependency for JWT auth
  - Converts domain exceptions to HTTP status codes
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.cross_cutting.auth_middleware import AuthenticatedUser, get_current_user
from app.shared.domain.exceptions import EntityNotFoundException, ValidationException
from app.shared.infrastructure.database import get_async_session

from app.modules.professors.adapter.postgres_repository import (
    PostgresProfessorRepository,
    PostgresTutoringSessionRepository,
)
from app.modules.professors.adapter.schemas import (
    AddOfficeHourRequest,
    CreateProfessorRequest,
    OfficeHourResponse,
    ProfessorResponse,
    ScheduleTutoringRequest,
    TutoringSessionResponse,
    UpdateProfessorRequest,
    UpdateTutoringSessionRequest,
)
from app.modules.professors.application.use_cases import (
    AddOfficeHourUseCase,
    CancelTutoringSessionUseCase,
    CompleteTutoringSessionUseCase,
    CreateProfessorUseCase,
    DeleteProfessorUseCase,
    GetProfessorByIdUseCase,
    GetProfessorsDirectoryUseCase,
    ListTutoringSessionsUseCase,
    RemoveOfficeHourUseCase,
    ScheduleTutoringSessionUseCase,
    UpdateProfessorUseCase,
)
from app.modules.professors.port.repository import (
    IProfessorRepository,
    ITutoringSessionRepository,
)


# =============================================================================
# Router
# =============================================================================

router = APIRouter(tags=["Professors & Tutoring"])


# =============================================================================
# Dependency Injection
# =============================================================================

def get_prof_repository(
    session: AsyncSession = Depends(get_async_session),
) -> IProfessorRepository:
    return PostgresProfessorRepository(session)


def get_session_repository(
    session: AsyncSession = Depends(get_async_session),
) -> ITutoringSessionRepository:
    return PostgresTutoringSessionRepository(session)


# =============================================================================
# Helper
# =============================================================================

def _professor_to_response(professor) -> ProfessorResponse:
    return ProfessorResponse(
        id=professor.id,
        user_id=professor.user_id,
        name=professor.name,
        email=professor.email,
        department=professor.department,
        office_hours=[
            OfficeHourResponse(
                id=oh.id,
                professor_id=oh.professor_id,
                day_of_week=oh.day_of_week,
                start_time=oh.start_time,
                end_time=oh.end_time,
                location_type=oh.location_type.value,
                location_details=oh.location_details,
            )
            for oh in professor.office_hours
        ],
        is_available_now=professor.is_available_now(),
        created_at=professor.created_at,
        updated_at=professor.updated_at,
    )


def _session_to_response(session) -> TutoringSessionResponse:
    return TutoringSessionResponse(
        id=session.id,
        professor_id=session.professor_id,
        user_id=session.user_id,
        date=session.date,
        start_time=session.start_time,
        end_time=session.end_time,
        notes=session.notes,
        meeting_link=session.meeting_link,
        status=session.status.value,
        created_at=session.created_at,
        updated_at=session.updated_at,
    )


# =============================================================================
# Professor Endpoints
# =============================================================================

@router.post(
    "/professors",
    response_model=ProfessorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add professor to directory",
    description="Create a new professor entry in the user's private directory.",
)
async def create_professor(
    request: CreateProfessorRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> ProfessorResponse:
    use_case = CreateProfessorUseCase(repository=repo)
    try:
        professor = await use_case.execute(
            user_id=current_user.user_id,
            name=request.name,
            email=request.email,
            department=request.department,
            office_hours_data=[
                {
                    "day_of_week": oh.day_of_week,
                    "start_time": oh.start_time,
                    "end_time": oh.end_time,
                    "location_type": oh.location_type,
                    "location_details": oh.location_details,
                }
                for oh in request.office_hours
            ],
        )
        return _professor_to_response(professor)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/professors",
    response_model=List[ProfessorResponse],
    summary="List professor directory",
    description="Get all professors in the user's private directory.",
)
async def list_professors(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> List[ProfessorResponse]:
    use_case = GetProfessorsDirectoryUseCase(repository=repo)
    professors = await use_case.execute(user_id=current_user.user_id)
    return [_professor_to_response(p) for p in professors]


@router.get(
    "/professors/{professor_id}",
    response_model=ProfessorResponse,
    summary="Get professor by ID",
)
async def get_professor(
    professor_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> ProfessorResponse:
    use_case = GetProfessorByIdUseCase(repository=repo)
    try:
        professor = await use_case.execute(
            professor_id=professor_id, user_id=current_user.user_id
        )
        return _professor_to_response(professor)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


@router.patch(
    "/professors/{professor_id}",
    response_model=ProfessorResponse,
    summary="Update professor info",
)
async def update_professor(
    professor_id: UUID,
    request: UpdateProfessorRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> ProfessorResponse:
    use_case = UpdateProfessorUseCase(repository=repo)
    try:
        professor = await use_case.execute(
            professor_id=professor_id,
            user_id=current_user.user_id,
            name=request.name,
            email=request.email,
            department=request.department,
        )
        return _professor_to_response(professor)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete(
    "/professors/{professor_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove professor from directory",
)
async def delete_professor(
    professor_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> None:
    use_case = DeleteProfessorUseCase(repository=repo)
    try:
        await use_case.execute(
            professor_id=professor_id, user_id=current_user.user_id
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


# =============================================================================
# Office Hours Endpoints
# =============================================================================

@router.post(
    "/professors/{professor_id}/office-hours",
    response_model=OfficeHourResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add office hour block",
)
async def add_office_hour(
    professor_id: UUID,
    request: AddOfficeHourRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> OfficeHourResponse:
    use_case = AddOfficeHourUseCase(repository=repo)
    try:
        oh = await use_case.execute(
            professor_id=professor_id,
            user_id=current_user.user_id,
            day_of_week=request.day_of_week,
            start_time=request.start_time,
            end_time=request.end_time,
            location_type=request.location_type,
            location_details=request.location_details,
        )
        return OfficeHourResponse(
            id=oh.id,
            professor_id=oh.professor_id,
            day_of_week=oh.day_of_week,
            start_time=oh.start_time,
            end_time=oh.end_time,
            location_type=oh.location_type.value,
            location_details=oh.location_details,
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete(
    "/professors/{professor_id}/office-hours/{office_hour_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove an office hour block",
)
async def remove_office_hour(
    professor_id: UUID,
    office_hour_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repo: IProfessorRepository = Depends(get_prof_repository),
) -> None:
    use_case = RemoveOfficeHourUseCase(repository=repo)
    try:
        await use_case.execute(
            professor_id=professor_id,
            office_hour_id=office_hour_id,
            user_id=current_user.user_id,
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


# =============================================================================
# Tutoring Session Endpoints
# =============================================================================

@router.post(
    "/tutoring",
    response_model=TutoringSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Book a tutoring session",
    description="Schedule a pre-agreed tutoring appointment. Created as SCHEDULED.",
)
async def schedule_tutoring(
    request: ScheduleTutoringRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    prof_repo: IProfessorRepository = Depends(get_prof_repository),
    session_repo: ITutoringSessionRepository = Depends(get_session_repository),
) -> TutoringSessionResponse:
    use_case = ScheduleTutoringSessionUseCase(
        prof_repository=prof_repo,
        session_repository=session_repo,
    )
    try:
        session = await use_case.execute(
            user_id=current_user.user_id,
            professor_id=request.professor_id,
            session_date=request.date,
            start_time=request.start_time,
            end_time=request.end_time,
            notes=request.notes,
            meeting_link=request.meeting_link,
        )
        return _session_to_response(session)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/tutoring",
    response_model=List[TutoringSessionResponse],
    summary="List tutoring sessions",
    description="Get all tutoring sessions for the current user.",
)
async def list_tutoring_sessions(
    current_user: AuthenticatedUser = Depends(get_current_user),
    session_repo: ITutoringSessionRepository = Depends(get_session_repository),
) -> List[TutoringSessionResponse]:
    use_case = ListTutoringSessionsUseCase(session_repository=session_repo)
    sessions = await use_case.execute(user_id=current_user.user_id)
    return [_session_to_response(s) for s in sessions]


@router.patch(
    "/tutoring/{session_id}/cancel",
    response_model=TutoringSessionResponse,
    summary="Cancel a tutoring session",
)
async def cancel_tutoring(
    session_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    session_repo: ITutoringSessionRepository = Depends(get_session_repository),
) -> TutoringSessionResponse:
    use_case = CancelTutoringSessionUseCase(session_repository=session_repo)
    try:
        session = await use_case.execute(
            session_id=session_id, user_id=current_user.user_id
        )
        return _session_to_response(session)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.patch(
    "/tutoring/{session_id}/complete",
    response_model=TutoringSessionResponse,
    summary="Mark a tutoring session as completed",
)
async def complete_tutoring(
    session_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    session_repo: ITutoringSessionRepository = Depends(get_session_repository),
) -> TutoringSessionResponse:
    use_case = CompleteTutoringSessionUseCase(session_repository=session_repo)
    try:
        session = await use_case.execute(
            session_id=session_id, user_id=current_user.user_id
        )
        return _session_to_response(session)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
