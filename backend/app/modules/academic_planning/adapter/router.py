"""
Academic Planning API Router.

FastAPI router for academic planning endpoints.
Handles semester, subject, and class session management.

Following architecture-patterns skill:
    - Router is the adapter layer (interface adapter)
    - Thin controller - delegates to use cases
    - Handles HTTP concerns only
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.cross_cutting.auth_middleware import get_current_user, AuthenticatedUser
from app.shared.domain.exceptions import ScheduleConflictException, EntityNotFoundException, ValidationException
from app.shared.infrastructure.database import get_async_session
from app.modules.academic_planning.adapter.postgres_repository import PostgresAcademicPlanningRepository
from app.modules.academic_planning.domain.services import ConflictDetectionService
from app.modules.academic_planning.port.repository import IAcademicPlanningRepository
from app.modules.academic_planning.adapter.schemas import (
    CreateSemesterRequest,
    CreateSubjectRequest,
    CreateClassSessionRequest,
    UpdateSemesterRequest,
    UpdateSubjectRequest,
    UpdateClassSessionRequest,
    SemesterResponse,
    SubjectResponse,
    ClassSessionResponse,
    ScheduleResponse,
    ScheduleItemResponse,
    ConflictResponse,
    MessageResponse,
)
from app.modules.academic_planning.application.use_cases import (
    # Semester use cases
    CreateSemesterUseCase,
    GetSemesterByIdUseCase,
    GetSemestersByUserUseCase,
    GetActiveSemesterUseCase,
    UpdateSemesterUseCase,
    DeleteSemesterUseCase,
    ActivateSemesterUseCase,
    CreateSemesterDTO,
    UpdateSemesterDTO,
    # Subject use cases
    CreateSubjectUseCase,
    GetSubjectByIdUseCase,
    GetSubjectsBySemesterUseCase,
    GetSubjectsByUserUseCase,
    UpdateSubjectUseCase,
    DeleteSubjectUseCase,
    CreateSubjectDTO,
    UpdateSubjectDTO,
    # ClassSession use cases
    AddClassSessionUseCase,
    GetClassSessionByIdUseCase,
    GetClassSessionsBySubjectUseCase,
    GetClassSessionsByUserUseCase,
    UpdateClassSessionUseCase,
    RemoveClassSessionUseCase,
    CreateClassSessionDTO,
    UpdateClassSessionDTO,
)


# =============================================================================
# Router Definition
# =============================================================================

router = APIRouter(tags=["Academic Planning"])


# =============================================================================
# Dependency Injection Helpers
# =============================================================================

def get_repository(session: AsyncSession = Depends(get_async_session)) -> IAcademicPlanningRepository:
    """Get the academic planning repository."""
    return PostgresAcademicPlanningRepository(session)


def get_conflict_service() -> ConflictDetectionService:
    """Get the conflict detection service."""
    return ConflictDetectionService()


# =============================================================================
# Exception Handler Helper
# =============================================================================

def handle_schedule_conflict(exc: ScheduleConflictException) -> HTTPException:
    """Convert ScheduleConflictException to HTTPException with 409 status."""
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={
            "error": exc.code,
            "message": exc.message,
            "conflicts": exc.conflicts,
            "resolution_options": exc.resolution_options,
        }
    )


# =============================================================================
# Semester Endpoints
# =============================================================================

@router.post(
    "/semesters",
    response_model=SemesterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new semester",
    description="Create a new academic semester for the current user.",
    responses={
        409: {"model": ConflictResponse, "description": "Schedule conflict detected"},
    },
)
async def create_semester(
    request: CreateSemesterRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Create a new semester."""
    use_case = CreateSemesterUseCase(repository=repository)
    dto = CreateSemesterDTO(
        name=request.name,
        start_date=request.start_date,
        end_date=request.end_date,
    )
    
    try:
        semester = await use_case.execute(dto=dto, user_id=current_user.user_id)
        return semester
    except ScheduleConflictException as e:
        raise handle_schedule_conflict(e)


