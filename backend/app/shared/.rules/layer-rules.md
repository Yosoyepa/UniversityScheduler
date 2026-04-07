# Layer Rules: `backend/app/shared/`

## Required Skills

Before making any changes in this directory, consult these skills:

### Primary: `backend-shared-kernel`
**Always use** when working with `backend/app/shared/`, including base entities, value objects, domain events, the event bus, domain exceptions, or shared infrastructure.

This skill enforces:
- Minimal, stable abstractions that all modules depend on
- Framework-free domain layer (no FastAPI, no SQLAlchemy in `shared/domain/`)
- Proper exception hierarchy with HTTP status code mappings
- Event bus patterns (DomainEvent, IEventBus, SyncEventBus)
- Value object immutability and validation

### When to Also Use:

| Scenario | Additional Skill |
|----------|-----------------|
| Adding HTTP mapping for a new exception | `backend-cross-cutting` |
| Understanding how modules consume shared abstractions | `backend-hexagonal-module` |
| Designing robust validation in value objects | `defensive_programming` |
| Applying DIP via event bus interfaces | `solid_principles` |

## Critical Rules

1. **Change rarely** — every module depends on this code
2. **No module-specific logic** — if it's only used by one module, put it in that module
3. **Domain layer is framework-free** — no FastAPI, no SQLAlchemy, no Pydantic
4. **Value objects must be immutable** — use frozen dataclass or equivalent
5. **Test thoroughly** — changes here ripple across the entire application
6. **Cross-Module Choreography** — Modules must NEVER orchestrate callbacks sequentially if they don't belong to the same subdomain. They MUST emit an event via `SyncEventBus` inside `shared/domain/events` to ensure maximum decoupling.
