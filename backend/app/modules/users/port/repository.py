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
from typing import Optional
from uuid import UUID

from app.modules.users.domain.entities import User, Settings


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
