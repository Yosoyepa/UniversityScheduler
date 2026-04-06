# API — Módulo de Profesores y Tutorías

Este módulo gestiona el directorio privado de profesores de cada usuario, sus horas de oficina y el ciclo de vida de las sesiones de tutoría.

Todos los endpoints requieren autenticación JWT. Los datos son privados por usuario: cada estudiante tiene su propio directorio.

**Prefijo base**: `/api/v1`

---

## Tabla de Endpoints

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/professors` | Agrega un profesor al directorio del usuario |
| `GET` | `/professors` | Lista el directorio de profesores |
| `GET` | `/professors/{id}` | Obtiene detalle de un profesor con sus horas de oficina |
| `PATCH` | `/professors/{id}` | Actualiza datos del profesor |
| `DELETE` | `/professors/{id}` | Elimina el profesor del directorio |
| `POST` | `/professors/{id}/office-hours` | Agrega un bloque de hora de oficina recurrente |
| `DELETE` | `/professors/{id}/office-hours/{oh_id}` | Elimina un bloque de hora de oficina |
| `POST` | `/tutoring` | Reserva una sesión de tutoría (estado inicial: SCHEDULED) |
| `GET` | `/tutoring` | Lista las sesiones de tutoría del usuario |
| `PATCH` | `/tutoring/{id}/cancel` | Cancela una sesión de tutoría |
| `PATCH` | `/tutoring/{id}/complete` | Marca una sesión de tutoría como completada |

---

## Schemas de Referencia

### ProfessorResponse

```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Dra. María Rodríguez",
  "email": "m.rodriguez@universidad.edu",
  "department": "Ingeniería de Sistemas",
  "office_hours": [
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440001",
      "professor_id": "aa0e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 2,
      "start_time": "14:00:00",
      "end_time": "16:00:00",
      "location_type": "OFFICE",
      "location_details": "Bloque B, Oficina 201"
    }
  ],
  "is_available_now": false,
  "created_at": "2026-03-01T09:00:00Z",
  "updated_at": "2026-03-01T09:00:00Z"
}
```

### TutoringSessionResponse

```json
{
  "id": "ee0e8400-e29b-41d4-a716-446655440001",
  "professor_id": "aa0e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2026-04-10",
  "start_time": "14:00:00",
  "end_time": "15:00:00",
  "notes": "Revisión de proyecto final",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "status": "SCHEDULED",
  "created_at": "2026-04-06T10:00:00Z",
  "updated_at": "2026-04-06T10:00:00Z"
}
```

### Estados de TutoringSession

```
SCHEDULED ──────────────────► COMPLETED
    │
    └──────────────────────► CANCELLED