@router.get(
    "/semesters",
    response_model=List[SemesterResponse],
    summary="List user semesters",
    description="Get all semesters for the current user.",
)
async def list_semesters(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """List all semesters for the current user."""
    use_case = GetSemestersByUserUseCase(repository=repository)
    return await use_case.execute(user_id=current_user.user_id)


@router.get(
    "/semesters/active",
    response_model=Optional[SemesterResponse],
    summary="Get active semester",
    description="Get the currently active semester for the current user.",
)
async def get_active_semester(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Get the currently active semester."""
    use_case = GetActiveSemesterUseCase(repository=repository)
    return await use_case.execute(user_id=current_user.user_id)


@router.get(
    "/semesters/{semester_id}",
    response_model=SemesterResponse,
    summary="Get semester by ID",
    description="Get a specific semester by its ID.",
)
async def get_semester(
    semester_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Get a semester by ID."""
    use_case = GetSemesterByIdUseCase(repository=repository)
    semester = await use_case.execute(semester_id=semester_id)
    
    # Verify ownership
    if semester.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this semester",
        )
    
    return semester


@router.patch(
    "/semesters/{semester_id}",
    response_model=SemesterResponse,
    summary="Update semester",
    description="Update semester details.",
)
async def update_semester(
    semester_id: UUID,
    request: UpdateSemesterRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Update a semester."""
    use_case = UpdateSemesterUseCase(repository=repository)
    dto = UpdateSemesterDTO(
        name=request.name,
        start_date=request.start_date,
        end_date=request.end_date,
    )
    
    try:
        return await use_case.execute(
            semester_id=semester_id,
            dto=dto,
            user_id=current_user.user_id,
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete(
    "/semesters/{semester_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete semester",
    description="Delete a semester and all its subjects and sessions.",
)
async def delete_semester(
    semester_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Delete a semester."""
    use_case = DeleteSemesterUseCase(repository=repository)
    
    try:
        await use_case.execute(semester_id=semester_id, user_id=current_user.user_id)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


@router.post(
    "/semesters/{semester_id}/activate",
    response_model=SemesterResponse,
    summary="Activate semester",
    description="Activate a semester (emits SemesterActivatedEvent).",
)
async def activate_semester(
    semester_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Activate a semester."""
    use_case = ActivateSemesterUseCase(repository=repository)
    
    try:
        return await use_case.execute(semester_id=semester_id, user_id=current_user.user_id)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


# =============================================================================
# Subject Endpoints
# =============================================================================

@router.post(
    "/subjects",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new subject",
    description="Create a new subject in a semester with conflict detection.",
    responses={
        409: {"model": ConflictResponse, "description": "Schedule conflict detected"},
    },
)
async def create_subject(
    request: CreateSubjectRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
    conflict_service: ConflictDetectionService = Depends(get_conflict_service),
):
    """Create a new subject."""
    use_case = CreateSubjectUseCase(
        repository=repository,
        conflict_service=conflict_service,
    )
    dto = CreateSubjectDTO(
        name=request.name,
        semester_id=request.semester_id,
        credits=request.credits,
        difficulty=request.difficulty,
        subject_type=request.subject_type,
        color=request.color,
        professor_id=request.professor_id,
        class_sessions=[
            CreateClassSessionDTO(
                subject_id=UUID(int=0),  # Placeholder, set properly in use case
                day_of_week=s.day_of_week,
                start_time=s.start_time,
                end_time=s.end_time,
                classroom=s.classroom,
            ) for s in request.class_sessions
        ],
    )
    
    try:
        return await use_case.execute(dto=dto, user_id=current_user.user_id)
    except ScheduleConflictException as e:
        raise handle_schedule_conflict(e)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/subjects",
    response_model=List[SubjectResponse],
    summary="List subjects",
    description="Get all subjects for the current user, optionally filtered by semester.",
)
async def list_subjects(
    semester_id: Optional[UUID] = Query(None, description="Filter by semester ID"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """List subjects for the current user."""
    if semester_id:
        use_case = GetSubjectsBySemesterUseCase(repository=repository)
        return await use_case.execute(semester_id=semester_id)
    else:
        use_case = GetSubjectsByUserUseCase(repository=repository)
        return await use_case.execute(user_id=current_user.user_id)


@router.get(
    "/subjects/{subject_id}",
    response_model=SubjectResponse,
    summary="Get subject by ID",
    description="Get a specific subject by its ID.",
)
async def get_subject(
    subject_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Get a subject by ID."""
    use_case = GetSubjectByIdUseCase(repository=repository)
    subject = await use_case.execute(subject_id=subject_id)
    
    # Verify ownership
    if subject.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this subject",
        )
    
    return subject


@router.patch(
    "/subjects/{subject_id}",
    response_model=SubjectResponse,
    summary="Update subject",
    description="Update subject details.",
)
async def update_subject(
    subject_id: UUID,
    request: UpdateSubjectRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Update a subject."""
    use_case = UpdateSubjectUseCase(repository=repository)
    dto = UpdateSubjectDTO(
        name=request.name,
        credits=request.credits,
        difficulty=request.difficulty,
        subject_type=request.subject_type,
        color=request.color,
        professor_id=request.professor_id,
    )
    
    try:
        return await use_case.execute(
            subject_id=subject_id,
            dto=dto,
            user_id=current_user.user_id,
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete(
    "/subjects/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete subject",
    description="Delete a subject and all its class sessions.",
)
async def delete_subject(
    subject_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Delete a subject."""
    use_case = DeleteSubjectUseCase(repository=repository)
    
    try:
        await use_case.execute(subject_id=subject_id, user_id=current_user.user_id)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


# =============================================================================
# Class Session Endpoints
# =============================================================================

@router.post(
    "/subjects/{subject_id}/sessions",
    response_model=ClassSessionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add class session",
    description="Add a class session to a subject with conflict detection.",
    responses={
        409: {"model": ConflictResponse, "description": "Schedule conflict detected"},
    },
)
async def add_class_session(
    subject_id: UUID,
    request: CreateClassSessionRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
    conflict_service: ConflictDetectionService = Depends(get_conflict_service),
):
    """Add a class session to a subject."""
    use_case = AddClassSessionUseCase(
        repository=repository,
        conflict_service=conflict_service,
    )
    dto = CreateClassSessionDTO(
        subject_id=subject_id,
        day_of_week=request.day_of_week,
        start_time=request.start_time,
        end_time=request.end_time,
        classroom=request.classroom,
    )
    
    try:
        return await use_case.execute(dto=dto, user_id=current_user.user_id)
    except ScheduleConflictException as e:
        raise handle_schedule_conflict(e)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get(
    "/sessions",
    response_model=List[ClassSessionResponse],
    summary="List all user sessions",
    description="Get all class sessions for the current user (for schedule view).",
)
async def list_class_sessions(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """List all class sessions for the current user."""
    use_case = GetClassSessionsByUserUseCase(repository=repository)
    return await use_case.execute(user_id=current_user.user_id)


@router.get(
    "/sessions/{session_id}",
    response_model=ClassSessionResponse,
    summary="Get session by ID",
    description="Get a specific class session by its ID.",
)
async def get_class_session(
    session_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Get a class session by ID."""
    use_case = GetClassSessionByIdUseCase(repository=repository)
    session = await use_case.execute(session_id=session_id)
    
    # Get subject to verify ownership
    subject_use_case = GetSubjectByIdUseCase(repository=repository)
    subject = await subject_use_case.execute(subject_id=session.subject_id)
    
    if subject.user_id != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this session",
        )
    
    return session


@router.patch(
    "/sessions/{session_id}",
    response_model=ClassSessionResponse,
    summary="Update session",
    description="Update class session details.",
)
async def update_class_session(
    session_id: UUID,
    request: UpdateClassSessionRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
    conflict_service: ConflictDetectionService = Depends(get_conflict_service),
):
    """Update a class session."""
    use_case = UpdateClassSessionUseCase(
        repository=repository,
        conflict_service=conflict_service,
    )
    dto = UpdateClassSessionDTO(
        day_of_week=request.day_of_week,
        start_time=request.start_time,
        end_time=request.end_time,
        classroom=request.classroom,
    )
    
    try:
        return await use_case.execute(
            session_id=session_id,
            dto=dto,
            user_id=current_user.user_id,
        )
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete session",
    description="Remove a class session from a subject.",
)
async def delete_class_session(
    session_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Delete a class session."""
    use_case = RemoveClassSessionUseCase(repository=repository)
    
    try:
        await use_case.execute(session_id=session_id, user_id=current_user.user_id)
    except EntityNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=e.message)


# =============================================================================
# Schedule Endpoint
# =============================================================================

@router.get(
    "/schedule",
    response_model=ScheduleResponse,
    summary="Get weekly schedule",
    description="Get full weekly schedule (aggregated view of all class sessions).",
)
async def get_schedule(
    current_user: AuthenticatedUser = Depends(get_current_user),
    repository: IAcademicPlanningRepository = Depends(get_repository),
):
    """Get the full weekly schedule for the current user."""
    # Get all subjects with their sessions
    subjects_use_case = GetSubjectsByUserUseCase(repository=repository)
    subjects = await subjects_use_case.execute(user_id=current_user.user_id)
    
    # Build aggregated schedule view
    schedule_items: List[ScheduleItemResponse] = []
    total_minutes = 0
    
    for subject in subjects:
        for session in subject.class_sessions:
            schedule_items.append(ScheduleItemResponse(
                session_id=session.id,
                subject_id=subject.id,
                subject_name=subject.name,
                subject_color=str(subject.color),
                day_of_week=session.day_of_week,
                start_time=session.start_time,
                end_time=session.end_time,
                classroom=session.classroom,
                professor_id=subject.professor_id,
            ))
            
            # Calculate duration
            from app.shared.domain.value_objects import TimeRange
            time_range = TimeRange(start_time=session.start_time, end_time=session.end_time)
            total_minutes += time_range.duration_minutes
    
    return ScheduleResponse(
        user_id=current_user.user_id,
        items=schedule_items,
        total_weekly_hours=total_minutes / 60.0,
    )
