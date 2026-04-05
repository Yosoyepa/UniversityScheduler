"""
User Profile & Settings API Router.

FastAPI router for user profile updates, settings management,
and notification handling. Mounted separately from /auth for
better route organization.

Following architecture-patterns skill:
    - Router is the adapter layer (interface adapter)
    - Thin controller — delegates to use cases
    - Handles HTTP concerns only
    - All routes are JWT-protected
"""
import logging
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.infrastructure.database import get_async_session
from app.modules.users.application.schemas import (
    UpdateProfileRequest,
    UpdateSettingsRequest,
    SettingsResponse,
    UserResponse,
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse,
)
from app.modules.users.application.settings_use_cases import (
    UpdateProfileUseCase,
    GetSettingsUseCase,
    UpdateSettingsUseCase,
    ListNotificationsUseCase,
    GetUnreadCountUseCase,
    MarkNotificationReadUseCase,
    MarkAllNotificationsReadUseCase,
)
from app.modules.users.adapter.postgres_repository import (
    PostgresUserRepository,
    PostgresSettingsRepository,
    PostgresNotificationRepository,
)
from app.cross_cutting.auth_middleware import get_current_user, AuthenticatedUser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/user", tags=["User & Settings"])


# =============================================================================
# Dependency Injection Helpers
# =============================================================================

def get_user_repository(session: AsyncSession = Depends(get_async_session)):
    return PostgresUserRepository(session)


def get_settings_repository(session: AsyncSession = Depends(get_async_session)):
    return PostgresSettingsRepository(session)


def get_notification_repository(session: AsyncSession = Depends(get_async_session)):
    return PostgresNotificationRepository(session)


# =============================================================================
# Profile Endpoints
# =============================================================================

@router.put(
    "/profile",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user profile",
    description="Update the authenticated user's full name.",
)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    user_repo: PostgresUserRepository = Depends(get_user_repository),
):
    """Update user profile information."""
    use_case = UpdateProfileUseCase(user_repository=user_repo)
    user = await use_case.execute(
        user_id=current_user.id,
        request=request,
    )
    return UserResponse(
        id=user.id,
        email=str(user.email),
        full_name=user.full_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


# =============================================================================
# Settings Endpoints
# =============================================================================

@router.get(
    "/settings",
    response_model=SettingsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user settings",
    description="Retrieve the authenticated user's preferences. Creates defaults if none exist.",
)
async def get_settings(
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings_repo: PostgresSettingsRepository = Depends(get_settings_repository),
):
    """Get user settings."""
    use_case = GetSettingsUseCase(settings_repository=settings_repo)
    settings = await use_case.execute(user_id=current_user.id)
    return SettingsResponse(
        dark_mode=settings.dark_mode,
        email_notifications=settings.email_notifications,
        push_notifications=settings.push_notifications,
        sms_alerts=settings.sms_alerts,
        class_reminder_minutes=settings.class_reminder_minutes,
        exam_reminder_days=settings.exam_reminder_days,
        assignment_reminder_hours=settings.assignment_reminder_hours,
        alert_preferences=settings.alert_preferences,
    )


@router.patch(
    "/settings",
    response_model=SettingsResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user settings",
    description="Partially update user preferences. Only provided fields are updated.",
)
async def update_settings(
    request: UpdateSettingsRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    settings_repo: PostgresSettingsRepository = Depends(get_settings_repository),
):
    """Update user settings — PATCH semantics (partial update)."""
    use_case = UpdateSettingsUseCase(settings_repository=settings_repo)
    settings = await use_case.execute(user_id=current_user.id, request=request)
    return SettingsResponse(
        dark_mode=settings.dark_mode,
        email_notifications=settings.email_notifications,
        push_notifications=settings.push_notifications,
        sms_alerts=settings.sms_alerts,
        class_reminder_minutes=settings.class_reminder_minutes,
        exam_reminder_days=settings.exam_reminder_days,
        assignment_reminder_hours=settings.assignment_reminder_hours,
        alert_preferences=settings.alert_preferences,
    )


# =============================================================================
# Notification Endpoints
# =============================================================================

@router.get(
    "/notifications",
    response_model=NotificationListResponse,
    status_code=status.HTTP_200_OK,
    summary="List user notifications",
    description="Get recent notifications for the authenticated user.",
)
async def list_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: AuthenticatedUser = Depends(get_current_user),
    notif_repo: PostgresNotificationRepository = Depends(get_notification_repository),
):
    """List user notifications."""
    list_uc = ListNotificationsUseCase(notification_repository=notif_repo)
    count_uc = GetUnreadCountUseCase(notification_repository=notif_repo)

    notifications = await list_uc.execute(
        user_id=current_user.id, unread_only=unread_only, limit=limit
    )
    unread_count = await count_uc.execute(user_id=current_user.id)

    return NotificationListResponse(
        data=[
            NotificationResponse(
                id=n.id,
                type=n.type,
                title=n.title,
                message=n.message,
                is_read=n.is_read,
                related_entity_id=n.related_entity_id,
                created_at=n.created_at,
            )
            for n in notifications
        ],
        unread_count=unread_count,
    )


@router.get(
    "/notifications/count",
    response_model=UnreadCountResponse,
    status_code=status.HTTP_200_OK,
    summary="Get unread notification count",
    description="Returns the number of unread notifications for the bell badge.",
)
async def get_unread_count(
    current_user: AuthenticatedUser = Depends(get_current_user),
    notif_repo: PostgresNotificationRepository = Depends(get_notification_repository),
):
    """Get unread notification count for bell badge."""
    use_case = GetUnreadCountUseCase(notification_repository=notif_repo)
    count = await use_case.execute(user_id=current_user.id)
    return UnreadCountResponse(unread_count=count)


@router.patch(
    "/notifications/{notification_id}/read",
    status_code=status.HTTP_200_OK,
    summary="Mark notification as read",
    description="Mark a single notification as read.",
)
async def mark_notification_read(
    notification_id: UUID,
    current_user: AuthenticatedUser = Depends(get_current_user),
    notif_repo: PostgresNotificationRepository = Depends(get_notification_repository),
):
    """Mark a notification as read."""
    use_case = MarkNotificationReadUseCase(notification_repository=notif_repo)
    await use_case.execute(notification_id=notification_id, user_id=current_user.id)
    return {"message": "Notification marked as read"}


@router.patch(
    "/notifications/read-all",
    status_code=status.HTTP_200_OK,
    summary="Mark all notifications as read",
    description="Mark all user notifications as read.",
)
async def mark_all_notifications_read(
    current_user: AuthenticatedUser = Depends(get_current_user),
    notif_repo: PostgresNotificationRepository = Depends(get_notification_repository),
):
    """Mark all notifications as read."""
    use_case = MarkAllNotificationsReadUseCase(notification_repository=notif_repo)
    count = await use_case.execute(user_id=current_user.id)
    return {"message": f"{count} notifications marked as read", "updated_count": count}