```

| Estado | Descripción |
| :--- | :--- |
| `SCHEDULED` | Estado inicial al crear la sesión. La sesión está agendada. |
| `COMPLETED` | La sesión se llevó a cabo. Solo desde `SCHEDULED`. |
| `CANCELLED` | La sesión fue cancelada. Solo desde `SCHEDULED`. |

### LocationType (tipos de ubicación para horas de oficina)

| Valor | Descripción |
| :--- | :--- |
| `OFFICE` | Oficina física del profesor |
| `LAB` | Laboratorio |
| `VIRTUAL` | Reunión virtual (Zoom, Meet, etc.) |

---

## Endpoints de Profesores

### POST `/api/v1/professors`

Agrega un profesor al directorio privado del usuario. Opcionalmente se pueden incluir las horas de oficina en la creación.

**Request**:
```json
{
  "name": "Dra. María Rodríguez",
  "email": "m.rodriguez@universidad.edu",
  "department": "Ingeniería de Sistemas",
  "office_hours": [
    {
      "day_of_week": 2,
      "start_time": "14:00",
      "end_time": "16:00",
      "location_type": "OFFICE",
      "location_details": "Bloque B, Oficina 201"
    }
  ]
}
```

**Campos**:
- `name` (string, obligatorio): Nombre completo del profesor.
- `email` (string, opcional): Correo electrónico de contacto.
- `department` (string, opcional): Departamento o facultad.
- `office_hours` (array, opcional): Lista de bloques de hora de oficina recurrentes.
  - `day_of_week` (int, 1-7, obligatorio): Día ISO 8601 (1=Lunes, 7=Domingo).
  - `start_time` (string HH:MM, obligatorio): Inicio del bloque.
  - `end_time` (string HH:MM, obligatorio): Fin del bloque. Debe ser posterior al inicio.
  - `location_type` (enum, obligatorio): `OFFICE`, `LAB` o `VIRTUAL`.
  - `location_details` (string, opcional): Descripción del lugar o enlace virtual.

**Response 201 Created**: `ProfessorResponse` (ver schema de referencia).

**Errores posibles**: `400 VALIDATION_ERROR` (nombre vacío, horarios inválidos).

---

### GET `/api/v1/professors`

Retorna la lista de profesores en el directorio del usuario autenticado, incluyendo sus horas de oficina y el campo calculado `is_available_now`.

**Response 200 OK**: Array de `ProfessorResponse`.

```json
[
  {
    "id": "aa0e8400-e29b-41d4-a716-446655440001",
    "name": "Dra. María Rodríguez",
    "email": "m.rodriguez@universidad.edu",
    "department": "Ingeniería de Sistemas",
    "office_hours": [...],
    "is_available_now": true,
    "created_at": "2026-03-01T09:00:00Z",
    "updated_at": "2026-03-01T09:00:00Z"
  }
]
```

---

### GET `/api/v1/professors/{professor_id}`

Retorna el detalle completo de un profesor, incluyendo todas sus horas de oficina.

**Path Parameters**: `professor_id` (UUID).

**Response 200 OK**: `ProfessorResponse`.

**Errores posibles**: `404 PROFESSOR_NOT_FOUND`, `403 FORBIDDEN` (el profesor no pertenece al usuario).

---

### PATCH `/api/v1/professors/{professor_id}`

Actualiza los datos básicos del profesor. Semántica PATCH: solo los campos enviados se modifican.

**Path Parameters**: `professor_id` (UUID).

**Request**:
```json
{
  "name": "Dra. María Rodríguez Gómez",
  "email": "mrodriguez@universidad.edu",
  "department": "Ingeniería de Sistemas y Computación"
}
```

Todos los campos son opcionales. Campos no enviados no se modifican.

**Response 200 OK**: `ProfessorResponse` actualizado.

**Errores posibles**: `404 PROFESSOR_NOT_FOUND`, `400 VALIDATION_ERROR`.

---

### DELETE `/api/v1/professors/{professor_id}`

Elimina el profesor del directorio del usuario. Esta operación también elimina en cascada todas las horas de oficina y sesiones de tutoría asociadas.

**Path Parameters**: `professor_id` (UUID).

**Response 204 No Content**.

**Errores posibles**: `404 PROFESSOR_NOT_FOUND`, `403 FORBIDDEN`.

---

## Endpoints de Horas de Oficina

### POST `/api/v1/professors/{professor_id}/office-hours`

Agrega un nuevo bloque de hora de oficina recurrente al horario del profesor.

**Path Parameters**: `professor_id` (UUID).

**Request**:
```json
{
  "day_of_week": 4,
  "start_time": "10:00",
  "end_time": "12:00",
  "location_type": "VIRTUAL",
  "location_details": "https://meet.google.com/abc-defg-hij"
}
```

**Response 201 Created**:
```json
{
  "id": "bb0e8400-e29b-41d4-a716-446655440002",
  "professor_id": "aa0e8400-e29b-41d4-a716-446655440001",
  "day_of_week": 4,
  "start_time": "10:00:00",
  "end_time": "12:00:00",
  "location_type": "VIRTUAL",
  "location_details": "https://meet.google.com/abc-defg-hij"
}
```

**Errores posibles**: `404 PROFESSOR_NOT_FOUND`, `400 VALIDATION_ERROR` (end_time antes de start_time).

---

### DELETE `/api/v1/professors/{professor_id}/office-hours/{office_hour_id}`

Elimina un bloque de hora de oficina específico del profesor.

**Path Parameters**: `professor_id` (UUID), `office_hour_id` (UUID).

**Response 204 No Content**.

**Errores posibles**: `404 PROFESSOR_NOT_FOUND` o `404 OFFICE_HOUR_NOT_FOUND`, `403 FORBIDDEN`.

---

## Endpoints de Sesiones de Tutoría

### POST `/api/v1/tutoring`

Reserva una sesión de tutoría. La sesión se crea con estado `SCHEDULED`.

**Request**:
```json
{
  "professor_id": "aa0e8400-e29b-41d4-a716-446655440001",
  "date": "2026-04-10",
  "start_time": "14:00",
  "end_time": "15:00",
  "notes": "Revisión de proyecto final — capítulo 3",
  "meeting_link": "https://meet.google.com/abc-defg-hij"
}
```

**Campos**:
- `professor_id` (UUID, obligatorio): Identificador del profesor en el directorio del usuario.
- `date` (string YYYY-MM-DD, obligatorio): Fecha de la sesión.
- `start_time` (string HH:MM, obligatorio): Hora de inicio.
- `end_time` (string HH:MM, obligatorio): Hora de fin. Debe ser posterior al inicio.
- `notes` (string, opcional): Notas o agenda para la sesión.
- `meeting_link` (string, opcional): Enlace a la reunión virtual.

**Response 201 Created**: `TutoringSessionResponse` con `status: "SCHEDULED"`.

**Errores posibles**: `404 PROFESSOR_NOT_FOUND`, `400 VALIDATION_ERROR` (horario inválido).

---

### GET `/api/v1/tutoring`

Lista todas las sesiones de tutoría del usuario autenticado, ordenadas por fecha descendente.

**Response 200 OK**: Array de `TutoringSessionResponse`.

```json
[
  {
    "id": "ee0e8400-e29b-41d4-a716-446655440001",
    "professor_id": "aa0e8400-e29b-41d4-a716-446655440001",
    "date": "2026-04-10",
    "start_time": "14:00:00",
    "end_time": "15:00:00",
    "notes": "Revisión de proyecto final",
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "status": "SCHEDULED",
    "created_at": "2026-04-06T10:00:00Z",
    "updated_at": "2026-04-06T10:00:00Z"
  }
]
```

---

### PATCH `/api/v1/tutoring/{session_id}/cancel`

Cancela una sesión de tutoría. Solo es válido si el estado actual es `SCHEDULED`.

**Path Parameters**: `session_id` (UUID).

**Response 200 OK**: `TutoringSessionResponse` con `status: "CANCELLED"`.

**Errores posibles**: `404 SESSION_NOT_FOUND`, `400 VALIDATION_ERROR` (la sesión no está en estado SCHEDULED).

---

### PATCH `/api/v1/tutoring/{session_id}/complete`

Marca una sesión de tutoría como completada. Solo es válido si el estado actual es `SCHEDULED`.

**Path Parameters**: `session_id` (UUID).

**Response 200 OK**: `TutoringSessionResponse` con `status: "COMPLETED"`.

**Errores posibles**: `404 SESSION_NOT_FOUND`, `400 VALIDATION_ERROR` (la sesión no está en estado SCHEDULED).

---

## Notas

- El campo `is_available_now` en `ProfessorResponse` se calcula dinámicamente comparando la hora actual del servidor con los bloques de `office_hours` del día actual.
- El directorio de profesores es privado por usuario: un profesor registrado por el usuario A no es visible para el usuario B.
- La eliminación de un profesor es irreversible y elimina en cascada todas sus horas de oficina y sesiones de tutoría.
