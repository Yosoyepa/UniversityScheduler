"""
Professors Module — Port Interfaces (Repository Contracts).

Following backend-hexagonal-module skill:
  - Pure ABC with @abstractmethod
  - All methods async
  - Only domain types imported — no SQLAlchemy, no Pydantic
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.modules.professors.domain.entities import (
    OfficeHour,
    Professor,
    TutoringSession,
)


class IProfessorRepository(ABC):
    """Contract for persistence of Professor aggregates."""

    @abstractmethod
    async def save(self, professor: Professor) -> Professor:
        """Persist (insert or update) a Professor including its office hours."""
        ...

    @abstractmethod
    async def find_by_id(self, professor_id: UUID) -> Optional[Professor]:
        """Return a Professor with its office hours, or None."""
        ...

    @abstractmethod
    async def find_by_user(self, user_id: UUID) -> List[Professor]:
        """Return all professors in the user's private directory."""
        ...

    @abstractmethod
    async def delete(self, professor_id: UUID) -> None:
        """Hard-delete a professor (cascades to office_hours and tutoring_sessions)."""
        ...

    # ------------------------------------------------------------------
    # Office Hours sub-operations
    # ------------------------------------------------------------------

    @abstractmethod
    async def save_office_hour(self, office_hour: OfficeHour) -> OfficeHour:
        """Persist (insert or update) a single OfficeHour block."""
        ...

    @abstractmethod
    async def delete_office_hour(self, office_hour_id: UUID) -> None:
        """Delete a single OfficeHour block."""
        ...


class ITutoringSessionRepository(ABC):
    """Contract for persistence of TutoringSession entities."""

    @abstractmethod
    async def save(self, session: TutoringSession) -> TutoringSession:
        """Persist (insert or update) a TutoringSession."""
        ...

    @abstractmethod
    async def find_by_id(self, session_id: UUID) -> Optional[TutoringSession]:
        """Return a TutoringSession or None."""
        ...

    @abstractmethod
    async def find_by_user(self, user_id: UUID) -> List[TutoringSession]:
        """Return all tutoring sessions for the logged-in user."""
        ...

    @abstractmethod
    async def find_by_professor(self, professor_id: UUID) -> List[TutoringSession]:
        """Return all sessions for a specific professor."""
        ...

    @abstractmethod
    async def delete(self, session_id: UUID) -> None:
        """Hard-delete a TutoringSession."""
        ...
