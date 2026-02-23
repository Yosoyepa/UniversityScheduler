"""
Shared Domain Module.

Contains domain primitives, value objects, and exception hierarchy
that are shared across all bounded contexts.
"""
from app.shared.domain.exceptions import (
    BaseAppException,
    DomainException,
    InfrastructureException,
    ScheduleConflictException,
    InvalidEntityStateException,
    EntityNotFoundException,
    ValidationException,
    ExternalServiceTimeout,
    DatabaseConnectionError,
    GoogleCalendarException,
    get_http_status_code,
)
from app.shared.domain.entities import Entity
from app.shared.domain.value_objects import Email, TimeRange, DayOfWeek

__all__ = [
    # Exceptions
    "BaseAppException",
    "DomainException",
    "InfrastructureException",
    "ScheduleConflictException",
    "InvalidEntityStateException",
    "EntityNotFoundException",
    "ValidationException",
    "ExternalServiceTimeout",
    "DatabaseConnectionError",
    "GoogleCalendarException",
    "get_http_status_code",
    # Entities
    "Entity",
    # Value Objects
    "Email",
    "TimeRange",
    "DayOfWeek",
]
