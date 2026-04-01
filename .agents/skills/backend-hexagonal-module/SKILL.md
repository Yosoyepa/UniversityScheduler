---
name: backend-hexagonal-module
description: Guide for implementing backend feature modules using Hexagonal Architecture in the UniversityScheduler FastAPI project. Use this skill whenever creating, modifying, or extending any module inside backend/app/modules, including adding new entities, use cases, repositories, routers, or domain services. Also use when the user mentions domain layer, ports, adapters, application layer, use cases, repository interfaces, or any backend feature development for this project.
---

# Backend Hexagonal Module

This skill defines how to implement feature modules inside `backend/app/modules/` following the Hexagonal Architecture pattern established in this project.

## Architecture Overview

Each module under `backend/app/modules/<module_name>/` is a self-contained feature with strict layer separation. The dependency rule is **inward only**: outer layers depend on inner layers, never the reverse.

```
adapter/        ← HTTP routers (FastAPI), external API clients
  ├── router.py
  └── postgres_repository.py
application/    ← Use cases (orchestration), DTOs/schemas
  ├── use_cases.py
  └── schemas.py
domain/         ← Pure entities, value objects, domain services
  ├── entities.py
  └── services.py (optional)
port/           ← Abstract interfaces (ABC) for repositories
  └── repository.py
infrastructure/ ← Framework-specific implementations (ORM models, external services)
  ├── models.py
  └── token_service.py (example)
```

## Layer Rules

### 1. Domain Layer (`domain/`)

The innermost layer. It has **zero external dependencies** — no FastAPI, no SQLAlchemy, no third-party libraries.

- **Entities** inherit from `app.shared.domain.entities.Entity` (provides `id: UUID`, `created_at`, `updated_at`, `touch()`)
- Use `@dataclass` for entities
- Put business invariants in `__post_init__`
- Domain methods mutate state and call `self.touch()` to update timestamps
- Use Value Objects from `app.shared.domain.value_objects` (e.g., `Email`)
- Raise exceptions from `app.shared.domain.exceptions` (e.g., `InvalidEntityStateException`)
- Domain events: create event classes that inherit from `app.shared.domain.events.DomainEvent`

**Example pattern** (from existing `User` entity):
```python
from dataclasses import dataclass, field
from app.shared.domain.entities import Entity
from app.shared.domain.value_objects import Email

@dataclass
class Subject(Entity):
    name: str = ""
    professor_name: str = ""
    semester_id: UUID = None

    def __post_init__(self):
        if not self.name:
            raise ValueError("Subject must have a name")
```

### 2. Port Layer (`port/`)

Defines abstract interfaces (contracts) that the domain needs from the outside world.

- Use `ABC` + `@abstractmethod`
- All methods are `async`
- Import **only** domain types (entities, value objects)
- Name interfaces with `I` prefix: `ISubjectRepository`, `ISemesterRepository`

**Example pattern** (from existing `IUserRepository`):
```python
from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID

class ISubjectRepository(ABC):
    @abstractmethod
    async def find_by_id(self, subject_id: UUID) -> Optional[Subject]:
        pass

    @abstractmethod
    async def save(self, subject: Subject) -> Subject:
        pass
```

### 3. Application Layer (`application/`)

Orchestrates domain logic. Contains use cases and Pydantic schemas (DTOs).

- Use cases receive port interfaces via constructor injection
- Each use case has a single `execute()` method
- Use cases coordinate: validate input → call domain → call repository → emit events
- DTOs/Schemas use Pydantic `BaseModel`
- Import domain entities and port interfaces — never import infrastructure directly

**Example pattern:**
```python
class CreateSubjectUseCase:
    def __init__(self, repo: ISubjectRepository, event_bus: IEventBus):
        self._repo = repo
        self._event_bus = event_bus

    async def execute(self, dto: CreateSubjectRequest) -> SubjectResponse:
        subject = Subject(name=dto.name, ...)
        saved = await self._repo.save(subject)
        await self._event_bus.publish(SubjectCreatedEvent(subject_id=saved.id))
        return SubjectResponse.from_entity(saved)
```

### 4. Adapter Layer (`adapter/`)

Connects the outside world to the application. Contains FastAPI routers and repository implementations.

- **Routers** (`router.py`): Define HTTP endpoints, use `Depends()` for dependency injection, delegate to use cases
- **Repository implementations** (`postgres_repository.py`): Implement port interfaces using SQLAlchemy
- Routers prefix with `/api/v1/<module_name>`
- Use `get_current_user` dependency from `app.cross_cutting.auth_middleware` for protected routes

### 5. Infrastructure Layer (`infrastructure/`)

Framework-specific technical implementations.

- **ORM Models** (`models.py`): SQLAlchemy `DeclarativeBase` models with table mappings
- **External services**: Token services, password hashers, email senders
- Models map 1:1 to domain entities but are separate classes
- Use `mapped_column()` from SQLAlchemy 2.0 style

## Creating a New Module Checklist

When asked to create a new module, follow this order:

1. **Create directory structure**: `modules/<name>/{domain,application,port,adapter,infrastructure}/` with `__init__.py` in each
2. **Domain first**: Write entities with invariants and business methods
3. **Port second**: Define repository interface (ABC)
4. **Infrastructure**: Create SQLAlchemy model
5. **Application**: Write use cases and schemas
6. **Adapter**: Build router and postgres repository
7. **Register**: Include router in `main.py`

## Import Rules (Critical)

| From Layer | Can Import |
|------------|------------|
| `domain/` | `app.shared.domain.*` only |
| `port/` | `domain/` entities |
| `application/` | `domain/`, `port/`, `app.shared.*` |
| `adapter/` | `application/`, `port/`, `domain/`, `app.cross_cutting.*` |
| `infrastructure/` | `domain/` (for mapping), `app.shared.infrastructure.*` |

**Never** import from `adapter/` or `infrastructure/` in `domain/` or `port/`.

## Related Skills

- **backend-shared-kernel**: For shared domain entities, exceptions, value objects, and event bus
- **backend-cross-cutting**: For middleware, authentication, and global exception handlers
- **solid_principles**: Apply SRP in use cases, DIP via port interfaces
- **defensive_programming**: Input validation in domain entities and use cases
- **testable_code**: Use port interfaces for easy mocking in tests
