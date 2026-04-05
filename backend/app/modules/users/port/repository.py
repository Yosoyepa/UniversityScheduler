"""
User Repository Port (Interface).

Defines the contract for user persistence operations.
The domain layer depends on this interface, not the concrete implementation.

Following architecture-patterns skill:
    - Port defines the interface
    - Adapter (PostgresUserRepository) implements the interface
    - Domain never imports infrastructure
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.modules.users.domain.entities import User, Settings, Notification


class IUserRepository(ABC):
    """
    Port interface for user persistence operations.

    Implementations:
        - PostgresUserRepository (production)
        - InMemoryUserRepository (testing)
    """

    @abstractmethod
    async def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find a user by their unique ID."""
        pass

    @abstractmethod
    async def find_by_email(self, email: str) -> Optional[User]:
        """Find a user by their email address."""
        pass

    @abstractmethod
    async def save(self, user: User) -> User:
        """
        Persist a user entity.

        Creates a new user if ID doesn't exist, updates if it does.
        Returns the persisted user.
        """
        pass

    @abstractmethod
    async def delete(self, user_id: UUID) -> bool:
        """
        Delete a user by ID.

        Returns True if user was deleted, False if not found.
        """
        pass

    @abstractmethod
    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with the given email already exists."""
        pass


class ISettingsRepository(ABC):
    """Port interface for user settings persistence."""

    @abstractmethod
    async def find_by_user_id(self, user_id: UUID) -> Optional[Settings]:
        """Get settings for a user."""
        pass

    @abstractmethod
    async def save(self, settings: Settings) -> Settings:
        """Create or update user settings."""
        pass


class INotificationRepository(ABC):
    """
    Port interface for user notification persistence.

    Implementations:
        - PostgresNotificationRepository (production)
    """

    @abstractmethod
    async def find_by_user(
        self, user_id: UUID, unread_only: bool = False, limit: int = 50
    ) -> List[Notification]:
        """Find notifications for a user, optionally filtering to unread only."""
        pass

    @abstractmethod
    async def find_by_id(self, notification_id: UUID) -> Optional[Notification]:
        """Find a single notification by ID."""
        pass

    @abstractmethod
    async def save(self, notification: Notification) -> Notification:
        """Create or update a notification."""
        pass

    @abstractmethod
    async def mark_as_read(self, notification_id: UUID) -> bool:
        """Mark a single notification as read. Returns True if found and updated."""
        pass

    @abstractmethod
    async def mark_all_as_read(self, user_id: UUID) -> int:
        """Mark all notifications for a user as read. Returns count of updated rows."""
        pass

    @abstractmethod
    async def count_unread(self, user_id: UUID) -> int:
        """Return the number of unread notifications for a user (for bell badge)."""
        pass
