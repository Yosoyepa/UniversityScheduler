"""
Task Repository Port Interface.

Following Hexagonal Architecture and backend-hexagonal-module skill:
- Defines the port for task persistence
- Implementation details (Postgres/Supabase) belong in the adapter layer
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.modules.tasks.domain.entities import Task, TaskStatus, TaskPriority, TaskCategory


class ITaskRepository(ABC):
    """
    Port (Interface) for Task persistence operations.
    
    All methods should be asynchronous.
    """
    
    @abstractmethod
    async def create(self, task: Task) -> Task:
        """Create a new task."""
        pass
        
    @abstractmethod
    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        """Get a task by its ID."""
        pass
        
    @abstractmethod
    async def get_by_user(
        self, 
        user_id: UUID,
        status: Optional[TaskStatus] = None,
        subject_id: Optional[UUID] = None,
        category: Optional[TaskCategory] = None
    ) -> List[Task]:
        """Get all tasks for a user, with optional filters."""
        pass
        
    @abstractmethod
    async def get_overdue_tasks(self, user_id: UUID) -> List[Task]:
        """Get tasks that have passed their due date and are not done/archived."""
        pass
        
    @abstractmethod
    async def update(self, task: Task) -> Task:
        """Update an existing task."""
        pass
        
    @abstractmethod
    async def delete(self, task_id: UUID) -> bool:
        """Delete a task. Returns True if successful."""
        pass
