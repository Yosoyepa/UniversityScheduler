"""
Professors Module — Application Use Cases.

Orchestrate domain logic for:
  - CRUD of Professor entries (student's personal directory)
  - Managing OfficeHour blocks
  - Scheduling / cancelling / completing TutoringSession instances

Following backend-hexagonal-module skill:
  - Receive port interfaces via constructor
  - Single execute() method per use case
  - No direct infrastructure imports
"""
from dataclasses import dataclass, field
from datetime import date, time
from typing import List, Optional
from uuid import UUID, uuid4

from app.modules.professors.domain.entities import (
    OfficeHour,
    OfficeHourLocationType,
    Professor,
    TutoringSession,
    TutoringSessionStatus,
)
from app.modules.professors.port.repository import (
    IProfessorRepository,
    ITutoringSessionRepository,
)
from app.shared.domain.exceptions import (
    EntityNotFoundException,
    ValidationException,
)


# =============================================================================
# Professor Use Cases
# =============================================================================

@dataclass
class CreateProfessorUseCase:
    """
    Create a new professor in the user's private directory.

    Optionally seeds initial office-hour blocks.
    """
    repository: IProfessorRepository

    async def execute(
        self,
        user_id: UUID,
        name: str,
        email: Optional[str],
        department: Optional[str],
        office_hours_data: list,
    ) -> Professor:
        professor = Professor(
            id=uuid4(),
            user_id=user_id,
            name=name.strip(),
            email=email or None,
            department=department or None,
        )

        for oh_data in office_hours_data:
            oh = OfficeHour(
                id=uuid4(),
                professor_id=professor.id,
                day_of_week=oh_data["day_of_week"],
                start_time=oh_data["start_time"],
                end_time=oh_data["end_time"],
                location_type=OfficeHourLocationType(
                    oh_data.get("location_type", "OFFICE")
                ),
                location_details=oh_data.get("location_details"),
            )
            professor.add_office_hour(oh)

        return await self.repository.save(professor)


@dataclass
class GetProfessorsDirectoryUseCase:
    """Return all professors in the user's private directory."""
    repository: IProfessorRepository

    async def execute(self, user_id: UUID) -> List[Professor]:
        return await self.repository.find_by_user(user_id)


@dataclass
class GetProfessorByIdUseCase:
    """Return a single professor, verifying ownership."""
    repository: IProfessorRepository

    async def execute(self, professor_id: UUID, user_id: UUID) -> Professor:
        professor = await self.repository.find_by_id(professor_id)
        if not professor:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        if professor.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to view this professor.",
            )
        return professor


@dataclass
class UpdateProfessorUseCase:
    """Update contact info for a professor."""
    repository: IProfessorRepository

    async def execute(
        self,
        professor_id: UUID,
        user_id: UUID,
        name: Optional[str],
        email: Optional[str],
        department: Optional[str],
    ) -> Professor:
        professor = await self.repository.find_by_id(professor_id)
        if not professor:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        if professor.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to update this professor.",
            )
        professor.update_info(name=name, email=email, department=department)
        return await self.repository.save(professor)


@dataclass
class DeleteProfessorUseCase:
    """Hard-delete a professor from the directory."""
    repository: IProfessorRepository

    async def execute(self, professor_id: UUID, user_id: UUID) -> None:
        professor = await self.repository.find_by_id(professor_id)
        if not professor:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        if professor.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to delete this professor.",
            )
        await self.repository.delete(professor_id)


# =============================================================================
# Office Hours Use Cases
# =============================================================================

@dataclass
class AddOfficeHourUseCase:
    """Add a recurring office-hour block to a professor."""
    repository: IProfessorRepository

    async def execute(
        self,
        professor_id: UUID,
        user_id: UUID,
        day_of_week: int,
        start_time: time,
        end_time: time,
        location_type: str,
        location_details: Optional[str],
    ) -> OfficeHour:
        professor = await self.repository.find_by_id(professor_id)
        if not professor:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        if professor.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to modify this professor.",
            )
        oh = OfficeHour(
            id=uuid4(),
            professor_id=professor_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
            location_type=OfficeHourLocationType(location_type),
            location_details=location_details,
        )
        return await self.repository.save_office_hour(oh)


@dataclass
class RemoveOfficeHourUseCase:
    """Remove an office-hour block."""
    repository: IProfessorRepository

    async def execute(
        self, professor_id: UUID, office_hour_id: UUID, user_id: UUID
    ) -> None:
        professor = await self.repository.find_by_id(professor_id)
        if not professor:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        if professor.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to modify this professor.",
            )
        await self.repository.delete_office_hour(office_hour_id)


# =============================================================================
# Tutoring Session Use Cases
# =============================================================================

@dataclass
class ScheduleTutoringSessionUseCase:
    """
    Book a tutoring session with a professor.

    Sessions are automatically SCHEDULED (pre-confirmed by the student).
    """
    prof_repository: IProfessorRepository
    session_repository: ITutoringSessionRepository

    async def execute(
        self,
        user_id: UUID,
        professor_id: UUID,
        session_date: date,
        start_time: time,
        end_time: time,
        notes: Optional[str],
        meeting_link: Optional[str],
    ) -> TutoringSession:
        # Verify professor exists and belongs to user
        professor = await self.prof_repository.find_by_id(professor_id)
        if not professor:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        if professor.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You can only book sessions with professors in your directory.",
            )

        session = TutoringSession(
            id=uuid4(),
            professor_id=professor_id,
            user_id=user_id,
            date=session_date,
            start_time=start_time,
            end_time=end_time,
            notes=notes,
            meeting_link=meeting_link,
            status=TutoringSessionStatus.SCHEDULED,
        )
        return await self.session_repository.save(session)


@dataclass
class ListTutoringSessionsUseCase:
    """Return all tutoring sessions for the current user."""
    session_repository: ITutoringSessionRepository

    async def execute(self, user_id: UUID) -> List[TutoringSession]:
        return await self.session_repository.find_by_user(user_id)


@dataclass
class CancelTutoringSessionUseCase:
    """Cancel a scheduled tutoring session."""
    session_repository: ITutoringSessionRepository

    async def execute(self, session_id: UUID, user_id: UUID) -> TutoringSession:
        session = await self.session_repository.find_by_id(session_id)
        if not session:
            raise EntityNotFoundException(
                code="TUTORING_SESSION_NOT_FOUND",
                message=f"TutoringSession {session_id} not found.",
                entity_type="TutoringSession",
                entity_id=session_id,
            )
        if session.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to cancel this session.",
            )
        session.cancel()
        return await self.session_repository.save(session)


@dataclass
class CompleteTutoringSessionUseCase:
    """Mark a tutoring session as completed."""
    session_repository: ITutoringSessionRepository

    async def execute(self, session_id: UUID, user_id: UUID) -> TutoringSession:
        session = await self.session_repository.find_by_id(session_id)
        if not session:
            raise EntityNotFoundException(
                code="TUTORING_SESSION_NOT_FOUND",
                message=f"TutoringSession {session_id} not found.",
                entity_type="TutoringSession",
                entity_id=session_id,
            )
        if session.user_id != user_id:
            raise ValidationException(
                code="ACCESS_DENIED",
                message="You do not have permission to complete this session.",
            )
        session.complete()
        return await self.session_repository.save(session)
