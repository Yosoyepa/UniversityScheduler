---
name: backend-cross-cutting
description: Guide for adding or modifying global middleware, authentication, and application-wide exception handlers in the UniversityScheduler backend. Use this skill whenever working with backend/app/cross_cutting/, including JWT authentication middleware, global exception handlers, CORS configuration, logging middleware, request ID tracking, or any other concern that cuts across all modules. Also use when the user mentions middleware, global error handling, auth guards, request interceptors, or cross-cutting concerns.
---

# Backend Cross-Cutting Concerns

This skill defines how to work with the cross-cutting layer in `backend/app/cross_cutting/`. This layer contains application-wide concerns that span all feature modules.

## Directory Structure

```
backend/app/cross_cutting/
├── __init__.py           # Exports registration functions
├── auth_middleware.py    # JWT authentication via FastAPI Depends
└── exception_handler.py  # Global exception → HTTP response mapping
```

## What Belongs Here

Cross-cutting concerns are behaviors that apply **across all modules** rather than belonging to a specific feature. Examples:

- **Authentication/Authorization**: JWT validation, `get_current_user` dependency
- **Exception Handling**: Global `BaseAppException` → JSON response mapping
- **Logging**: Request/response logging middleware
- **CORS**: Cross-Origin Resource Sharing configuration
- **Request Tracking**: Request ID generation and propagation
- **Rate Limiting**: Global rate limiting middleware

## What Does NOT Belong Here

- Module-specific validation → goes in `modules/<name>/application/schemas.py`
- Business logic → goes in `modules/<name>/domain/`
- Database access → goes in `modules/<name>/adapter/` or `shared/infrastructure/`

## Existing Components

### Authentication Middleware (`auth_middleware.py`)

Provides JWT-based authentication via FastAPI's dependency injection:

```python
from app.cross_cutting.auth_middleware import get_current_user

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    ...
```

Key design decisions:
- Uses `FastAPI Depends()` pattern, not ASGI middleware
- Returns a domain `User` entity, not a raw token payload
- Raises `HTTPException(401)` for invalid/missing tokens
- Token service lives in `modules/users/infrastructure/token_service.py` (not here)

### Exception Handler (`exception_handler.py`)

Maps domain/infrastructure exceptions to consistent JSON responses:

| Exception | HTTP Status |
|-----------|------------|
| `ScheduleConflictException` | 409 Conflict |
| `EntityNotFoundException` | 404 Not Found |
| `ValidationException` | 400 Bad Request |
| `InvalidEntityStateException` | 422 Unprocessable Entity |
| `ExternalServiceTimeout` | 503 Service Unavailable |
| `DatabaseConnectionError` | 503 Service Unavailable |
| `PydanticValidationError` | 400 Bad Request |
| Unhandled `Exception` | 500 Internal Server Error |

Registered in `main.py` via:
```python
from app.cross_cutting.exception_handler import register_exception_handlers
register_exception_handlers(app)
```

## Adding a New Cross-Cutting Concern

Follow this pattern:

1. **Create a new file** in `cross_cutting/` (e.g., `logging_middleware.py`)
2. **Implement** as either:
   - **FastAPI Depends**: For per-request concerns (auth, rate limiting)
   - **ASGI Middleware**: For transparent request/response processing (logging, CORS)
   - **Registration function**: For things registered on the app instance (exception handlers)
3. **Export** a registration function (e.g., `register_logging_middleware(app)`)
4. **Register** in `main.py` alongside existing registrations
5. **Update** `__init__.py` exports

**Example — Adding request logging middleware:**

```python
# cross_cutting/logging_middleware.py
import time
from starlette.middleware.base import BaseHTTPMiddleware

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - start
        print(f"{request.method} {request.url.path} → {response.status_code} ({duration:.3f}s)")
        return response

def register_logging_middleware(app):
    app.add_middleware(RequestLoggingMiddleware)
```

## Import Rules

This layer can import:
- `app.shared.domain.exceptions` — for exception type references
- `app.shared.infrastructure` — for database sessions if needed
- `app.modules.*.domain.entities` — only for type hints (e.g., `User` in auth)
- `app.modules.*.infrastructure` — for service instantiation (e.g., `TokenService`)

This layer should **not** import:
- Module-specific use cases or application logic
- Module-specific repository interfaces or implementations

## Registration Pattern

All cross-cutting concerns are wired in `main.py`:

```python
# main.py
from app.cross_cutting.exception_handler import register_exception_handlers
from app.cross_cutting import auth_middleware  # used via Depends in routers

app = FastAPI()
register_exception_handlers(app)
# register_logging_middleware(app)  # future
# app.add_middleware(CORSMiddleware, ...)  # future
```

## Related Skills

- **backend-shared-kernel**: For the exception hierarchy that exception_handler.py maps
- **backend-hexagonal-module**: For understanding how module routers use `get_current_user`
- **defensive_programming**: For input validation and fail-fast error handling
