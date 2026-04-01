"""
Application Use Cases for Task Management.

Following Hexagonal Architecture:
- Use cases orchestrate domain logic and emit domain events
- They depend on ports (ITaskRepository, IEventBus), not adapters
- Input DTOs define the required data for each operation
"""
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from app.modules.tasks.domain.entities import Task, TaskStatus, TaskPriority, TaskCategory
from app.modules.tasks.port.repository import ITaskRepository
from app.shared.domain.events import TaskCompletedEvent, get_event_bus, IEventBus
from app.shared.domain.exceptions import EntityNotFoundException, ValidationException

logger = logging.getLogger(__name__)


# =============================================================================
# DTOs
# =============================================================================

@dataclass
class CreateTaskDTO:
    title: str
    description: Optional[str] = None
    subject_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: TaskCategory = TaskCategory.TASK


@dataclass
class UpdateTaskDTO:
    title: Optional[str] = None
    description: Optional[str] = None
    subject_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    category: Optional[TaskCategory] = None


# =============================================================================
# Use Cases
# =============================================================================

class CreateTaskUseCase:
    """Create a new task."""
    
    def __init__(self, repository: ITaskRepository):
        self._repository = repository
        
    async def execute(self, dto: CreateTaskDTO, user_id: UUID) -> Task:
        """Execute the use case."""
        # Validate minimum text lengths manually or rely on Pydantic during entity creation
        if not dto.title or len(dto.title.strip()) < 3:
            raise ValidationException(
                code="VALIDATION_ERROR",
                message="Task title must be at least 3 characters long.",
            )

        task = Task(
            user_id=user_id,
            subject_id=dto.subject_id,
            title=dto.title.strip(),
            description=dto.description.strip() if dto.description else None,
            due_date=dto.due_date,
            priority=dto.priority,
            category=dto.category,
        )
        
        # Persist task
        created_task = await self._repository.create(task)
        logger.info(f"Created task {created_task.id} for user {user_id}")
        return created_task


class ListTasksUseCase:
    """List tasks for a user with optional filters."""
    
    def __init__(self, repository: ITaskRepository):
        self._repository = repository
        
    async def execute(
        self, 
        user_id: UUID,
        status: Optional[TaskStatus] = None,
        subject_id: Optional[UUID] = None,
        category: Optional[TaskCategory] = None
    ) -> List[Task]:
        """Execute the use case."""
        return await self._repository.get_by_user(
            user_id=user_id,
            status=status,
            subject_id=subject_id,
            category=category
        )


class UpdateTaskStatusUseCase:
    """Update task status and emit domain events for completion."""
    
    def __init__(self, repository: ITaskRepository, event_bus: Optional[IEventBus] = None):
        self._repository = repository
        self._event_bus = event_bus or get_event_bus()
        
    async def execute(self, task_id: UUID, new_status: TaskStatus, user_id: UUID) -> Task:
        """Execute the use case."""
        # 1. Fetch task
        task = await self._repository.get_by_id(task_id)
        if not task:
            raise EntityNotFoundException(
                code="TASK_NOT_FOUND",
                message=f"Task with id {task_id} not found",
                entity_type="Task",
            )

        # Verify ownership
        if task.user_id != user_id:
            raise ValidationException(
                code="PERMISSION_DENIED",
                message="Permission denied to modify this task",
            )
            
        old_status = task.status
        if old_status == new_status:
            return task  # No-op
            
        # 2. Apply state machine transition logic via domain entity
        if new_status == TaskStatus.IN_PROGRESS:
            task.start()
        elif new_status == TaskStatus.DONE:
            task.complete()
        elif new_status == TaskStatus.TODO:
            task.reopen()
        elif new_status == TaskStatus.ARCHIVED:
            task.archive()
            
        # 3. Persist
        updated_task = await self._repository.update(task)
        
        # 4. Emit domain events if transition triggers one
        if new_status == TaskStatus.DONE and old_status != TaskStatus.DONE:
            event = TaskCompletedEvent(
                task_id=task.id,
                user_id=task.user_id,
                subject_id=task.subject_id,
                task_title=task.title
            )
            self._event_bus.publish(event)
            logger.info(f"Published TaskCompletedEvent for task {task.id}")
            
        return updated_task


class UpdateTaskUseCase:
    """Update basic properties of a task."""
    
    def __init__(self, repository: ITaskRepository):
        self._repository = repository
        
    async def execute(self, task_id: UUID, dto: UpdateTaskDTO, user_id: UUID) -> Task:
        """Execute the use case."""
        task = await self._repository.get_by_id(task_id)
        if not task:
            raise EntityNotFoundException(
                code="TASK_NOT_FOUND",
                message=f"Task with id {task_id} not found",
                entity_type="Task",
            )

        if task.user_id != user_id:
            raise ValidationException(
                code="PERMISSION_DENIED",
                message="Permission denied to modify this task",
            )
            
        # Update properties
        if dto.title is not None:
            if len(dto.title.strip()) < 3:
                raise ValidationException(
                    code="VALIDATION_ERROR",
                    message="Task title must be at least 3 characters long.",
                )
            task.title = dto.title.strip()
            
        if dto.description is not None:
            task.description = dto.description.strip() if dto.description else None
            
        if dto.subject_id is not None:
            task.subject_id = dto.subject_id
            
        if dto.due_date is not None:
            task.due_date = dto.due_date
            
        if dto.priority is not None:
            task.priority = dto.priority
            
        if dto.category is not None:
            task.category = dto.category
            
        # We don't update status here, we use UpdateTaskStatusUseCase for state machine logic
        
        return await self._repository.update(task)


class DeleteTaskUseCase:
    """Delete a task."""
    
    def __init__(self, repository: ITaskRepository):
        self._repository = repository
        
    async def execute(self, task_id: UUID, user_id: UUID) -> bool:
        """Execute the use case."""
        task = await self._repository.get_by_id(task_id)
        if not task:
            raise EntityNotFoundException(
                code="TASK_NOT_FOUND",
                message=f"Task with id {task_id} not found",
                entity_type="Task",
            )

        if task.user_id != user_id:
            raise ValidationException(
                code="PERMISSION_DENIED",
                message="Permission denied to delete this task",
            )
            
        return await self._repository.delete(task_id)
