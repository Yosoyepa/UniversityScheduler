"""
Event Registration Module.

Centralizes registration of all domain event listeners.
Called once during application startup via the FastAPI lifespan.

Following the domain events architecture doc:
    - NotificationListener subscribes to TaskCompletedEvent, TaskOverdueEvent
    - GCalSyncListener will subscribe in Phase 6 (SubjectCreatedEvent)
    - ProgressTrackerListener reserved for future implementation
"""
import logging

logger = logging.getLogger(__name__)


def register_event_listeners() -> None:
    """
    Register all domain event listeners with the global event bus.

    This function must be called once at application startup.
    Fails silently on individual listener registration errors to
    prevent startup failure.
    """
    from app.shared.domain.events import (
        get_event_bus,
        TaskCompletedEvent,
        TaskOverdueEvent,
    )
    from app.modules.users.application.notification_listener import NotificationListener

    bus = get_event_bus()
    listener = NotificationListener()

    try:
        bus.subscribe(TaskCompletedEvent, listener.on_task_completed)
        logger.info("✅ Registered NotificationListener for TaskCompletedEvent")
    except Exception as exc:
        logger.error(f"Failed to register TaskCompletedEvent listener: {exc}")

    try:
        bus.subscribe(TaskOverdueEvent, listener.on_task_overdue)
        logger.info("✅ Registered NotificationListener for TaskOverdueEvent")
    except Exception as exc:
        logger.error(f"Failed to register TaskOverdueEvent listener: {exc}")

    logger.info("🔔 Event listeners registered successfully")
