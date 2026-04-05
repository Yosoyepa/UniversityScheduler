"""
Professors Module — PostgreSQL Repository Adapter.

Implements IProfessorRepository and ITutoringSessionRepository
using SQLAlchemy async session.

Maps between domain entities and ORM models (ProfessorModel, OfficeHourModel,
TutoringSessionModel).
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.professors.domain.entities import (
    OfficeHour,
    OfficeHourLocationType,
    Professor,
    TutoringSession,
    TutoringSessionStatus,
)
from app.modules.professors.infrastructure.models import (
    OfficeHourModel,
    OfficeHourLocationTypeOrm,
    ProfessorModel,
    TutoringSessionModel,
    TutoringSessionStatusOrm,
)
from app.modules.professors.port.repository import (
    IProfessorRepository,
    ITutoringSessionRepository,
)
from app.shared.domain.exceptions import EntityNotFoundException


class PostgresProfessorRepository(IProfessorRepository):
    """PostgreSQL implementation of IProfessorRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ------------------------------------------------------------------
    # Professor CRUD
    # ------------------------------------------------------------------

    async def save(self, professor: Professor) -> Professor:
        existing = await self._session.get(ProfessorModel, professor.id)

        if existing:
            existing.name = professor.name
            existing.email = professor.email
            existing.department = professor.department
            existing.updated_at = professor.updated_at
        else:
            model = ProfessorModel(
                id=professor.id,
                user_id=professor.user_id,
                name=professor.name,
                email=professor.email,
                department=professor.department,
                created_at=professor.created_at,
                updated_at=professor.updated_at,
            )
            self._session.add(model)

        await self._session.flush()

        # Persist any in-memory office hours that don't exist yet
        existing_oh_ids = set()
        if existing:
            result = await self._session.execute(
                select(OfficeHourModel).where(
                    OfficeHourModel.professor_id == professor.id
                )
            )
            existing_oh_ids = {r.id for r in result.scalars().all()}

        for oh in professor.office_hours:
            if oh.id not in existing_oh_ids:
                oh_model = OfficeHourModel(
                    id=oh.id,
                    professor_id=oh.professor_id,
                    day_of_week=oh.day_of_week,
                    start_time=oh.start_time,
                    end_time=oh.end_time,
                    location_type=OfficeHourLocationTypeOrm(oh.location_type.value),
                    location_details=oh.location_details,
                )
                self._session.add(oh_model)

        await self._session.flush()
        return professor

    async def find_by_id(self, professor_id: UUID) -> Optional[Professor]:
        if professor_id is None:
            return None
        result = await self._session.execute(
            select(ProfessorModel)
            .where(ProfessorModel.id == professor_id)
            .options(selectinload(ProfessorModel.office_hours))
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def find_by_user(self, user_id: UUID) -> List[Professor]:
        if user_id is None:
            return []
        result = await self._session.execute(
            select(ProfessorModel)
            .where(ProfessorModel.user_id == user_id)
            .options(selectinload(ProfessorModel.office_hours))
            .order_by(ProfessorModel.name)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def delete(self, professor_id: UUID) -> None:
        result = await self._session.execute(
            select(ProfessorModel).where(ProfessorModel.id == professor_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise EntityNotFoundException(
                code="PROFESSOR_NOT_FOUND",
                message=f"Professor {professor_id} not found.",
                entity_type="Professor",
                entity_id=professor_id,
            )
        await self._session.delete(model)
        await self._session.flush()

    # ------------------------------------------------------------------
    # Office Hours sub-operations
    # ------------------------------------------------------------------

    async def save_office_hour(self, office_hour: OfficeHour) -> OfficeHour:
        existing = await self._session.get(OfficeHourModel, office_hour.id)
        if existing:
            existing.day_of_week = office_hour.day_of_week
            existing.start_time = office_hour.start_time
            existing.end_time = office_hour.end_time
            existing.location_type = OfficeHourLocationTypeOrm(
                office_hour.location_type.value
            )
            existing.location_details = office_hour.location_details
        else:
            model = OfficeHourModel(
                id=office_hour.id,
                professor_id=office_hour.professor_id,
                day_of_week=office_hour.day_of_week,
                start_time=office_hour.start_time,
                end_time=office_hour.end_time,
                location_type=OfficeHourLocationTypeOrm(
                    office_hour.location_type.value
                ),
                location_details=office_hour.location_details,
            )
            self._session.add(model)
        await self._session.flush()
        return office_hour

    async def delete_office_hour(self, office_hour_id: UUID) -> None:
        result = await self._session.execute(
            select(OfficeHourModel).where(OfficeHourModel.id == office_hour_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise EntityNotFoundException(
                code="OFFICE_HOUR_NOT_FOUND",
                message=f"OfficeHour {office_hour_id} not found.",
                entity_type="OfficeHour",
                entity_id=office_hour_id,
            )
        await self._session.delete(model)
        await self._session.flush()

    # ------------------------------------------------------------------
    # ORM → Entity mapping
    # ------------------------------------------------------------------

    def _to_entity(self, model: ProfessorModel) -> Professor:
        professor = Professor(
            id=model.id,
            user_id=model.user_id,
            name=model.name,
            email=model.email,
            department=model.department,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
        if "office_hours" in model.__dict__ and model.office_hours:
            for oh_model in model.office_hours:
                oh = OfficeHour(
                    id=oh_model.id,
                    professor_id=oh_model.professor_id,
                    day_of_week=oh_model.day_of_week,
                    start_time=oh_model.start_time,
                    end_time=oh_model.end_time,
                    location_type=OfficeHourLocationType(oh_model.location_type.value),
                    location_details=oh_model.location_details,
                )
                professor._office_hours.append(oh)
        return professor


class PostgresTutoringSessionRepository(ITutoringSessionRepository):
    """PostgreSQL implementation of ITutoringSessionRepository."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def save(self, session: TutoringSession) -> TutoringSession:
        existing = await self._session.get(TutoringSessionModel, session.id)
        if existing:
            existing.date = session.date
            existing.start_time = session.start_time
            existing.end_time = session.end_time
            existing.notes = session.notes
            existing.meeting_link = session.meeting_link
            existing.status = TutoringSessionStatusOrm(session.status.value)
            existing.updated_at = session.updated_at
        else:
            model = TutoringSessionModel(
                id=session.id,
                professor_id=session.professor_id,
                user_id=session.user_id,
                date=session.date,
                start_time=session.start_time,
                end_time=session.end_time,
                notes=session.notes,
                meeting_link=session.meeting_link,
                status=TutoringSessionStatusOrm(session.status.value),
                created_at=session.created_at,
                updated_at=session.updated_at,
            )
            self._session.add(model)
        await self._session.flush()
        return session

    async def find_by_id(self, session_id: UUID) -> Optional[TutoringSession]:
        if session_id is None:
            return None
        result = await self._session.execute(
            select(TutoringSessionModel).where(TutoringSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def find_by_user(self, user_id: UUID) -> List[TutoringSession]:
        if user_id is None:
            return []
        result = await self._session.execute(
            select(TutoringSessionModel)
            .where(TutoringSessionModel.user_id == user_id)
            .order_by(TutoringSessionModel.date.desc(), TutoringSessionModel.start_time)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def find_by_professor(self, professor_id: UUID) -> List[TutoringSession]:
        if professor_id is None:
            return []
        result = await self._session.execute(
            select(TutoringSessionModel)
            .where(TutoringSessionModel.professor_id == professor_id)
            .order_by(TutoringSessionModel.date.desc())
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def delete(self, session_id: UUID) -> None:
        result = await self._session.execute(
            select(TutoringSessionModel).where(TutoringSessionModel.id == session_id)
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise EntityNotFoundException(
                code="TUTORING_SESSION_NOT_FOUND",
                message=f"TutoringSession {session_id} not found.",
                entity_type="TutoringSession",
                entity_id=session_id,
            )
        await self._session.delete(model)
        await self._session.flush()

    def _to_entity(self, model: TutoringSessionModel) -> TutoringSession:
        return TutoringSession(
            id=model.id,
            professor_id=model.professor_id,
            user_id=model.user_id,
            date=model.date,
            start_time=model.start_time,
            end_time=model.end_time,
            notes=model.notes,
            meeting_link=model.meeting_link,
            status=TutoringSessionStatus(model.status.value),
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
