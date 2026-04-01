---
name: backend-shared-kernel
description: Guide for adding or modifying shared domain infrastructure in the UniversityScheduler backend. Use this skill whenever working with backend/app/shared/, including base entities, value objects, domain events, the event bus, domain exceptions, or shared infrastructure like the database engine and session factory. Also use when the user mentions shared kernel, base exceptions, event bus, value objects, or common domain abstractions.
---

# Backend Shared Kernel

This skill defines how to work with the shared kernel in `backend/app/shared/`. The shared kernel provides foundational abstractions that all feature modules depend on.

## Directory Structure

```
backend/app/shared/
├── __init__.py
├── domain/
│   ├── __init__.py        # Re-exports key classes
│   ├── entities.py        # Base Entity class
│   ├── value_objects.py   # Email, and other value objects
│   ├── events.py          # DomainEvent base, EventBus interface, SyncEventBus
│   └── exceptions.py      # Full exception hierarchy
└── infrastructure/
    ├── __init__.py
    └── database.py        # Async SQLAlchemy engine + session factory
```

## Domain Layer (`shared/domain/`)

### Base Entity (`entities.py`)

All domain entities in every module must inherit from this base class:

```python
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID, uuid4

@dataclass
class Entity:
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=utc_now)
    updated_at: datetime = field(default_factory=utc_now)

    def touch(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = utc_now()
```

When adding new base functionality, keep it minimal — this class is inherited by every entity in the system.

### Value Objects (`value_objects.py`)

Immutable objects defined by their attributes, not identity. Currently includes:
- `Email` — validated email string wrapper

When adding new value objects:
- Make them immutable (frozen dataclass or `__setattr__` override)
- Include validation in `__post_init__`
- Value objects have no identity — equality is by value
- Keep them framework-free (no Pydantic, no SQLAlchemy)

### Domain Events (`events.py`)

The event system follows the Observer pattern with an in-memory bus:

- `DomainEvent` — base class with `event_id`, `occurred_at`, and `event_type`
- `IEventBus` — abstract interface with `publish()` and `subscribe()` methods
- `SyncEventBus` — in-memory implementation (singleton)

**Adding a new event type:**
```python
@dataclass
class SubjectCreatedEvent(DomainEvent):
    subject_id: UUID
    subject_name: str
    semester_id: UUID
```

**Adding a new event listener:**
```python
class ProgressTrackerListener:
    async def handle(self, event: TaskCompletedEvent) -> None:
        # React to the event
        ...

# Registration (in module bootstrap or main.py):
event_bus.subscribe(TaskCompletedEvent, progress_listener.handle)
```

### Exception Hierarchy (`exceptions.py`)

Follows the `error_hierarchy.puml` specification with HTTP status code mappings:

```
BaseAppException
├── DomainException (entity_id)
│   ├── ScheduleConflictException → HTTP 409
│   ├── InvalidEntityStateException → HTTP 422
│   ├── EntityNotFoundException → HTTP 404
│   └── ValidationException → HTTP 400
└── InfrastructureException (service_name)
    ├── ExternalServiceTimeout → HTTP 503
    └── DatabaseConnectionError → HTTP 503
```

**Adding a new exception:**
1. Inherit from `DomainException` or `InfrastructureException`
2. Add the HTTP mapping in `get_http_status_code()`
3. Override `to_dict()` if additional context is needed in the JSON response

## Infrastructure Layer (`shared/infrastructure/`)

### Database (`database.py`)

Provides the async SQLAlchemy engine and session factory:
- `get_async_engine()` — creates or returns the singleton engine
- `get_async_session()` — async generator for dependency injection
- `AsyncSessionLocal` — session factory

Feature modules use `get_async_session` via FastAPI `Depends()`.

**Important:** Never add module-specific database logic here. This layer only provides the connection infrastructure.

## When to Modify the Shared Kernel

The shared kernel should change **rarely** and **carefully** because every module depends on it:

- **Add** a new base class or value object when 2+ modules need the same abstraction
- **Add** a new exception type when a new error category emerges from the domain
- **Add** a new event type when a domain event needs cross-module communication
- **Do not** put module-specific logic here — put it in the module's own domain layer

## Related Skills

- **backend-hexagonal-module**: For implementing feature modules that use these shared abstractions
- **backend-cross-cutting**: For the global exception handler that maps these exceptions to HTTP responses
- **defensive_programming**: For designing robust exception hierarchies and value object validation
