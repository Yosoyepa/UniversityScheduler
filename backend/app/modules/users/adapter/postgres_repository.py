"""
PostgreSQL User Repository Adapter.

Implements IUserRepository, ISettingsRepository, and INotificationRepository
using SQLAlchemy async session.
Maps between domain entities and ORM models.

Following architecture-patterns skill:
    - Adapter implements the Port interface
    - Repository handles persistence, not business logic
    - Domain entities are returned, not ORM models
"""
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.domain.entities import User, Settings, Notification
from app.modules.users.port.repository import (
    IUserRepository,
    ISettingsRepository,
    INotificationRepository,
)
from app.modules.users.infrastructure.models import UserModel, SettingsModel, NotificationModel
from app.shared.domain.value_objects import Email


class PostgresUserRepository(IUserRepository):
    """
    PostgreSQL implementation of the user repository.

    Uses SQLAlchemy async session for database operations.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find a user by their unique ID."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def find_by_email(self, email: str) -> Optional[User]:
        """Find a user by their email address."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def save(self, user: User) -> User:
        """Persist a user entity."""
        existing = await self.session.get(UserModel, user.id)

        if existing:
            existing.email = str(user.email)
            existing.full_name = user.full_name
            existing.hashed_password = user.hashed_password
            existing.is_active = user.is_active
            existing.updated_at = user.updated_at
        else:
            model = UserModel(
                id=user.id,
                email=str(user.email),
                full_name=user.full_name,
                hashed_password=user.hashed_password,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )
            self.session.add(model)

        await self.session.flush()
        return user

    async def delete(self, user_id: UUID) -> bool:
        """Delete a user by ID."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()

        if model:
            await self.session.delete(model)
            await self.session.flush()
            return True
        return False

    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with the given email already exists."""
        result = await self.session.execute(
            select(UserModel.id).where(UserModel.email == email)
        )
        return result.scalar_one_or_none() is not None

    def _to_entity(self, model: UserModel) -> User:
        """Map ORM model to domain entity."""
        return User(
            id=model.id,
            email=Email(model.email),
            full_name=model.full_name,
            hashed_password=model.hashed_password,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class PostgresSettingsRepository(ISettingsRepository):
    """PostgreSQL implementation of the settings repository."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_user_id(self, user_id: UUID) -> Optional[Settings]:
        """Get settings for a user."""
        result = await self.session.execute(
            select(SettingsModel).where(SettingsModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def save(self, settings: Settings) -> Settings:
        """Create or update user settings."""
        existing = await self.session.get(SettingsModel, settings.user_id)

        if existing:
            # Update all fields
            existing.dark_mode = settings.dark_mode
            existing.email_notifications = settings.email_notifications
            existing.push_notifications = settings.push_notifications
            existing.sms_alerts = settings.sms_alerts
            existing.class_reminder_minutes = settings.class_reminder_minutes
            existing.exam_reminder_days = settings.exam_reminder_days
            existing.assignment_reminder_hours = settings.assignment_reminder_hours
            existing.alert_preferences = settings.alert_preferences
        else:
            model = SettingsModel(
                user_id=settings.user_id,
                dark_mode=settings.dark_mode,
                email_notifications=settings.email_notifications,
                push_notifications=settings.push_notifications,
                sms_alerts=settings.sms_alerts,
                class_reminder_minutes=settings.class_reminder_minutes,
                exam_reminder_days=settings.exam_reminder_days,
                assignment_reminder_hours=settings.assignment_reminder_hours,
                alert_preferences=settings.alert_preferences,
            )
            self.session.add(model)

        await self.session.flush()
        return settings

    def _to_entity(self, model: SettingsModel) -> Settings:
        """Map ORM model to domain entity."""
        return Settings(
            user_id=model.user_id,
            dark_mode=model.dark_mode,
            email_notifications=model.email_notifications,
            push_notifications=model.push_notifications,
            sms_alerts=model.sms_alerts,
            class_reminder_minutes=model.class_reminder_minutes,
            exam_reminder_days=model.exam_reminder_days,
            assignment_reminder_hours=model.assignment_reminder_hours,
            alert_preferences=model.alert_preferences,
        )


class PostgresNotificationRepository(INotificationRepository):
    """
    PostgreSQL implementation of the notification repository.

    Handles persistence of Notification entities created by domain event listeners.
    Supports bell badge count and read/unread state management.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def find_by_user(
        self, user_id: UUID, unread_only: bool = False, limit: int = 50
    ) -> List[Notification]:
        """Find notifications for a user, ordered by newest first."""
        query = (
            select(NotificationModel)
            .where(NotificationModel.user_id == user_id)
            .order_by(NotificationModel.created_at.desc())
            .limit(limit)
        )
        if unread_only:
            query = query.where(NotificationModel.is_read == False)  # noqa: E712

        result = await self.session.execute(query)
        models = result.scalars().all()
        return [self._to_entity(m) for m in models]

    async def find_by_id(self, notification_id: UUID) -> Optional[Notification]:
        """Find a single notification by ID."""
        model = await self.session.get(NotificationModel, notification_id)
        return self._to_entity(model) if model else None

    async def save(self, notification: Notification) -> Notification:
        """Create or update a notification."""
        existing = await self.session.get(NotificationModel, notification.id)

        if existing:
            existing.is_read = notification.is_read
            existing.updated_at = notification.updated_at
        else:
            model = NotificationModel(
                id=notification.id,
                user_id=notification.user_id,
                type=notification.type,
                title=notification.title,
                message=notification.message,
                is_read=notification.is_read,
                related_entity_id=notification.related_entity_id,
                created_at=notification.created_at,
                updated_at=notification.updated_at,
            )
            self.session.add(model)

        await self.session.flush()
        return notification

    async def mark_as_read(self, notification_id: UUID) -> bool:
        """Mark a single notification as read."""
        model = await self.session.get(NotificationModel, notification_id)
        if model:
            model.is_read = True
            await self.session.flush()
            return True
        return False

    async def mark_all_as_read(self, user_id: UUID) -> int:
        """Mark all notifications for a user as read."""
        result = await self.session.execute(
            update(NotificationModel)
            .where(
                NotificationModel.user_id == user_id,
                NotificationModel.is_read == False,  # noqa: E712
            )
            .values(is_read=True)
        )
        await self.session.flush()
        return result.rowcount

    async def count_unread(self, user_id: UUID) -> int:
        """Return the number of unread notifications for the bell badge."""
        result = await self.session.execute(
            select(func.count(NotificationModel.id)).where(
                NotificationModel.user_id == user_id,
                NotificationModel.is_read == False,  # noqa: E712
            )
        )
        return result.scalar_one() or 0

    def _to_entity(self, model: NotificationModel) -> Notification:
        """Map ORM model to domain entity."""
        return Notification(
            id=model.id,
            user_id=model.user_id,
            type=model.type,
            title=model.title,
            message=model.message,
            is_read=model.is_read,
            related_entity_id=model.related_entity_id,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
