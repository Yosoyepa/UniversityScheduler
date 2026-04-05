"""
Academic Planning Pydantic Schemas (DTOs).

Data Transfer Objects for API request/response validation.
These are the "contract" between the API and the outside world.

Following defensive_programming skill:
    - Validate input immediately (Pydantic does this)
    - Fail-fast with clear error messages
"""
from datetime import date, time, datetime
from typing import List, Optional, Annotated
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, BeforeValidator

from app.modules.academic_planning.domain.entities import (
    DifficultyLevel,
    SubjectType,
)
from app.shared.domain.value_objects import DayOfWeek


# =============================================================================
# Base Schemas (Shared fields)
# =============================================================================

def parse_color(v: any) -> str:
    """Extract string value from HexColor object if necessary."""
    if hasattr(v, 'value'):
        return str(v.value)
    return str(v)

HexColorStr = Annotated[str, BeforeValidator(parse_color)]

class SemesterBase(BaseModel):
    """Base schema with shared semester fields."""
    name: str = Field(..., min_length=1, max_length=100)
    start_date: date
    end_date: date


class SubjectBase(BaseModel):
    """Base schema with shared subject fields."""
    name: str = Field(..., min_length=1, max_length=255)
    credits: int = Field(default=3, ge=1, le=20)
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    subject_type: SubjectType = SubjectType.DISCIPLINAR_OBLIGATORIA
    color: HexColorStr = Field(default="#3B82F6", pattern=r"^#[0-9A-Fa-f]{6}$")
    professor_id: Optional[UUID] = None


class ClassSessionBase(BaseModel):
    """Base schema with shared class session fields."""
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    classroom: Optional[str] = Field(None, max_length=100)


# =============================================================================
# Request Schemas (Input)
# =============================================================================

class CreateSemesterRequest(SemesterBase):
    """Request body for creating a semester."""
    
    @field_validator('end_date')
    @classmethod
    def end_date_after_start(cls, v: date, info) -> date:
        """Validate that end_date is after start_date."""
        values = info.data
        if 'start_date' in values and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class UpdateSemesterRequest(BaseModel):
    """Request body for updating a semester."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    
    @field_validator('end_date')
    @classmethod
    def end_date_after_start(cls, v: Optional[date], info) -> Optional[date]:
        """Validate that end_date is after start_date if both provided."""
        if v is None:
            return v
        values = info.data
        if 'start_date' in values and values['start_date'] is not None and v <= values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v


class CreateClassSessionRequest(ClassSessionBase):
    """Request body for creating a class session."""
    
    @field_validator('end_time')
    @classmethod
    def end_time_after_start(cls, v: time, info) -> time:
        """Validate that end_time is after start_time."""
        values = info.data
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class CreateSubjectRequest(SubjectBase):
    """Request body for creating a subject."""
    semester_id: UUID
    class_sessions: List[CreateClassSessionRequest] = Field(default_factory=list)


class UpdateSubjectRequest(BaseModel):
    """Request body for updating a subject."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    credits: Optional[int] = Field(None, ge=1, le=20)
    difficulty: Optional[DifficultyLevel] = None
    subject_type: Optional[SubjectType] = None
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    professor_id: Optional[UUID] = None


class UpdateClassSessionRequest(BaseModel):
    """Request body for updating a class session."""
    day_of_week: Optional[DayOfWeek] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    classroom: Optional[str] = Field(None, max_length=100)
    
    @field_validator('end_time')
    @classmethod
    def end_time_after_start(cls, v: Optional[time], info) -> Optional[time]:
        """Validate that end_time is after start_time if both provided."""
        if v is None:
            return v
        values = info.data
        if 'start_time' in values and values['start_time'] is not None and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


# =============================================================================
# Response Schemas (Output)
# =============================================================================

class ClassSessionResponse(ClassSessionBase):
    """Class session data returned in API responses."""
    id: UUID
    subject_id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class SubjectResponse(SubjectBase):
    """Subject data returned in API responses."""
    id: UUID
    semester_id: UUID
    user_id: UUID
    class_sessions: List[ClassSessionResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class SemesterResponse(SemesterBase):
    """Semester data returned in API responses."""
    id: UUID
    user_id: UUID
    is_active: bool
    subjects: List[SubjectResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    model_config = {"from_attributes": True}


class ScheduleItemResponse(BaseModel):
    """Individual schedule item for the weekly view."""
    session_id: UUID
    subject_id: UUID
    subject_name: str
    subject_color: str
    day_of_week: DayOfWeek
    start_time: time
    end_time: time
    classroom: Optional[str] = None
    professor_id: Optional[UUID] = None


class ScheduleResponse(BaseModel):
    """Aggregated weekly schedule view."""
    user_id: UUID
    items: List[ScheduleItemResponse]
    total_weekly_hours: float


# =============================================================================
# Conflict Response Schema
# =============================================================================

class ConflictDetail(BaseModel):
    """Detail of a single conflict."""
    new_session_id: str
    new_session_time: str
    existing_subject_id: str
    existing_subject_name: str
    existing_session_id: str
    existing_session_time: str


class ConflictResponse(BaseModel):
    """Response schema for schedule conflict errors (HTTP 409)."""
    error: str = "SCHEDULE_CONFLICT"
    message: str
    conflicts: List[dict]
    resolution_options: List[str] = [
        "Modify the start/end times of the new subject",
        "Modify the start/end times of the conflicting subject",
        "Cancel this operation"
    ]


# =============================================================================
# Message Response
# =============================================================================

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True


# =============================================================================
# Query Parameter Schemas
# =============================================================================

class SubjectFilterParams(BaseModel):
    """Query parameters for filtering subjects."""
    semester_id: Optional[UUID] = None
