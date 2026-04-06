# Estrategia de Manejo de Errores

Este documento describe la jerarquía de excepciones del backend, el formato canónico de respuesta de error de la API y la estrategia de manejo de errores en el frontend.

---

## Jerarquía de Excepciones (Backend)

Todas las excepciones personalizadas heredan de `BaseAppException` definida en `backend/app/shared/domain/exceptions.py`.

```
BaseAppException (abstracta)
├── DomainException                    → errores de lógica de negocio
│   ├── ScheduleConflictException      → HTTP 409
│   ├── InvalidEntityStateException    → HTTP 422
│   ├── EntityNotFoundException        → HTTP 404
│   └── ValidationException            → HTTP 400
└── InfrastructureException            → errores de sistemas externos
    ├── ExternalServiceTimeout         → HTTP 503
    ├── DatabaseConnectionError        → HTTP 503
    └── GoogleCalendarException        → HTTP 502
```

### Tabla de Mapeo HTTP

| Clase de excepción | HTTP | Código de error canónico |
| :--- | :--- | :--- |
| `ScheduleConflictException` | 409 | `SCHEDULE_CONFLICT` |
| `InvalidEntityStateException` | 422 | `INVALID_ENTITY_STATE` |
| `EntityNotFoundException` | 404 | `{ENTITY_TYPE}_NOT_FOUND` |
| `ValidationException` | 400 | `VALIDATION_ERROR` |
| `ExternalServiceTimeout` | 503 | `EXTERNAL_SERVICE_TIMEOUT` |
| `DatabaseConnectionError` | 503 | `DATABASE_CONNECTION_ERROR` |
| `GoogleCalendarException` | 502 | `GOOGLE_CALENDAR_ERROR` |
| Excepción no manejada | 500 | `INTERNAL_SERVER_ERROR` |

El mapeo es gestionado por `get_http_status_code()` en `exceptions.py` y aplicado por los handlers registrados en `exception_handler.py`.

---

## Formato Canónico de Respuesta de Error

Todos los errores de la API retornan la misma estructura JSON, enriquecida con un `request_id` y un `timestamp` por el handler global de FastAPI (`exception_handler.py`):

```json
{
  "error": "ERROR_CODE",
  "message": "Descripción legible del error",
  "request_id": "3f7a1b2c-4d5e-6f7a-8b9c-0d1e2f3a4b5c",
  "timestamp": "2026-04-06T14:30:00.000000+00:00"
}
```

### Campos adicionales por tipo de excepción

**ValidationException** — incluye `details` con los errores por campo:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed for request body",
  "details": {
    "email": ["value is not a valid email address"],
    "password": ["String should have at least 8 characters"]
  },
  "request_id": "...",
  "timestamp": "..."
}
```

**ScheduleConflictException** — incluye `conflicts` y `resolution_options`:
```json
{
  "error": "SCHEDULE_CONFLICT",
  "message": "Schedule conflicts detected with existing subjects",
  "conflicts": [
    {
      "subject_name": "Física I",
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "10:00"
    }
  ],
  "resolution_options": [
    "Modify the start/end times of the new subject",
    "Modify the start/end times of the conflicting subject",
    "Cancel this operation"
  ],
  "request_id": "...",
  "timestamp": "..."
}
```

**EntityNotFoundException** — incluye `entity_id` cuando está disponible:
```json
{
  "error": "PROFESSOR_NOT_FOUND",
  "message": "Professor with id aa0e8400-... not found",
  "entity_id": "aa0e8400-e29b-41d4-a716-446655440001",
  "request_id": "...",
  "timestamp": "..."
}
```

**InfrastructureException** — incluye `service`:
```json
{
  "error": "EXTERNAL_SERVICE_TIMEOUT",
  "message": "Service 'google_calendar' is temporarily unavailable",
  "service": "google_calendar",
  "request_id": "...",
  "timestamp": "..."
}
```

---

## Handlers Globales Registrados

`backend/app/cross_cutting/exception_handler.py` registra tres handlers en FastAPI:

| Handler | Captura | Comportamiento |
| :--- | :--- | :--- |
| `app_exception_handler` | `BaseAppException` | Llama a `exception.to_dict()`, agrega `request_id` y `timestamp`, retorna el código HTTP mapeado |
| `pydantic_validation_handler` | `PydanticValidationError` | Transforma los errores de Pydantic al formato `VALIDATION_ERROR` con `details` |
| `unhandled_exception_handler` | `Exception` (catch-all) | Loguea el error completo, retorna HTTP 500 con mensaje genérico |

---

## Manejo de Errores en el Frontend

El cliente HTTP centralizado (`src/lib/api-client.ts`) intercepta todos los errores antes de que lleguen a los componentes.

| Código HTTP | Comportamiento |
| :--- | :--- |
| `401` | Intenta renovar el token (`POST /auth/refresh`). Si falla, limpia `localStorage` y redirige a `/login`. |
| `409 SCHEDULE_CONFLICT` | El componente `ClassFormModal` accede al campo `conflicts` del error para mostrar los detalles del conflicto en el modal. |
| `400` / `422` | El campo `details` se mapea a mensajes de error inline debajo de cada campo del formulario correspondiente. |
| `404` | El componente muestra un estado vacío o un mensaje de "recurso no encontrado". |
| `5XX` | Se muestra un toast de error genérico vía `ToastContext` con el mensaje del campo `message`. |

---

## Patrón Prescriptivo para Contribuidores

### Correcto: usar la jerarquía de excepciones del dominio

```python
# En un use case o servicio de dominio
from app.shared.domain.exceptions import EntityNotFoundException, ValidationException

# Para recurso no encontrado:
raise EntityNotFoundException(
    code="PROFESSOR_NOT_FOUND",
    message=f"Professor with id {professor_id} not found",
    entity_type="Professor",
    entity_id=professor_id,
)

# Para validación fallida:
raise ValidationException(
    code="VALIDATION_ERROR",
    message="Invalid date range",
    details={"end_date": ["end_date must be greater than start_date"]},
)
```

### Incorrecto: crear excepciones ad-hoc o usar HTTPException en el dominio

```python
# NO hacer esto en use cases o entidades de dominio:
raise Exception("Professor not found")

# NO hacer esto fuera de la capa adapter/router:
from fastapi import HTTPException
raise HTTPException(status_code=404, detail="Not found")
```

Las `HTTPException` de FastAPI solo son aceptables en la capa `adapter/router.py` para casos excepcionales no cubiertos por la jerarquía de dominio. En la práctica, el handler global convierte automáticamente las excepciones de dominio al código HTTP correcto, por lo que raramente se necesita `HTTPException` directamente.
