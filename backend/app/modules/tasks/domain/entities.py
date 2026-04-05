"""
Domain entities for the Task Management module.

Following Hexagonal Architecture - backend-hexagonal-module skill:
- Entities inherit from app.shared.domain.entities.Entity
- Use @dataclass with __post_init__ for validation
- Domain methods use self.touch() to update timestamps
- Zero external dependencies (no FastAPI, no SQLAlchemy, no Pydantic)
- Raise exceptions from app.shared.domain.exceptions only
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from app.shared.domain.entities import Entity
from app.shared.domain.exceptions import InvalidEntityStateException


class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    ARCHIVED = "ARCHIVED"


class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class TaskCategory(str, Enum):
    TASK = "TASK"
    EXAM = "EXAM"
    PROJECT = "PROJECT"
    READING = "READING"


@dataclass
class Task(Entity):
    """
    Task domain entity representing an academic task or assignment.

    State machine (from task_lifecycle_state.puml):
        [*] --> TODO
        TODO --> IN_PROGRESS, ARCHIVED
        IN_PROGRESS --> DONE, TODO
        DONE --> ARCHIVED, IN_PROGRESS (reopen)
        ARCHIVED --> [*]
    """
    user_id: UUID = field(default=None)
    subject_id: Optional[UUID] = field(default=None)
    title: str = field(default="")
    description: Optional[str] = field(default=None)
    due_date: Optional[datetime] = field(default=None)
    status: TaskStatus = field(default=TaskStatus.TODO)
    priority: TaskPriority = field(default=TaskPriority.MEDIUM)
    category: TaskCategory = field(default=TaskCategory.TASK)
    is_synced_gcal: bool = field(default=False)
    gcal_event_id: Optional[str] = field(default=None)
    completed_at: Optional[datetime] = field(default=None)

    def __post_init__(self):
        """Validate invariants on creation."""
        if not self.user_id:
            raise ValueError("Task must be associated with a user")
        if not self.title or len(self.title.strip()) < 3:
            raise ValueError("Task title must be at least 3 characters long")

    def start(self) -> None:
        """Transition: TODO | DONE | ARCHIVED → IN_PROGRESS."""
        valid_from = [TaskStatus.TODO, TaskStatus.DONE, TaskStatus.ARCHIVED]
        if self.status not in valid_from:
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=(
                    f"Cannot start task from status '{self.status.value}'. "
                    f"Valid states: {', '.join(s.value for s in valid_from)}"
                ),
                current_state=self.status.value,
                expected_states=[s.value for s in valid_from],
            )
        self.status = TaskStatus.IN_PROGRESS
        self.completed_at = None
        self.touch()

    def complete(self) -> None:
        """Transition: IN_PROGRESS | TODO | ARCHIVED → DONE."""
        valid_from = [TaskStatus.IN_PROGRESS, TaskStatus.TODO, TaskStatus.ARCHIVED]
        if self.status not in valid_from:
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=f"Cannot complete task from status '{self.status.value}'.",
                current_state=self.status.value,
                expected_states=[s.value for s in valid_from],
            )
        from app.shared.domain.entities import utc_now
        self.status = TaskStatus.DONE
        self.completed_at = utc_now()
        self.touch()

    def reopen(self) -> None:
        """Transition: IN_PROGRESS | DONE | ARCHIVED → TODO."""
        valid_from = [TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.ARCHIVED]
        if self.status not in valid_from:
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=f"Cannot reopen task from status '{self.status.value}'.",
                current_state=self.status.value,
                expected_states=[s.value for s in valid_from],
            )
        self.status = TaskStatus.TODO
        self.completed_at = None
        self.touch()

    def archive(self) -> None:
        """Transition: any non-ARCHIVED → ARCHIVED."""
        if self.status == TaskStatus.ARCHIVED:
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message="Task is already archived.",
                current_state=self.status.value,
                expected_states=[
                    s.value for s in TaskStatus if s != TaskStatus.ARCHIVED
                ],
            )
        self.status = TaskStatus.ARCHIVED
        self.touch()

    def is_overdue(self, current_time: Optional[datetime] = None) -> bool:
        """Check if the task is past its due_date and not yet done/archived."""
        if not self.due_date:
            return False
        if self.status in [TaskStatus.DONE, TaskStatus.ARCHIVED]:
            return False
        from app.shared.domain.entities import utc_now
        now = current_time or utc_now()
        return self.due_date < now
