"""
FastAPI router for Phase 2: Task Management.

Following Hexagonal Architecture and backend-hexagonal-module skill:
- Defines REST endpoints mapping HTTP to Use Cases
- Injects required dependencies (Repos, Current User)
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tasks.adapter.postgres_repository import PostgresTaskRepository
from app.modules.tasks.adapter.schemas import (
    CreateTaskRequest,
    TaskResponse,
    UpdateTaskRequest,
    UpdateTaskStatusRequest,
)
from app.modules.tasks.application.use_cases import (
    CreateTaskDTO,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    UpdateTaskDTO,
    UpdateTaskStatusUseCase,
    UpdateTaskUseCase,
)
from app.modules.tasks.domain.entities import TaskStatus, TaskPriority, TaskCategory
from app.modules.users.adapter.router import get_current_user
from app.modules.users.domain.entities import User
from app.shared.domain.value_objects import MessageResponse
from app.shared.infrastructure.database import get_async_session

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# =============================================================================
# Dependencies
# =============================================================================

async def get_task_repository(
    session: AsyncSession = Depends(get_async_session),
) -> PostgresTaskRepository:
    """Dependency injection for Task Repository."""
    return PostgresTaskRepository(session)


# =============================================================================
# Endpoints
# =============================================================================


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Creates a task in the TODO state and assigns it to the current user.",
)
async def create_task(
    request: CreateTaskRequest,
    repo: PostgresTaskRepository = Depends(get_task_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    use_case = CreateTaskUseCase(repository=repo)
    dto = CreateTaskDTO(
        title=request.title,
        description=request.description,
        subject_id=request.subject_id,
        due_date=request.due_date,
        priority=request.priority,
        category=request.category,
    )
    
    task = await use_case.execute(dto=dto, user_id=current_user.id)
    await session.commit()
    return TaskResponse.model_validate(task)


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="List user tasks",
    description="Get tasks for current user with optional filtering by status, subject, or category.",
)
async def list_tasks(
    status: Optional[TaskStatus] = Query(None, description="Filter by status"),
    subject_id: Optional[UUID] = Query(None, description="Filter by subject"),
    category: Optional[TaskCategory] = Query(None, description="Filter by category"),
    repo: PostgresTaskRepository = Depends(get_task_repository),
    current_user: User = Depends(get_current_user),
) -> List[TaskResponse]:
    use_case = ListTasksUseCase(repository=repo)
    tasks = await use_case.execute(
        user_id=current_user.id,
        status=status,
        subject_id=subject_id,
        category=category,
    )
    return [TaskResponse.model_validate(t) for t in tasks]


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update basic task info",
    description="Update a task's text, subject, due_date, or priority.",
)
async def update_task(
    task_id: UUID,
    request: UpdateTaskRequest,
    repo: PostgresTaskRepository = Depends(get_task_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    use_case = UpdateTaskUseCase(repository=repo)
    dto = UpdateTaskDTO(
        title=request.title,
        description=request.description,
        subject_id=request.subject_id,
        due_date=request.due_date,
        priority=request.priority,
        category=request.category,
    )
    
    task = await use_case.execute(task_id=task_id, dto=dto, user_id=current_user.id)
    await session.commit()
    return TaskResponse.model_validate(task)


@router.patch(
    "/{task_id}/status",
    response_model=TaskResponse,
    summary="Update task status",
    description="Execute state machine transition for a task (e.g. TODO -> DONE). Emits domain events.",
)
async def update_task_status(
    task_id: UUID,
    request: UpdateTaskStatusRequest,
    repo: PostgresTaskRepository = Depends(get_task_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaskResponse:
    use_case = UpdateTaskStatusUseCase(repository=repo)
    task = await use_case.execute(
        task_id=task_id, 
        new_status=request.status, 
        user_id=current_user.id
    )
    await session.commit()
    return TaskResponse.model_validate(task)


@router.delete(
    "/{task_id}",
    response_model=MessageResponse,
    summary="Delete task",
    description="Permanently deletes the given task.",
)
async def delete_task(
    task_id: UUID,
    repo: PostgresTaskRepository = Depends(get_task_repository),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> MessageResponse:
    use_case = DeleteTaskUseCase(repository=repo)
    await use_case.execute(task_id=task_id, user_id=current_user.id)
    await session.commit()
    return MessageResponse(message="Task deleted successfully")
