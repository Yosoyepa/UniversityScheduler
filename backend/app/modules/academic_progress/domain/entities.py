"""
Domain Entities for the Academic Progress module.

Following Hexagonal Architecture — backend-hexagonal-module skill:
- Entities inherit from app.shared.domain.entities.Entity
- Use @dataclass with __post_init__ for invariant validation
- Domain methods use self.touch() to update timestamps
- Zero external dependencies (no FastAPI, no SQLAlchemy, no Pydantic)
- Raise exceptions from app.shared.domain.exceptions only

INVARIANTS:
  EvaluationCriteria:
    - weight must be > 0 and <= 100
    - name must be non-empty

  Grade:
    - score must be >= 0 and <= max_score
    - max_score must be > 0
    - user_id and subject_id are required
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from app.shared.domain.entities import Entity
from app.shared.domain.exceptions import InvalidEntityStateException


# ---------------------------------------------------------------------------
# Shared Enum (mirrors task_category for optional rubric → task link)
# ---------------------------------------------------------------------------

class GradeCategory(str, Enum):
    """Mirrors task_category for linking evaluation criteria to a task category."""
    TASK = "TASK"
    EXAM = "EXAM"
    PROJECT = "PROJECT"
    READING = "READING"


# ---------------------------------------------------------------------------
# EvaluationCriteria — defines the grading rubric item for a subject
# ---------------------------------------------------------------------------

@dataclass
class EvaluationCriteria(Entity):
    """
    Aggregate value representing one row of a subject's grading rubric.

    INVARIANTS:
    - weight > 0 and <= 100
    - name must not be empty

    Example:
      EvaluationCriteria(subject_id=..., name="Parcial 1", weight=30.0)
      EvaluationCriteria(subject_id=..., name="Proyecto Final", weight=40.0)
    """
    subject_id: UUID = field(default=None)
    name: str = field(default="")
    weight: float = field(default=0.0)
    category: Optional[GradeCategory] = field(default=None)

    def __post_init__(self) -> None:
        """Validate invariants on creation."""
        if not self.subject_id:
            raise ValueError("EvaluationCriteria must be associated with a subject")
        if not self.name or not self.name.strip():
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message="EvaluationCriteria name must not be empty",
            )
        self.name = self.name.strip()
        if not (0 < self.weight <= 100):
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=(
                    f"EvaluationCriteria weight must be > 0 and <= 100, got {self.weight}"
                ),
            )

    def update(self, name: Optional[str] = None, weight: Optional[float] = None) -> None:
        """Update mutable fields and bump updated_at."""
        if name is not None:
            if not name.strip():
                raise InvalidEntityStateException(
                    code="INVALID_ENTITY_STATE",
                    message="EvaluationCriteria name must not be empty",
                )
            self.name = name.strip()

        if weight is not None:
            if not (0 < weight <= 100):
                raise InvalidEntityStateException(
                    code="INVALID_ENTITY_STATE",
                    message=(
                        f"EvaluationCriteria weight must be > 0 and <= 100, got {weight}"
                    ),
                )
            self.weight = weight

        self.touch()


# ---------------------------------------------------------------------------
# Grade — individual score recorded for a student evaluation
# ---------------------------------------------------------------------------

@dataclass
class Grade(Entity):
    """
    Records the score a student obtained for one evaluation criteria item.

    INVARIANTS:
    - user_id and subject_id are required
    - score >= 0 and score <= max_score
    - max_score > 0

    Domain Methods:
    - normalized_score() -> float : score expressed as percentage (0-100)
    - update_score(score) : validates and updates the score
    """
    user_id: UUID = field(default=None)
    subject_id: UUID = field(default=None)
    criteria_id: Optional[UUID] = field(default=None)
    task_id: Optional[UUID] = field(default=None)
    score: float = field(default=0.0)
    max_score: float = field(default=5.0)
    graded_at: Optional[datetime] = field(default=None)
    notes: Optional[str] = field(default=None)

    def __post_init__(self) -> None:
        """Validate invariants on creation."""
        if not self.user_id:
            raise ValueError("Grade must be associated with a user")
        if not self.subject_id:
            raise ValueError("Grade must be associated with a subject")
        if self.max_score <= 0:
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=f"Grade max_score must be > 0, got {self.max_score}",
            )
        if not (0 <= self.score <= self.max_score):
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=(
                    f"Grade score must be >= 0 and <= max_score ({self.max_score}), "
                    f"got {self.score}"
                ),
            )

    # -----------------------------------------------------------------------
    # Domain Methods
    # -----------------------------------------------------------------------

    def normalized_score(self) -> float:
        """
        Returns the score as a percentage of max_score (0.0 to 100.0).

        Pure function — no side effects, no external dependencies.
        Used by CalculateSubjectAverageUseCase for weighted average computation.

        Example:
          Grade(score=4.5, max_score=5.0).normalized_score() == 90.0
        """
        if self.max_score == 0:
            return 0.0
        return (self.score / self.max_score) * 100.0

    def update_score(self, score: float, notes: Optional[str] = None) -> None:
        """
        Update the score (domain-validated) and optionally the notes.
        Bumps updated_at via self.touch().
        """
        if not (0 <= score <= self.max_score):
            raise InvalidEntityStateException(
                code="INVALID_ENTITY_STATE",
                message=(
                    f"New score must be >= 0 and <= max_score ({self.max_score}), "
                    f"got {score}"
                ),
            )
        self.score = score
        if notes is not None:
            self.notes = notes
        self.touch()
