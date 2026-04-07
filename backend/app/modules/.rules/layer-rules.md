# Layer Rules: `backend/app/modules/`

## Required Skills

Before making any changes in this directory, consult these skills:

### Primary: `backend-hexagonal-module`
**Always use** when creating, modifying, or extending any module inside `backend/app/modules/`.

This skill enforces:
- Hexagonal Architecture layer separation (domain → port → application → adapter → infrastructure)
- Inward-only dependency rule
- Proper entity, use case, repository, and router patterns
- Import boundary enforcement

### When to Also Use:

| Scenario | Additional Skill |
|----------|-----------------|
| Adding new exceptions or value objects used across modules | `backend-shared-kernel` |
| Adding domain events or modifying the event bus | `backend-shared-kernel` |
| Adding authentication to routes | `backend-cross-cutting` |
| Adding global error handling | `backend-cross-cutting` |
| Applying SOLID principles to use cases | `solid_principles` |
| Writing testable code with mocks | `testable_code` |
| Input validation and fail-fast patterns | `defensive_programming` |

## Directory Convention

Each module follows this structure:
```
modules/<module_name>/
├── __init__.py
├── domain/          # Pure entities, value objects, domain services
├── port/            # ABC interfaces (repository contracts)
├── application/     # Use cases, DTOs/schemas
├── adapter/         # FastAPI routers, PostgreSQL repository implementations
└── infrastructure/  # ORM models, external service clients
```

## Critical Rules

1. **Never** import from `adapter/` or `infrastructure/` in `domain/` or `port/`
2. **Always** create `__init__.py` in every subdirectory
3. **Always** register new routers in `main.py`
4. **Always** use async methods in repository interfaces
5. **Larman Use Cases Specification** — All use cases MUST comply with the Larman structural format described in `docs/architecture/06_use_cases.md` (e.g., strict decoupling of payload parsing logic vs. pure business invariants).
6. **Alembic ORM Migrations** — Adapter/infrastructure DB model modifications MUST be followed by `alembic revision --autogenerate` and `alembic upgrade head`. Never modify SQL schema directly.
7. **Strict DTO Mapping** — FastAPI Routers must communicate using exclusively Pydantic objects (`*Request` / `*Response`). The application use cases map these directly to Domain `Entity` instances.
