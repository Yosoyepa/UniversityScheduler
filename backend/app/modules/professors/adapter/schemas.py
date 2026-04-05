"""
Professors Module — Pydantic Schemas (API DTOs).

These are the request/response contracts for the adapter layer (FastAPI router).
No domain logic lives here — pure data serialization.
"""
from datetime import date, datetime, time
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# =============================================================================
# Office Hours
# =============================================================================

class OfficeHourRequest(BaseModel):
    day_of_week: int = Field(..., ge=1, le=7, description="ISO weekday: 1=Mon, 7=Sun")
    start_time: time
    end_time: time
    location_type: str = "OFFICE"
    location_details: Optional[str] = None


# Explicit name for clarity when used in standalone POST endpoint
AddOfficeHourRequest = OfficeHourRequest


class OfficeHourResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    professor_id: UUID
    day_of_week: int
    start_time: time
    end_time: time
    location_type: str
    location_details: Optional[str]


# =============================================================================
# Professor CRUD
# =============================================================================

class CreateProfessorRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    email: Optional[str] = None
    department: Optional[str] = None
    office_hours: List[OfficeHourRequest] = Field(default_factory=list)


class UpdateProfessorRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[str] = None
    department: Optional[str] = None


class ProfessorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    name: str
    email: Optional[str]
    department: Optional[str]
    office_hours: List[OfficeHourResponse]
    is_available_now: bool = False
    created_at: datetime
    updated_at: datetime


# =============================================================================
# Tutoring Sessions
# =============================================================================

class ScheduleTutoringRequest(BaseModel):
    professor_id: UUID
    date: date
    start_time: time
    end_time: time
    notes: Optional[str] = None
    meeting_link: Optional[str] = None


class UpdateTutoringSessionRequest(BaseModel):
    """Used only for status transitions."""
    status: str  # COMPLETED | CANCELLED


class TutoringSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    professor_id: UUID
    user_id: UUID
    date: date
    start_time: time
    end_time: time
    notes: Optional[str]
    meeting_link: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
