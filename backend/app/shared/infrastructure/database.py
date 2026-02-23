"""
Database Infrastructure Module.

Provides async SQLAlchemy engine, session factory, and dependency injection
for FastAPI endpoints. Uses the asyncpg driver for PostgreSQL.

Following architecture-patterns skill:
    - Database connection is an infrastructure concern (adapter layer)
    - Session is injected into use cases via dependency injection
    - Domain layer never imports this module directly
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings


settings = get_settings()

# Create async engine with connection pool
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=settings.DEBUG,  # Log SQL in debug mode
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Check connection health before use
)

# Session factory - creates new sessions for each request
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.
    
    All ORM models should inherit from this class.
    """
    pass


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session.
    
    Usage in routes:
        @router.get("/items")
        async def get_items(session: AsyncSession = Depends(get_async_session)):
            ...
    
    The session is automatically closed after the request.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@asynccontextmanager
async def get_session_context() -> AsyncGenerator[AsyncSession, None]:
    """
    Context manager for database sessions outside of FastAPI routes.
    
    Usage:
        async with get_session_context() as session:
            result = await session.execute(...)
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.
    
    In production, use Alembic migrations instead of create_all.
    This is useful for development/testing.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def dispose_engine() -> None:
    """
    Dispose of the engine connection pool.
    
    Call this on application shutdown.
    """
    await engine.dispose()
