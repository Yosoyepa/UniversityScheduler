"""
PostgreSQL User Repository Adapter.

Implements IUserRepository using SQLAlchemy async session.
Maps between domain entities and ORM models.

Following architecture-patterns skill:
    - Adapter implements the Port interface
    - Repository handles persistence, not business logic
    - Domain entities are returned, not ORM models
"""
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.users.domain.entities import User, Settings
from app.modules.users.port.repository import IUserRepository, ISettingsRepository
from app.modules.users.infrastructure.models import UserModel, SettingsModel
from app.shared.domain.value_objects import Email


class PostgresUserRepository(IUserRepository):
    """
    PostgreSQL implementation of the user repository.
    
    Uses SQLAlchemy async session for database operations.
    """
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find a user by their unique ID."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None
    
    async def find_by_email(self, email: str) -> Optional[User]:
        """Find a user by their email address."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.email == email)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None
    
    async def save(self, user: User) -> User:
        """Persist a user entity."""
        # Check if user exists
        existing = await self.session.get(UserModel, user.id)
        
        if existing:
            # Update existing
            existing.email = str(user.email)
            existing.full_name = user.full_name
            existing.hashed_password = user.hashed_password
            existing.is_active = user.is_active
            existing.updated_at = user.updated_at
        else:
            # Create new
            model = UserModel(
                id=user.id,
                email=str(user.email),
                full_name=user.full_name,
                hashed_password=user.hashed_password,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at,
            )
            self.session.add(model)
        
        await self.session.flush()
        return user
    
    async def delete(self, user_id: UUID) -> bool:
        """Delete a user by ID."""
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        model = result.scalar_one_or_none()
        
        if model:
            await self.session.delete(model)
            await self.session.flush()
            return True
        return False
    
    async def exists_by_email(self, email: str) -> bool:
        """Check if a user with the given email already exists."""
        result = await self.session.execute(
            select(UserModel.id).where(UserModel.email == email)
        )
        return result.scalar_one_or_none() is not None
    
    def _to_entity(self, model: UserModel) -> User:
        """Map ORM model to domain entity."""
        return User(
            id=model.id,
            email=Email(model.email),
            full_name=model.full_name,
            hashed_password=model.hashed_password,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class PostgresSettingsRepository(ISettingsRepository):
    """PostgreSQL implementation of the settings repository."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def find_by_user_id(self, user_id: UUID) -> Optional[Settings]:
        """Get settings for a user."""
        result = await self.session.execute(
            select(SettingsModel).where(SettingsModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None
    
    async def save(self, settings: Settings) -> Settings:
        """Create or update user settings."""
        existing = await self.session.get(SettingsModel, settings.user_id)
        
        if existing:
            existing.dark_mode = settings.dark_mode
            existing.email_notifications = settings.email_notifications
            existing.alert_preferences = settings.alert_preferences
        else:
            model = SettingsModel(
                user_id=settings.user_id,
                dark_mode=settings.dark_mode,
                email_notifications=settings.email_notifications,
                alert_preferences=settings.alert_preferences,
            )
            self.session.add(model)
        
        await self.session.flush()
        return settings
    
    def _to_entity(self, model: SettingsModel) -> Settings:
        """Map ORM model to domain entity."""
        return Settings(
            user_id=model.user_id,
            dark_mode=model.dark_mode,
            email_notifications=model.email_notifications,
            alert_preferences=model.alert_preferences,
        )
