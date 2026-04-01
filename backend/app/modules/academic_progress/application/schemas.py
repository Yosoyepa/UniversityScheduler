"""
Pydantic Schemas (DTOs) for Academic Progress module.

Following Hexagonal Architecture — backend-hexagonal-module skill:
- Request schemas validate incoming API data
- Response schemas serialize domain entities to API responses
- All schemas use Pydantic BaseModel
- from_entity() class methods bridge domain → DTO
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.academic_progress.domain.entities import GradeCategory


# =============================================================================
# EvaluationCriteria Schemas
# =============================================================================

class CreateEvaluationCriteriaRequest(BaseModel):
    """Request body for POST /evaluation-criteria."""
    subject_id: UUID
    name: str = Field(..., min_length=1, max_length=200)
    weight: float = Field(..., gt=0, le=100, description="Weight percentage (0-100)")
    category: Optional[GradeCategory] = None


class UpdateEvaluationCriteriaRequest(BaseModel):
    """Request body for PATCH /evaluation-criteria/{id}."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    weight: Optional[float] = Field(None, gt=0, le=100)


class EvaluationCriteriaResponse(BaseModel):
    """Response schema for EvaluationCriteria entities."""
    id: UUID
    subject_id: UUID
    name: str
    weight: float
    category: Optional[GradeCategory]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_entity(cls, entity) -> "EvaluationCriteriaResponse":
        return cls(
            id=entity.id,
            subject_id=entity.subject_id,
            name=entity.name,
            weight=entity.weight,
            category=entity.category,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


# =============================================================================
# Grade Schemas
# =============================================================================

class CreateGradeRequest(BaseModel):
    """Request body for POST /grades."""
    subject_id: UUID
    criteria_id: Optional[UUID] = None
    task_id: Optional[UUID] = None
    score: float = Field(..., ge=0, description="Score achieved")
    max_score: float = Field(default=5.0, gt=0, description="Maximum possible score")
    graded_at: Optional[datetime] = None
    notes: Optional[str] = None


class UpdateGradeRequest(BaseModel):
    """Request body for PATCH /grades/{id}."""
    score: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class GradeResponse(BaseModel):
    """Response schema for Grade entities."""
    id: UUID
    user_id: UUID
    subject_id: UUID
    criteria_id: Optional[UUID]
    task_id: Optional[UUID]
    score: float
    max_score: float
    normalized_score: float
    graded_at: Optional[datetime]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_entity(cls, entity) -> "GradeResponse":
        return cls(
            id=entity.id,
            user_id=entity.user_id,
            subject_id=entity.subject_id,
            criteria_id=entity.criteria_id,
            task_id=entity.task_id,
            score=entity.score,
            max_score=entity.max_score,
            normalized_score=entity.normalized_score(),
            graded_at=entity.graded_at,
            notes=entity.notes,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )


# =============================================================================
# Average Schemas
# =============================================================================

class SubjectAverageResponse(BaseModel):
    """Response schema for the weighted average calculation."""
    subject_id: UUID
    average: float = Field(description="Weighted average (0-100 scale)")
    grades_count: int
    criteria_count: int
    is_complete: bool = Field(
        description="True if all criteria have at least one grade"
    )

class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True
