"""
Notification Listener.

Listens to domain events and creates persistent Notification entities.
Uses Opción A (MVP): creates notifications via a direct synchronous DB session.

Following the domain events architecture:
    - Listens to TaskCompletedEvent and TaskOverdueEvent
    - Creates a Notification entity and persists it immediately
    - Uses a separate sync session factory to avoid coupling with the
      async request session (which may not be available in event handlers)
"""
import logging
from datetime import datetime, timezone

from app.shared.domain.events import TaskCompletedEvent, TaskOverdueEvent
from app.modules.users.domain.entities import (
    Notification,
    NOTIFICATION_TYPE_TASK_COMPLETED,
    NOTIFICATION_TYPE_TASK_OVERDUE,
)

logger = logging.getLogger(__name__)


class NotificationListener:
    """
    Creates persistent notifications from domain events.

    MVP Implementation (Opción A): Uses the synchronous SQLAlchemy engine
    to persist notifications directly when an event fires, bypassing the
    async request session.

    Future improvement: Evolve EventBus to async (Fase 8) to use
    the request's async session directly.
    """

    def on_task_completed(self, event: TaskCompletedEvent) -> None:
        """Handle TaskCompletedEvent — create a TASK_COMPLETED notification."""
        try:
            notification = Notification(
                user_id=event.user_id,
                type=NOTIFICATION_TYPE_TASK_COMPLETED,
                title="✅ Tarea completada",
                message=f"Completaste la tarea: \"{event.task_title}\"",
                related_entity_id=event.task_id,
            )
            self._persist_sync(notification)
            logger.info(
                f"📋 NOTIFICATION [TASK_COMPLETED]: Task '{event.task_title}' "
                f"completed by user {event.user_id}"
            )
        except Exception as exc:
            # Listeners must never raise — log and continue
            logger.error(f"NotificationListener.on_task_completed failed: {exc}")

    def on_task_overdue(self, event: TaskOverdueEvent) -> None:
        """Handle TaskOverdueEvent — create a TASK_OVERDUE notification."""
        try:
            notification = Notification(
                user_id=event.user_id,
                type=NOTIFICATION_TYPE_TASK_OVERDUE,
                title="⚠️ Tarea vencida",
                message=f"La tarea \"{event.task_title}\" ha superado su fecha límite.",
                related_entity_id=event.task_id,
            )
            self._persist_sync(notification)
            logger.warning(
                f"⚠️ NOTIFICATION [TASK_OVERDUE]: Task '{event.task_title}' "
                f"is overdue for user {event.user_id}"
            )
        except Exception as exc:
            logger.error(f"NotificationListener.on_task_overdue failed: {exc}")

    def _persist_sync(self, notification: Notification) -> None:
        """
        Persist a notification using a synchronous session.

        This is the Opción A (MVP) approach: synchronous session from the
        shared engine. Safe to call from a synchronous event handler.
        """
        from app.shared.infrastructure.database import sync_engine
        from sqlalchemy.orm import Session
        from app.modules.users.infrastructure.models import NotificationModel

        with Session(sync_engine) as session:
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
            session.add(model)
            session.commit()
