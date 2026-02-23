"""
Domain Events Infrastructure.

Implements the event-driven architecture as specified in domain_events.puml.
Uses an in-memory synchronous event bus initially, which can be swapped
for an async implementation (RabbitMQ, Redis) later via the port/adapter pattern.

Event Types:
    - SubjectCreatedEvent: When a new subject is created
    - SemesterActivatedEvent: When a semester is marked as active
    - TaskCompletedEvent: When a task moves to DONE status
    - TaskOverdueEvent: When a task passes its due date

Listeners:
    - GCalSyncListener: Syncs events to Google Calendar
    - ProgressTrackerListener: Updates progress metrics
    - NotificationListener: Sends notifications to user
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable, Dict, List, Type, TypeVar
from uuid import UUID
import logging

from app.shared.domain.entities import utc_now

logger = logging.getLogger(__name__)


# =============================================================================
# Base Event Classes
# =============================================================================

@dataclass
class DomainEvent(ABC):
    """
    Abstract base class for all domain events.
    
    Events are immutable records of something that happened in the domain.
    They are named in past tense (SubjectCreated, not CreateSubject).
    
    Attributes:
        event_id: Unique identifier for this event instance
        occurred_at: Timestamp when the event occurred
    """
    occurred_at: datetime = field(default_factory=utc_now)
    
    @property
    @abstractmethod
    def event_name(self) -> str:
        """Return the name of this event type."""
        pass


# =============================================================================
# Academic Planning Events
# =============================================================================

@dataclass
class SubjectCreatedEvent(DomainEvent):
    """
    Emitted when a new subject is successfully created.
    
    Listeners:
        - GCalSyncListener: Optionally creates recurring calendar events
    """
    subject_id: UUID = field(default=None)
    semester_id: UUID = field(default=None)
    subject_name: str = ""
    session_count: int = 0
    
    @property
    def event_name(self) -> str:
        return "SubjectCreatedEvent"


@dataclass
class SemesterActivatedEvent(DomainEvent):
    """
    Emitted when a semester is marked as active.
    
    The system should only have one active semester per user at a time.
    """
    semester_id: UUID = field(default=None)
    user_id: UUID = field(default=None)
    semester_name: str = ""
    
    @property
    def event_name(self) -> str:
        return "SemesterActivatedEvent"


# =============================================================================
# Task Events
# =============================================================================

@dataclass
class TaskCompletedEvent(DomainEvent):
    """
    Emitted when a task moves to DONE status.
    
    Listeners:
        - ProgressTrackerListener: Updates completion metrics
        - NotificationListener: Sends completion notification
    """
    task_id: UUID = field(default=None)
    user_id: UUID = field(default=None)
    subject_id: UUID = field(default=None)  # Optional, may be None
    task_title: str = ""
    
    @property
    def event_name(self) -> str:
        return "TaskCompletedEvent"


@dataclass
class TaskOverdueEvent(DomainEvent):
    """
    Emitted by a scheduled job when a task passes its due date.
    
    Listeners:
        - NotificationListener: Sends overdue alert
    """
    task_id: UUID = field(default=None)
    user_id: UUID = field(default=None)
    task_title: str = ""
    due_date: datetime = field(default=None)
    
    @property
    def event_name(self) -> str:
        return "TaskOverdueEvent"


# =============================================================================
# Event Bus Interface (Port)
# =============================================================================

EventHandler = Callable[[DomainEvent], None]
T = TypeVar("T", bound=DomainEvent)


class IEventBus(ABC):
    """
    Port interface for the event bus.
    
    Implementations:
        - SyncEventBus: In-memory synchronous (for testing and initial dev)
        - AsyncEventBus: Background processing (for production)
    """
    
    @abstractmethod
    def subscribe(self, event_type: Type[T], handler: EventHandler) -> None:
        """
        Subscribe a handler to an event type.
        
        Args:
            event_type: The type of event to listen for
            handler: Callable that receives the event
        """
        pass
    
    @abstractmethod
    def publish(self, event: DomainEvent) -> None:
        """
        Publish an event to all subscribed handlers.
        
        Args:
            event: The domain event to publish
        """
        pass


# =============================================================================
# In-Memory Synchronous Implementation (Adapter)
# =============================================================================

class SyncEventBus(IEventBus):
    """
    Synchronous in-memory event bus implementation.
    
    Suitable for:
        - Unit testing (predictable, synchronous execution)
        - Development environment
        - Simple use cases where async isn't needed
    
    For production, consider:
        - BackgroundEventBus (using threading or asyncio)
        - RabbitMQEventBus
        - RedisEventBus
    """
    
    def __init__(self):
        self._handlers: Dict[Type[DomainEvent], List[EventHandler]] = {}
    
    def subscribe(self, event_type: Type[T], handler: EventHandler) -> None:
        """Register a handler for an event type."""
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)
    
    def publish(self, event: DomainEvent) -> None:
        """
        Publish event to all registered handlers synchronously.
        
        Exceptions in handlers are logged but don't stop other handlers.
        """
        event_type = type(event)
        handlers = self._handlers.get(event_type, [])
        
        for handler in handlers:
            try:
                handler(event)
            except Exception as e:
                # Log but don't propagate - other handlers should still run
                # In production, use proper logging
                logger.error("Error in handler for %s: %s", event.event_name, e, exc_info=True)
    
    def clear(self) -> None:
        """Clear all handlers. Useful for testing."""
        self._handlers.clear()


# =============================================================================
# Global Event Bus Instance (can be replaced via DI)
# =============================================================================

# Default event bus instance - can be replaced in tests or production config
_event_bus: IEventBus = SyncEventBus()


def get_event_bus() -> IEventBus:
    """Get the current event bus instance. Used for dependency injection."""
    return _event_bus


def set_event_bus(bus: IEventBus) -> None:
    """Replace the event bus instance. Used for testing or configuration."""
    global _event_bus
    _event_bus = bus
