"""
Settings and Notification Use Cases.

Application layer orchestrators for user preferences and in-app notifications.

Following Hexagonal Architecture:
    - Use cases receive port interfaces via constructor injection
    - Each use case has a single execute() method
    - Use cases coordinate: validate input → call domain → call repository
    - Never import infrastructure directly
"""
import logging
from typing import List, Optional
from uuid import UUID

from app.modules.users.domain.entities import (
    Settings,
    Notification,
    NOTIFICATION_TYPE_TASK_COMPLETED,
    NOTIFICATION_TYPE_TASK_OVERDUE,
    NOTIFICATION_TYPE_SYSTEM,
)
from app.modules.users.port.repository import (
    IUserRepository,
    ISettingsRepository,
    INotificationRepository,
)
from app.modules.users.application.schemas import (
    UpdateSettingsRequest,
    UpdateProfileRequest,
)
from app.shared.domain.exceptions import EntityNotFoundException, ValidationException

logger = logging.getLogger(__name__)


# =============================================================================
# Profile Use Cases
# =============================================================================


class UpdateProfileUseCase:
    """Update the user's profile (full_name)."""

    def __init__(self, user_repository: IUserRepository):
        self._user_repository = user_repository

    async def execute(self, user_id: UUID, request: UpdateProfileRequest):
        """Execute the use case."""
        user = await self._user_repository.find_by_id(user_id)
        if not user:
            raise EntityNotFoundException(
                code="USER_NOT_FOUND",
                message=f"User with id {user_id} not found",
                entity_type="User",
            )

        if request.full_name is not None:
            if len(request.full_name.strip()) < 2:
                raise ValidationException(
                    code="VALIDATION_ERROR",
                    message="Full name must be at least 2 characters long.",
                )
            user.full_name = request.full_name.strip()
            user.touch()

        saved = await self._user_repository.save(user)
        logger.info(f"Updated profile for user {user_id}")
        return saved


# =============================================================================
# Settings Use Cases
# =============================================================================


class GetSettingsUseCase:
    """Retrieve user settings or create defaults if none exist."""

    def __init__(self, settings_repository: ISettingsRepository):
        self._settings_repository = settings_repository

    async def execute(self, user_id: UUID) -> Settings:
        """Execute the use case."""
        settings = await self._settings_repository.find_by_user_id(user_id)
        if not settings:
            # Create default settings for user
            settings = Settings(user_id=user_id)
            settings = await self._settings_repository.save(settings)
            logger.info(f"Created default settings for user {user_id}")
        return settings


class UpdateSettingsUseCase:
    """Partially update user preferences."""

    def __init__(self, settings_repository: ISettingsRepository):
        self._settings_repository = settings_repository

    async def execute(self, user_id: UUID, request: UpdateSettingsRequest) -> Settings:
        """Execute the use case — applies only the non-None fields from the request."""
        settings = await self._settings_repository.find_by_user_id(user_id)
        if not settings:
            settings = Settings(user_id=user_id)

        # Apply partial updates — only fields explicitly sent in the request
        if request.dark_mode is not None:
            settings.dark_mode = request.dark_mode
        if request.email_notifications is not None:
            settings.email_notifications = request.email_notifications
        if request.push_notifications is not None:
            settings.push_notifications = request.push_notifications
        if request.sms_alerts is not None:
            settings.sms_alerts = request.sms_alerts
        if request.class_reminder_minutes is not None:
            settings.class_reminder_minutes = request.class_reminder_minutes
        if request.exam_reminder_days is not None:
            settings.exam_reminder_days = request.exam_reminder_days
        if request.assignment_reminder_hours is not None:
            settings.assignment_reminder_hours = request.assignment_reminder_hours
        if request.alert_preferences is not None:
            settings.alert_preferences = request.alert_preferences

        saved = await self._settings_repository.save(settings)
        logger.info(f"Updated settings for user {user_id}")
        return saved


# =============================================================================
# Notification Use Cases
# =============================================================================


class ListNotificationsUseCase:
    """List notifications for a user."""

    def __init__(self, notification_repository: INotificationRepository):
        self._notification_repository = notification_repository

    async def execute(
        self, user_id: UUID, unread_only: bool = False, limit: int = 50
    ) -> List[Notification]:
        """Execute the use case."""
        return await self._notification_repository.find_by_user(
            user_id=user_id, unread_only=unread_only, limit=limit
        )


class GetUnreadCountUseCase:
    """Get the count of unread notifications for the bell badge."""

    def __init__(self, notification_repository: INotificationRepository):
        self._notification_repository = notification_repository

    async def execute(self, user_id: UUID) -> int:
        """Execute the use case."""
        return await self._notification_repository.count_unread(user_id)


class MarkNotificationReadUseCase:
    """Mark a single notification as read."""

    def __init__(self, notification_repository: INotificationRepository):
        self._notification_repository = notification_repository

    async def execute(self, notification_id: UUID, user_id: UUID) -> bool:
        """Execute the use case."""
        notification = await self._notification_repository.find_by_id(notification_id)
        if not notification:
            raise EntityNotFoundException(
                code="NOTIFICATION_NOT_FOUND",
                message=f"Notification with id {notification_id} not found",
                entity_type="Notification",
            )
        # Ownership check
        if notification.user_id != user_id:
            raise ValidationException(
                code="PERMISSION_DENIED",
                message="Permission denied to modify this notification",
            )
        return await self._notification_repository.mark_as_read(notification_id)


class MarkAllNotificationsReadUseCase:
    """Mark all notifications for a user as read."""

    def __init__(self, notification_repository: INotificationRepository):
        self._notification_repository = notification_repository

    async def execute(self, user_id: UUID) -> int:
        """Execute the use case. Returns count of updated notifications."""
        count = await self._notification_repository.mark_all_as_read(user_id)
        logger.info(f"Marked {count} notifications as read for user {user_id}")
        return count
