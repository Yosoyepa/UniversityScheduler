"""
Base Entity Class.

Provides a common base for all domain entities following DDD patterns.
Entities have identity (UUID) and lifecycle timestamps.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4


def utc_now() -> datetime:
    """Get current UTC datetime. Extracted for testability (inject clock pattern)."""
    return datetime.now(timezone.utc)


@dataclass
class Entity:
    """
    Abstract base class for domain entities.
    
    Entities are objects with identity that persists over time.
    Two entities are equal if they have the same id, regardless of attributes.
    
    Following testable_code skill: datetime is not called directly in methods,
    instead utc_now() is used which can be mocked in tests.
    
    Attributes:
        id: Unique identifier (UUID)
        created_at: Timestamp when entity was created
        updated_at: Timestamp when entity was last modified
    """
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)
    
    def __eq__(self, other: object) -> bool:
        """Entities are equal if they have the same id."""
        if not isinstance(other, Entity):
            return NotImplemented
        return self.id == other.id
    
    def __hash__(self) -> int:
        """Hash based on id for use in sets and dicts."""
        return hash(self.id)
    
    def touch(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = utc_now()
