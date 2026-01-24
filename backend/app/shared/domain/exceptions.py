"""
Shared Domain Exceptions Module.

This module defines the exception hierarchy for the University Scheduler application
following the error_hierarchy.puml specification.

Exception Hierarchy:
    BaseAppException (abstract)
    ├── DomainException (business logic errors)
    │   ├── ScheduleConflictException → HTTP 409
    │   ├── InvalidEntityStateException → HTTP 422
    │   └── EntityNotFoundException → HTTP 404
    └── InfrastructureException (external system errors)
        ├── ExternalServiceTimeout → HTTP 503
        └── DatabaseConnectionError → HTTP 503
"""
from abc import ABC
from dataclasses import dataclass, field
from typing import Optional, List, Any
from uuid import UUID


@dataclass
class BaseAppException(Exception, ABC):
    """
    Abstract base exception for all application errors.
    
    Attributes:
        code: Machine-readable error code (e.g., 'SCHEDULE_CONFLICT')
        message: Human-readable error description
    """
    code: str
    message: str
    
    def __post_init__(self):
        super().__init__(self.message)
    
    def to_dict(self) -> dict:
        """Convert exception to API response format."""
        return {
            "error": self.code,
            "message": self.message
        }


# =============================================================================
# Domain Exceptions (Business Logic Errors)
# =============================================================================

@dataclass
class DomainException(BaseAppException):
    """
    Base exception for domain/business logic errors.
    
    Attributes:
        entity_id: Optional identifier of the entity that caused the error
    """
    entity_id: Optional[UUID] = None
    
    def to_dict(self) -> dict:
        result = super().to_dict()
        if self.entity_id:
            result["entity_id"] = str(self.entity_id)
        return result


@dataclass
class ScheduleConflictException(DomainException):
    """
    Raised when a time conflict is detected between class sessions.
    Maps to HTTP 409 Conflict.
    
    Attributes:
        conflicts: List of conflicting session details
        resolution_options: Suggested ways to resolve the conflict
    """
    conflicts: List[dict] = field(default_factory=list)
    resolution_options: List[str] = field(default_factory=lambda: [
        "Modify the start/end times of the new subject",
        "Modify the start/end times of the conflicting subject",
        "Cancel this operation"
    ])
    
    def __post_init__(self):
        if not self.code:
            self.code = "SCHEDULE_CONFLICT"
        if not self.message:
            self.message = "Schedule conflicts detected with existing subjects"
        super().__post_init__()
    
    def to_dict(self) -> dict:
        result = super().to_dict()
        result["conflicts"] = self.conflicts
        result["resolution_options"] = self.resolution_options
        return result


@dataclass
class InvalidEntityStateException(DomainException):
    """
    Raised when an entity is in an invalid state for the requested operation.
    Maps to HTTP 422 Unprocessable Entity.
    
    Example: Trying to complete a task that is already archived.
    """
    current_state: Optional[str] = None
    expected_states: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        if not self.code:
            self.code = "INVALID_ENTITY_STATE"
        super().__post_init__()
    
    def to_dict(self) -> dict:
        result = super().to_dict()
        if self.current_state:
            result["current_state"] = self.current_state
        if self.expected_states:
            result["expected_states"] = self.expected_states
        return result


@dataclass
class EntityNotFoundException(DomainException):
    """
    Raised when an entity is not found in the repository.
    Maps to HTTP 404 Not Found.
    """
    entity_type: str = "Entity"
    
    def __post_init__(self):
        if not self.code:
            self.code = f"{self.entity_type.upper()}_NOT_FOUND"
        if not self.message and self.entity_id:
            self.message = f"{self.entity_type} with id {self.entity_id} not found"
        super().__post_init__()


@dataclass
class ValidationException(DomainException):
    """
    Raised when input validation fails.
    Maps to HTTP 400 Bad Request.
    """
    details: dict = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.code:
            self.code = "VALIDATION_ERROR"
        if not self.message:
            self.message = "Validation failed"
        super().__post_init__()
    
    def to_dict(self) -> dict:
        result = super().to_dict()
        if self.details:
            result["details"] = self.details
        return result


# =============================================================================
# Infrastructure Exceptions (External System Errors)
# =============================================================================

@dataclass
class InfrastructureException(BaseAppException):
    """
    Base exception for infrastructure/external system errors.
    
    Attributes:
        service_name: Name of the external service that failed
    """
    service_name: str = "unknown"
    
    def to_dict(self) -> dict:
        result = super().to_dict()
        result["service"] = self.service_name
        return result


@dataclass
class ExternalServiceTimeout(InfrastructureException):
    """
    Raised when an external service times out.
    Maps to HTTP 503 Service Unavailable.
    """
    timeout_seconds: Optional[float] = None
    
    def __post_init__(self):
        if not self.code:
            self.code = "EXTERNAL_SERVICE_TIMEOUT"
        if not self.message:
            self.message = f"Service '{self.service_name}' is temporarily unavailable"
        super().__post_init__()


@dataclass
class DatabaseConnectionError(InfrastructureException):
    """
    Raised when database connection fails.
    Maps to HTTP 503 Service Unavailable.
    """
    def __post_init__(self):
        if not self.code:
            self.code = "DATABASE_CONNECTION_ERROR"
        if not self.message:
            self.message = "Database connection failed"
        self.service_name = "database"
        super().__post_init__()


@dataclass
class GoogleCalendarException(InfrastructureException):
    """
    Raised when Google Calendar API fails.
    Maps to HTTP 502/503.
    """
    def __post_init__(self):
        if not self.code:
            self.code = "GOOGLE_CALENDAR_ERROR"
        self.service_name = "google_calendar"
        super().__post_init__()


# =============================================================================
# HTTP Status Code Mapping
# =============================================================================

EXCEPTION_HTTP_MAPPING = {
    ScheduleConflictException: 409,
    InvalidEntityStateException: 422,
    EntityNotFoundException: 404,
    ValidationException: 400,
    ExternalServiceTimeout: 503,
    DatabaseConnectionError: 503,
    GoogleCalendarException: 502,
}


def get_http_status_code(exception: BaseAppException) -> int:
    """Get the HTTP status code for a given exception type."""
    for exc_type, status_code in EXCEPTION_HTTP_MAPPING.items():
        if isinstance(exception, exc_type):
            return status_code
    # Default to 500 for unknown exceptions
    return 500
