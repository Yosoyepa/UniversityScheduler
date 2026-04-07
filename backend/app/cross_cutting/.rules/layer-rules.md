# Layer Rules: `backend/app/cross_cutting/`

## Required Skills

Before making any changes in this directory, consult these skills:

### Primary: `backend-cross-cutting`
**Always use** when working with `backend/app/cross_cutting/`, including JWT authentication, global exception handlers, CORS, logging middleware, request ID tracking, or any concern that spans all modules.

This skill enforces:
- Registration pattern (each concern provides a `register_*()` function for `main.py`)
- FastAPI `Depends()` for per-request concerns (auth)
- ASGI/Starlette middleware for transparent processing (logging, CORS)
- Consistent JSON error response format

### When to Also Use:

| Scenario | Additional Skill |
|----------|-----------------|
| Adding a new exception type that needs HTTP mapping | `backend-shared-kernel` |
| Understanding how module routers use `get_current_user` | `backend-hexagonal-module` |
| Input validation and fail-fast error patterns | `defensive_programming` |

## Critical Rules

1. **No business logic** — only application-wide infrastructure concerns
2. **No module-specific validation** — that goes in `modules/<name>/application/schemas.py`
3. **Follow the registration pattern** — every new concern needs a `register_*()` function
4. **All registrations happen in `main.py`** — single point of wiring
5. **Can import shared exceptions** — for the exception handler mapping
6. **Can import module entities for type hints** — e.g., `User` in auth middleware
7. **Event Pub/Sub Lifespan Registration** — Event listeners subscriptions (e.g. `NotificationListener` to `TaskCompletedEvent`) MUST be registered fundamentally in the FastAPI Lifespan initialization process. They must not be injected in hidden internal states.
