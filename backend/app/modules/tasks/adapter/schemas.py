"""
Pydantic schemas for Task API requests and responses.

Following Hexagonal Architecture and backend-hexagonal-module skill:
- These are specific to the web adapter (FastAPI) layer
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, ConfigDict

from app.modules.tasks.domain.entities import TaskStatus, TaskPriority, TaskCategory

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


# =============================================================================
# Requests
# =============================================================================


class CreateTaskRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    subject_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: TaskCategory = TaskCategory.TASK


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    subject_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    category: Optional[TaskCategory] = None


class UpdateTaskStatusRequest(BaseModel):
    status: TaskStatus


# =============================================================================
# Responses
# =============================================================================


class TaskResponse(BaseModel):
    """Response model for a Task."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    subject_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: TaskStatus
    priority: TaskPriority
    category: TaskCategory
    is_synced_gcal: bool
    gcal_event_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
