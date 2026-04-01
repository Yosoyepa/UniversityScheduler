"""
PostgreSQL SQLAlchemy implementation for TaskRepository.

Following Hexagonal Architecture - backend-hexagonal-module skill:
- Adapter layer: implements port, depends on infrastructure models
- Translates ORM models <-> domain entities (pure dataclasses)
- Translates SQLAlchemy exceptions to domain exceptions with correct signatures
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, exc
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.tasks.domain.entities import Task, TaskStatus, TaskCategory
from app.modules.tasks.infrastructure.models import TaskModel
from app.modules.tasks.port.repository import ITaskRepository
from app.shared.domain.exceptions import InfrastructureException, EntityNotFoundException


class PostgresTaskRepository(ITaskRepository):
    """SQLAlchemy Async implementation of ITaskRepository."""

    def __init__(self, session: AsyncSession):
        self._session = session

    def _to_domain(self, model: TaskModel) -> Task:
        """Convert ORM model to domain dataclass entity."""
        return Task(
            id=model.id,
            user_id=model.user_id,
            subject_id=model.subject_id,
            title=model.title,
            description=model.description,
            due_date=model.due_date,
            status=model.status,
            priority=model.priority,
            category=model.category,
            is_synced_gcal=model.is_synced_gcal,
            gcal_event_id=model.gcal_event_id,
            completed_at=model.completed_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _apply_to_model(self, entity: Task, model: TaskModel) -> None:
        """Sync domain entity fields onto ORM model (in-place update)."""
        model.user_id = entity.user_id
        model.subject_id = entity.subject_id
        model.title = entity.title
        model.description = entity.description
        model.due_date = entity.due_date
        model.status = entity.status
        model.priority = entity.priority
        model.category = entity.category
        model.is_synced_gcal = entity.is_synced_gcal
        model.gcal_event_id = entity.gcal_event_id
        model.completed_at = entity.completed_at
        model.updated_at = entity.updated_at

    async def create(self, task: Task) -> Task:
        try:
            model = TaskModel(
                id=task.id,
                user_id=task.user_id,
                subject_id=task.subject_id,
                title=task.title,
                description=task.description,
                due_date=task.due_date,
                status=task.status,
                priority=task.priority,
                category=task.category,
                is_synced_gcal=task.is_synced_gcal,
                gcal_event_id=task.gcal_event_id,
                completed_at=task.completed_at,
                created_at=task.created_at,
                updated_at=task.updated_at,
            )
            self._session.add(model)
            await self._session.flush()
            return self._to_domain(model)
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error creating task: {str(e)}",
                service_name="postgres",
            )

    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        try:
            stmt = select(TaskModel).where(TaskModel.id == task_id)
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()
            return self._to_domain(model) if model else None
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching task {task_id}: {str(e)}",
                service_name="postgres",
            )

    async def get_by_user(
        self,
        user_id: UUID,
        status: Optional[TaskStatus] = None,
        subject_id: Optional[UUID] = None,
        category: Optional[TaskCategory] = None,
    ) -> List[Task]:
        try:
            stmt = select(TaskModel).where(TaskModel.user_id == user_id)
            if status:
                stmt = stmt.where(TaskModel.status == status)
            if subject_id:
                stmt = stmt.where(TaskModel.subject_id == subject_id)
            if category:
                stmt = stmt.where(TaskModel.category == category)
            stmt = stmt.order_by(
                TaskModel.priority.desc(),
                TaskModel.due_date.nullslast(),
            )
            result = await self._session.execute(stmt)
            return [self._to_domain(m) for m in result.scalars().all()]
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching tasks for user {user_id}: {str(e)}",
                service_name="postgres",
            )

    async def get_overdue_tasks(self, user_id: UUID) -> List[Task]:
        try:
            from app.shared.domain.entities import utc_now
            now = utc_now()
            stmt = select(TaskModel).where(
                TaskModel.user_id == user_id,
                TaskModel.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS]),
                TaskModel.due_date < now,
            )
            result = await self._session.execute(stmt)
            return [self._to_domain(m) for m in result.scalars().all()]
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error fetching overdue tasks: {str(e)}",
                service_name="postgres",
            )

    async def update(self, task: Task) -> Task:
        try:
            stmt = select(TaskModel).where(TaskModel.id == task.id)
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()

            if not model:
                raise EntityNotFoundException(
                    code="TASK_NOT_FOUND",
                    message=f"Task with id {task.id} not found",
                    entity_type="Task",
                )

            self._apply_to_model(task, model)
            await self._session.flush()
            return self._to_domain(model)
        except EntityNotFoundException:
            raise
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error updating task {task.id}: {str(e)}",
                service_name="postgres",
            )

    async def delete(self, task_id: UUID) -> bool:
        try:
            stmt = select(TaskModel).where(TaskModel.id == task_id)
            result = await self._session.execute(stmt)
            model = result.scalar_one_or_none()

            if not model:
                raise EntityNotFoundException(
                    code="TASK_NOT_FOUND",
                    message=f"Task with id {task_id} not found",
                    entity_type="Task",
                )

            await self._session.delete(model)
            await self._session.flush()
            return True
        except EntityNotFoundException:
            raise
        except exc.SQLAlchemyError as e:
            raise InfrastructureException(
                code="DATABASE_ERROR",
                message=f"Error deleting task {task_id}: {str(e)}",
                service_name="postgres",
            )
