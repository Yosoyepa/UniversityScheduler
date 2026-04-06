# Referencia de API — UniversityScheduler

## Autenticación

Todos los endpoints (excepto `/api/v1/auth/register`, `/api/v1/auth/login` y `/api/v1/health`) requieren el header `Authorization` con un token JWT válido.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

Para una referencia detallada del módulo de profesores y tutorías, ver [professors.md](professors.md). Para perfil de usuario, configuración y notificaciones, ver [user_profile.md](user_profile.md).

---

## Tabla General de Recursos

| Grupo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Registra una nueva cuenta de usuario |
| | `POST` | `/api/v1/auth/login` | Autentica con email/contraseña y retorna tokens JWT |
| | `POST` | `/api/v1/auth/refresh` | Renueva el access token con el refresh token |
| | `GET` | `/api/v1/auth/me` | Obtiene el perfil del usuario autenticado |
| | `POST` | `/api/v1/auth/logout` | Cierra sesión (descarte de tokens en cliente) |
| **Usuario** | `PUT` | `/api/v1/user/profile` | Actualiza el nombre del usuario |
| | `GET` | `/api/v1/user/settings` | Obtiene las preferencias del usuario |
| | `PATCH` | `/api/v1/user/settings` | Actualiza las preferencias parcialmente |
| | `GET` | `/api/v1/user/notifications` | Lista las notificaciones del usuario |
| | `GET` | `/api/v1/user/notifications/count` | Obtiene el conteo de notificaciones no leídas |
| | `PATCH` | `/api/v1/user/notifications/{id}/read` | Marca una notificación como leída |
| | `PATCH` | `/api/v1/user/notifications/read-all` | Marca todas las notificaciones como leídas |
| **Semestres** | `POST` | `/api/v1/semesters` | Crea nuevo período académico |
| | `GET` | `/api/v1/semesters` | Lista todos los semestres del usuario |
| | `GET` | `/api/v1/semesters/{id}` | Obtiene detalles de un semestre |
| | `PATCH` | `/api/v1/semesters/{id}` | Actualiza semestre |
| | `DELETE` | `/api/v1/semesters/{id}` | Elimina semestre |
| | `POST` | `/api/v1/semesters/{id}/activate` | Activa un semestre como el período actual |
| **Materias** | `POST` | `/api/v1/subjects` | Crea materia con validación de conflictos horarios |
| | `GET` | `/api/v1/subjects` | Lista materias del semestre activo |
| | `GET` | `/api/v1/subjects/{id}` | Obtiene detalles de una materia |
| | `PATCH` | `/api/v1/subjects/{id}` | Actualiza materia |
| | `DELETE` | `/api/v1/subjects/{id}` | Elimina materia (cascade a sesiones) |
| | `GET` | `/api/v1/subjects/{id}/average` | Calcula el promedio ponderado de la materia |
| **Sesiones** | `POST` | `/api/v1/subjects/{id}/class-sessions` | Agrega sesión semanal a materia |
| | `GET` | `/api/v1/class-sessions` | Lista todas las sesiones del semestre activo |
| | `PATCH` | `/api/v1/class-sessions/{id}` | Actualiza sesión |
| | `DELETE` | `/api/v1/class-sessions/{id}` | Elimina sesión |
| **Horario** | `GET` | `/api/v1/schedule` | Retorna el horario semanal completo del semestre activo |
| **Tareas** | `POST` | `/api/v1/tasks` | Crea tarea asociada a materia o libre |
| | `GET` | `/api/v1/tasks` | Lista las tareas del usuario con filtros |
| | `PATCH` | `/api/v1/tasks/{id}` | Actualiza datos de la tarea |
| | `PATCH` | `/api/v1/tasks/{id}/status` | Transiciona el estado de la tarea |
| | `DELETE` | `/api/v1/tasks/{id}` | Elimina tarea |
| **Calificaciones** | `POST` | `/api/v1/evaluation-criteria` | Crea criterio de evaluación con peso |
| | `GET` | `/api/v1/evaluation-criteria` | Lista criterios de una materia |
| | `PATCH` | `/api/v1/evaluation-criteria/{id}` | Actualiza criterio |
| | `DELETE` | `/api/v1/evaluation-criteria/{id}` | Elimina criterio |
| | `POST` | `/api/v1/grades` | Registra una calificación |
| | `GET` | `/api/v1/grades` | Lista las calificaciones del usuario |
| | `PATCH` | `/api/v1/grades/{id}` | Actualiza calificación |
| | `DELETE` | `/api/v1/grades/{id}` | Elimina calificación |
| **Profesores** | `POST` | `/api/v1/professors` | Agrega profesor al directorio del usuario |
| | `GET` | `/api/v1/professors` | Lista el directorio de profesores |
| | `GET` | `/api/v1/professors/{id}` | Detalle de un profesor |
| | `PATCH` | `/api/v1/professors/{id}` | Actualiza datos del profesor |
| | `DELETE` | `/api/v1/professors/{id}` | Elimina profesor del directorio |
| | `POST` | `/api/v1/professors/{id}/office-hours` | Agrega bloque de hora de oficina |
| | `DELETE` | `/api/v1/professors/{id}/office-hours/{oh_id}` | Elimina bloque de hora de oficina |
| **Tutorías** | `POST` | `/api/v1/tutoring` | Reserva una sesión de tutoría |
| | `GET` | `/api/v1/tutoring` | Lista las sesiones de tutoría del usuario |
| | `PATCH` | `/api/v1/tutoring/{id}/cancel` | Cancela una sesión de tutoría |
| | `PATCH` | `/api/v1/tutoring/{id}/complete` | Marca una sesión como completada |
| **Sistema** | `GET` | `/api/v1/health` | Estado del servidor |

---

## Autenticación

### POST `/api/v1/auth/register`

Registra una nueva cuenta de usuario. Retorna tokens JWT listos para usar.

**Request**:
```json
{
  "email": "estudiante@universidad.edu",
  "full_name": "Juan García López",
  "password": "contraseñaSegura123!"
}
```

**Response 201 Created**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "estudiante@universidad.edu",
    "full_name": "Juan García López",
    "is_active": true,
    "created_at": "2026-01-24T12:30:00Z"
  }
}
```

**Errores posibles**: `400 VALIDATION_ERROR` (email inválido, contraseña corta), `409` (email ya registrado).

---

### POST `/api/v1/auth/login`

**Descripción**: Autentica un usuario y retorna token JWT

**Request**:
```json
{
  "email": "estudiante@universidad.edu",
  "password": "securePassword123!"
}
```

**Response 200 OK**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJleHAiOjE2MzUyNDAwMDB9.signature",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "estudiante@universidad.edu",
    "full_name": "Juan García López"
  }
}
```

**Response 401 Unauthorized**:
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```

---

### POST `/api/v1/auth/refresh`

Intercambia un refresh token válido por un nuevo par de tokens (access + refresh).

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200 OK**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errores posibles**: `401 INVALID_TOKEN` (token expirado o inválido).

---

### GET `/api/v1/auth/me`

Retorna el perfil del usuario autenticado por el access token del header.

**Response 200 OK**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "estudiante@universidad.edu",
  "full_name": "Juan García López",
  "is_active": true,
  "created_at": "2026-01-24T12:30:00Z"
}
```

**Errores posibles**: `401 UNAUTHORIZED` (token ausente o inválido).

---

### POST `/api/v1/auth/logout`

Finaliza la sesión. Los tokens JWT son sin estado; el logout real ocurre en el cliente al descartar los tokens. Este endpoint confirma la operación.

**Response 200 OK**:
```json
{
  "message": "Successfully logged out",
  "success": true
}
```

---

## Semestres (Períodos Académicos)

### POST `/api/v1/semesters`

**Descripción**: Crea un nuevo período académico

**Request**:
```json
{
  "name": "2026-1",
  "start_date": "2026-02-01",
  "end_date": "2026-06-30",
  "description": "Primer semestre de 2026"
}
```

**Validaciones**:
- `name`: obligatorio, max 50 caracteres, único por usuario
- `start_date`: obligatorio, formato ISO 8601 (YYYY-MM-DD)
- `end_date`: obligatorio, debe ser > start_date
- `description`: opcional, max 500 caracteres

**Response 201 Created**:
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "2026-1",
  "start_date": "2026-02-01",
  "end_date": "2026-06-30",
  "description": "Primer semestre de 2026",
  "is_active": true,
  "created_at": "2026-01-24T12:30:00Z",
  "updated_at": "2026-01-24T12:30:00Z",
  "subject_count": 0,
  "task_count": 0
}
```

**Response 400 Bad Request**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "end_date": ["end_date must be greater than start_date"],
    "name": ["name already exists for this user"]
  }
}
```

---

### GET `/api/v1/semesters`

**Descripción**: Lista todos los semestres del usuario

**Query Parameters**:
- `include_inactive`: boolean (default: false) - incluir semestres inactivos
- `sort`: string (default: "start_date:desc") - campo para ordenar
- `page`: integer (default: 1)
- `limit`: integer (default: 10, max: 100)

**Example URL**: `/api/v1/semesters?include_inactive=true&sort=start_date:desc&page=1&limit=10`

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "2026-1",
      "start_date": "2026-02-01",
      "end_date": "2026-06-30",
      "description": "Primer semestre de 2026",
      "is_active": true,
      "created_at": "2026-01-24T12:30:00Z",
      "updated_at": "2026-01-24T12:30:00Z",
      "subject_count": 5,
      "task_count": 23
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "2025-2",
      "start_date": "2025-08-01",
      "end_date": "2025-12-15",
      "description": "Segundo semestre de 2025",
      "is_active": false,
      "created_at": "2025-07-10T10:00:00Z",
      "updated_at": "2025-12-15T18:00:00Z",
      "subject_count": 6,
      "task_count": 45
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

---

### PATCH `/api/v1/semesters/{id}`

**Descripción**: Actualiza un semestre existente

**Request**:
```json
{
  "name": "2026-I",
  "is_active": true,
  "description": "Actualizado: Primer semestre"
}
```

**Response 200 OK**:
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "2026-I",
  "start_date": "2026-02-01",
  "end_date": "2026-06-30",
  "description": "Actualizado: Primer semestre",
  "is_active": true,
  "created_at": "2026-01-24T12:30:00Z",
  "updated_at": "2026-01-24T13:45:00Z",
  "subject_count": 5,
  "task_count": 23
}
```

---

## Materias

### POST `/api/v1/subjects`

**Descripción**: Crea una nueva materia con validación automática de conflictos horarios

**Request**:
```json
{
  "semester_id": "650e8400-e29b-41d4-a716-446655440001",
  "name": "Análisis Matemático I",
  "credits": 4,
  "type": "DISCIPLINAR_OBLIGATORIA",
  "professor_name": "Dr. Felipe García",
  "color": "#3498db",
  "difficulty": "MEDIUM",
  "sessions": [
    {
      "day_of_week": 1,
      "start_time": "08:00",
      "end_time": "10:00",
      "location": "Edificio C, Aula 301"
    },
    {
      "day_of_week": 3,
      "start_time": "08:00",
      "end_time": "10:00",
      "location": "Edificio C, Aula 301"
    },
    {
      "day_of_week": 5,
      "start_time": "08:00",
      "end_time": "09:00",
      "location": "Edificio C, Laboratorio L2"
    }
  ]
}
```

**Validaciones**:
- `name`: obligatorio, max 200 caracteres
- `credits`: obligatorio, número entre 0-6
- `type`: obligatorio, enum: DISCIPLINAR_OBLIGATORIA | DISCIPLINAR_OPTATIVA | TEÓRICA | PRÁCTICA | SEMINARIO
- `professor_name`: opcional, max 200 caracteres
- `color`: opcional, formato hex (#rrggbb)
- `difficulty`: opcional, enum: EASY | MEDIUM | HARD
- `sessions[].day_of_week`: obligatorio, número 1-7 (Lunes=1, Domingo=7)
- `sessions[].start_time`: obligatorio, formato HH:MM
- `sessions[].end_time`: obligatorio, formato HH:MM, debe ser > start_time
- `sessions[].location`: opcional, max 255 caracteres

**Response 201 Created**:
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440001",
  "semester_id": "650e8400-e29b-41d4-a716-446655440001",
  "name": "Análisis Matemático I",
  "credits": 4,
  "type": "DISCIPLINAR_OBLIGATORIA",
  "professor_name": "Dr. Felipe García",
  "color": "#3498db",
  "difficulty": "MEDIUM",
  "created_at": "2026-01-24T12:30:00Z",
  "updated_at": "2026-01-24T12:30:00Z",
  "sessions": [
    {
      "id": "850e8400-e29b-41d4-a716-446655440001",
      "subject_id": "750e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 1,
      "day_name": "Monday",
      "start_time": "08:00",
      "end_time": "10:00",
      "location": "Edificio C, Aula 301",
      "duration_minutes": 120
    },
    {
      "id": "850e8400-e29b-41d4-a716-446655440002",
      "subject_id": "750e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 3,
      "day_name": "Wednesday",
      "start_time": "08:00",
      "end_time": "10:00",
      "location": "Edificio C, Aula 301",
      "duration_minutes": 120
    },
    {
      "id": "850e8400-e29b-41d4-a716-446655440003",
      "subject_id": "750e8400-e29b-41d4-a716-446655440001",
      "day_of_week": 5,
      "day_name": "Friday",
      "start_time": "08:00",
      "end_time": "09:00",
      "location": "Edificio C, Laboratorio L2",
      "duration_minutes": 60
    }
  ],
  "weekly_hours": 5,
  "total_hours_semester": 80
}
```

**Response 409 Conflict** (CONFLICTO DE HORARIO):
```json
{
  "error": "SCHEDULE_CONFLICT",
  "message": "Schedule conflicts detected with existing subjects",
  "conflicts": [
    {
      "subject_id": "750e8400-e29b-41d4-a716-446655440002",
      "subject_name": "Cálculo Diferencial",
      "conflicting_sessions": [
        {
          "subject_session_id": "850e8400-e29b-41d4-a716-446655440010",
          "day_of_week": 1,
          "day_name": "Monday",
          "start_time": "08:00",
          "end_time": "10:00",
          "location": "Edificio C, Aula 102",
          "overlap_minutes": 120,
          "conflict_type": "FULL_OVERLAP"
        }
      ]
    }
  ],
  "resolution_options": [
    "Modify the start/end times of the new subject",
    "Modify the start/end times of the conflicting subject",
    "Cancel this operation"
  ]
}
```

**Response 400 Bad Request**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "name": ["required", "max_length:200"],
    "credits": ["required", "between:0:6"],
    "sessions": [
      "At least one session is required",
      "Session 0: start_time must be before end_time"
    ],
    "type": ["invalid_enum_value"]
  }
}
```

---

### GET `/api/v1/subjects`

**Descripción**: Lista materias del semestre activo (o especificado)

**Query Parameters**:
- `semester_id`: UUID (opcional, por defecto el semestre activo)
- `filter`: string (opcional: "HIGH_DIFFICULTY", "BY_PROFESSOR:name")
- `sort`: string (default: "name:asc")

**Example URL**: `/api/v1/subjects?semester_id=650e8400-e29b-41d4-a716-446655440001&sort=name:asc`

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": "750e8400-e29b-41d4-a716-446655440001",
      "semester_id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Análisis Matemático I",
      "credits": 4,
      "type": "DISCIPLINAR_OBLIGATORIA",
      "professor_name": "Dr. Felipe García",
      "color": "#3498db",
      "difficulty": "MEDIUM",
      "weekly_hours": 5,
      "session_count": 3,
      "task_count": 8,
      "created_at": "2026-01-24T12:30:00Z"
    },
    {
      "id": "750e8400-e29b-41d4-a716-446655440002",
      "semester_id": "650e8400-e29b-41d4-a716-446655440001",
      "name": "Física I",
      "credits": 3,
      "type": "DISCIPLINAR_OBLIGATORIA",
      "professor_name": "Dr. Carlos López",
      "color": "#e74c3c",
      "difficulty": "HARD",
      "weekly_hours": 4,
      "session_count": 2,
      "task_count": 12,
      "created_at": "2026-01-20T09:15:00Z"
    }
  ],
  "summary": {
    "total_subjects": 2,
    "total_credits": 7,
    "total_weekly_hours": 9,
    "average_difficulty": "MEDIUM"
  }
}
```

---

### DELETE `/api/v1/subjects/{id}`

**Descripción**: Elimina una materia y todas sus sesiones en cascada

**Response 204 No Content**

**Response 404 Not Found**:
```json
{
  "error": "SUBJECT_NOT_FOUND",
  "message": "Subject with id 750e8400-e29b-41d4-a716-446655440999 not found"
}
```

---

## Tareas

### POST `/api/v1/tasks`

**Descripción**: Crea una nueva tarea, examen o asignación

**Request**:
```json
{
  "title": "Taller de Derivadas",
  "description": "Resolver 15 ejercicios de cálculo de derivadas. Entregar en formato PDF.",
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "category": "ASSIGNMENT",
  "priority": "HIGH",
  "due_date": "2026-02-15T23:59:59Z",
  "estimated_hours": 2.5,
  "tags": ["derivadas", "cálculo", "importante"]
}
```

**Validaciones**:
- `title`: obligatorio, max 255 caracteres
- `description`: opcional, max 2000 caracteres
- `subject_id`: opcional (puede ser tarea libre)
- `category`: obligatorio, enum: ASSIGNMENT | EXAM | PROJECT | STUDY | OTHER
- `priority`: obligatorio, enum: LOW | MEDIUM | HIGH | URGENT
- `due_date`: obligatorio, formato ISO 8601 datetime, debe ser > ahora
- `estimated_hours`: opcional, número > 0
- `tags`: opcional, array de strings (max 5 tags, 30 chars cada uno)

**Response 201 Created**:
```json
{
  "id": "950e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "title": "Taller de Derivadas",
  "description": "Resolver 15 ejercicios de cálculo de derivadas. Entregar en formato PDF.",
  "category": "ASSIGNMENT",
  "priority": "HIGH",
  "status": "TODO",
  "due_date": "2026-02-15T23:59:59Z",
  "estimated_hours": 2.5,
  "actual_hours": null,
  "tags": ["derivadas", "cálculo", "importante"],
  "is_synced_gcal": false,
  "gcal_event_id": null,
  "created_at": "2026-01-24T12:30:00Z",
  "updated_at": "2026-01-24T12:30:00Z",
  "completed_at": null,
  "subject_details": {
    "id": "750e8400-e29b-41d4-a716-446655440001",
    "name": "Análisis Matemático I",
    "color": "#3498db"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "title": ["required"],
    "due_date": ["must be in the future"],
    "priority": ["invalid_enum_value"],
    "tags": ["maximum 5 tags allowed"]
  }
}
```

---

### GET `/api/v1/tasks`

**Descripción**: Lista todas las tareas del usuario con filtros avanzados

**Query Parameters**:
- `status`: string (TODO, IN_PROGRESS, DONE, separated by comma)
- `priority`: string (LOW, MEDIUM, HIGH, URGENT)
- `subject_id`: UUID (filtrar por materia)
- `category`: string (ASSIGNMENT, EXAM, PROJECT, STUDY, OTHER)
- `from_date`: ISO 8601 date
- `to_date`: ISO 8601 date
- `sort`: string (default: "due_date:asc")
- `page`: integer (default: 1)
- `limit`: integer (default: 20, max: 100)

**Example URL**: `/api/v1/tasks?status=TODO&priority=HIGH&sort=due_date:asc&page=1&limit=20`

**Response 200 OK**:
```json
{
  "data": [
    {
      "id": "950e8400-e29b-41d4-a716-446655440001",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "subject_id": "750e8400-e29b-41d4-a716-446655440001",
      "title": "Taller de Derivadas",
      "category": "ASSIGNMENT",
      "priority": "HIGH",
      "status": "TODO",
      "due_date": "2026-02-15T23:59:59Z",
      "days_until_due": 22,
      "is_overdue": false,
      "estimated_hours": 2.5,
      "actual_hours": null,
      "is_synced_gcal": false,
      "tags": ["derivadas", "cálculo"],
      "subject_details": {
        "id": "750e8400-e29b-41d4-a716-446655440001",
        "name": "Análisis Matemático I"
      }
    },
    {
      "id": "950e8400-e29b-41d4-a716-446655440002",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "subject_id": "750e8400-e29b-41d4-a716-446655440002",
      "title": "Examen Parcial Física I",
      "category": "EXAM",
      "priority": "URGENT",
      "status": "IN_PROGRESS",
      "due_date": "2026-02-10T18:00:00Z",
      "days_until_due": 17,
      "is_overdue": false,
      "estimated_hours": 4,
      "actual_hours": 1.5,
      "is_synced_gcal": true,
      "tags": ["examen", "física"],
      "subject_details": {
        "id": "750e8400-e29b-41d4-a716-446655440002",
        "name": "Física I"
      }
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  },
  "summary": {
    "total_tasks": 2,
    "by_status": {
      "TODO": 1,
      "IN_PROGRESS": 1,
      "DONE": 0
    },
    "by_priority": {
      "LOW": 0,
      "MEDIUM": 0,
      "HIGH": 1,
      "URGENT": 1
    },
    "overdue_count": 0
  }
}
```

---

### PATCH `/api/v1/tasks/{id}`

**Descripción**: Actualiza una tarea (cambio de estado, prioridad, etc.)

**Request**:
```json
{
  "status": "IN_PROGRESS",
  "priority": "URGENT",
  "actual_hours": 1.5
}
```

**Response 200 OK**:
```json
{
  "id": "950e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "title": "Taller de Derivadas",
  "category": "ASSIGNMENT",
  "priority": "URGENT",
  "status": "IN_PROGRESS",
  "due_date": "2026-02-15T23:59:59Z",
  "estimated_hours": 2.5,
  "actual_hours": 1.5,
  "updated_at": "2026-01-24T14:20:00Z"
}
```

---

### POST `/api/v1/tasks/{id}/sync`

**Descripción**: Sincroniza una tarea con Google Calendar

**Request** (puede ser vacío):
```json
{
  "add_reminder": true,
  "reminder_minutes_before": 1440
}
```

**Response 200 OK**:
```json
{
  "id": "950e8400-e29b-41d4-a716-446655440001",
  "title": "Taller de Derivadas",
  "is_synced_gcal": true,
  "gcal_event_id": "o4t7j5m6n8v5p2k9h3g8x1q7z",
  "sync_status": "SUCCESS",
  "message": "Task synchronized with Google Calendar",
  "synced_at": "2026-01-24T12:35:00Z"
}
```

**Response 401 Unauthorized** (si usuario no tiene Google Calendar vinculado):
```json
{
  "error": "GOOGLE_CALENDAR_NOT_CONFIGURED",
  "message": "Google Calendar is not linked to this account",
  "action_required": "Please connect your Google Calendar in settings"
}
```

---

## Calificaciones y Criterios de Evaluación

### POST `/api/v1/evaluation-criteria`

Crea un criterio de evaluación con peso porcentual para una materia (examen parcial, proyecto, quiz, etc.).

**Request**:
```json
{
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "name": "Examen Parcial 1",
  "weight": 30.00,
  "category": "EXAM"
}
```

**Validaciones**: `weight` en porcentaje (0-100). La suma de pesos de los criterios de una materia no debe superar 100%.

**Response 201 Created**:
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440001",
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "name": "Examen Parcial 1",
  "weight": 30.00,
  "category": "EXAM",
  "created_at": "2026-02-01T10:00:00Z",
  "updated_at": "2026-02-01T10:00:00Z"
}
```

---

### GET `/api/v1/evaluation-criteria`

Lista los criterios de evaluación de una materia.

**Query Parameters**: `subject_id` (UUID, obligatorio).

**Response 200 OK**:
```json
[
  {
    "id": "cc0e8400-e29b-41d4-a716-446655440001",
    "subject_id": "750e8400-e29b-41d4-a716-446655440001",
    "name": "Examen Parcial 1",
    "weight": 30.00,
    "category": "EXAM",
    "created_at": "2026-02-01T10:00:00Z",
    "updated_at": "2026-02-01T10:00:00Z"
  },
  {
    "id": "cc0e8400-e29b-41d4-a716-446655440002",
    "subject_id": "750e8400-e29b-41d4-a716-446655440001",
    "name": "Proyecto Final",
    "weight": 40.00,
    "category": "PROJECT",
    "created_at": "2026-02-01T10:05:00Z",
    "updated_at": "2026-02-01T10:05:00Z"
  }
]
```

---

### POST `/api/v1/grades`

Registra una calificación para un criterio de evaluación.

**Request**:
```json
{
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "criteria_id": "cc0e8400-e29b-41d4-a716-446655440001",
  "score": 4.2,
  "max_score": 5.0,
  "notes": "Buen manejo de derivadas parciales",
  "graded_at": "2026-03-10T00:00:00Z"
}
```

**Response 201 Created**:
```json
{
  "id": "dd0e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "criteria_id": "cc0e8400-e29b-41d4-a716-446655440001",
  "score": 4.2,
  "max_score": 5.0,
  "notes": "Buen manejo de derivadas parciales",
  "graded_at": "2026-03-10T00:00:00Z",
  "created_at": "2026-03-10T09:00:00Z",
  "updated_at": "2026-03-10T09:00:00Z"
}
```

---

### GET `/api/v1/subjects/{id}/average`

Calcula el promedio ponderado de una materia usando los criterios de evaluación y sus calificaciones.

**Response 200 OK**:
```json
{
  "subject_id": "750e8400-e29b-41d4-a716-446655440001",
  "subject_name": "Análisis Matemático I",
  "average": 4.15,
  "max_possible": 5.0,
  "weighted_progress": 0.70,
  "criteria_breakdown": [
    {
      "criteria_id": "cc0e8400-e29b-41d4-a716-446655440001",
      "criteria_name": "Examen Parcial 1",
      "weight": 30.00,
      "score": 4.2,
      "max_score": 5.0,
      "weighted_contribution": 1.26
    }
  ]
}
```

---

## Configuración de Usuario

### GET `/api/v1/user/settings`

**Descripción**: Obtiene preferencias del usuario

**Response 200 OK**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "LIGHT",
  "language": "ES",
  "dark_mode": false,
  "notifications": {
    "email_notifications": true,
    "push_notifications": true,
    "task_reminders": true,
    "reminder_minutes_before": [1440, 360, 60],
    "class_reminders": true,
    "class_reminder_minutes_before": 30
  },
  "calendar": {
    "show_weekends": false,
    "work_hours_start": "08:00",
    "work_hours_end": "22:00",
    "color_scheme": "PASTEL"
  },
  "integrations": {
    "google_calendar": {
      "connected": true,
      "calendar_id": "primary",
      "sync_status": "ACTIVE",
      "last_sync": "2026-01-24T12:30:00Z"
    },
    "email_provider": "GMAIL"
  },
  "privacy": {
    "profile_public": false,
    "share_academic_progress": false
  }
}
```

---

### PATCH `/api/v1/user/settings`

**Descripción**: Actualiza preferencias del usuario (semántica PATCH: solo los campos enviados se modifican)

**Request**:
```json
{
  "theme": "DARK",
  "notifications": {
    "email_notifications": false,
    "push_notifications": true,
    "reminder_minutes_before": [1440, 180]
  },
  "calendar": {
    "show_weekends": true
  }
}
```

**Response 200 OK**:
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "theme": "DARK",
  "notifications": {
    "email_notifications": false,
    "push_notifications": true,
    "task_reminders": true,
    "reminder_minutes_before": [1440, 180],
    "class_reminders": true
  },
  "calendar": {
    "show_weekends": true,
    "work_hours_start": "08:00",
    "work_hours_end": "22:00"
  },
  "updated_at": "2026-01-24T14:25:00Z",
  "message": "Settings updated successfully"
}
```

---

## Códigos de Estado HTTP

| Código | Nombre | Descripción |
|--------|--------|-------------|
| `201` | Created | Recurso creado exitosamente |
| `204` | No Content | Recurso eliminado/actualizado sin contenido de respuesta |
| `400` | Bad Request | Error en validación de campos enviados |
| `401` | Unauthorized | Token inválido, expirado o faltante |
| `403` | Forbidden | Usuario autenticado pero sin permiso para acceder |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto de horario detectado (o duplicado) |
| `422` | Unprocessable Entity | Entidad válida pero no procesable |
| `429` | Too Many Requests | Límite de rate limiting excedido |
| `500` | Internal Server Error | Error interno del servidor |
| `503` | Service Unavailable | Servicio temporalmente no disponible |

---

## Formato de Errores

### Estructura Estándar de Error

**Todos los errores siguen este patrón**:
```json
{
  "error": "ERROR_CODE",
  "message": "Descripción legible del error",
  "details": {
    "campo": ["error específico del campo"]
  },
  "request_id": "req-12345-abcde",
  "timestamp": "2026-01-24T12:30:00Z"
}
```

### Ejemplo: Validación de Múltiples Campos

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Validation failed for request body",
  "details": {
    "name": [
      "required",
      "max_length:200"
    ],
    "credits": [
      "must be integer",
      "between:0:6"
    ],
    "sessions[0].start_time": [
      "invalid_format",
      "must be in HH:MM format"
    ]
  },
  "request_id": "req-xyz-789",
  "timestamp": "2026-01-24T12:30:00Z"
}
```

---

## Headers Requeridos

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

## Límites de Rate Limiting

- **Endpoints GET**: 100 peticiones/minuto por usuario
- **Endpoints POST**: 30 peticiones/minuto por usuario
- **Endpoints PATCH**: 30 peticiones/minuto por usuario
- **Endpoints DELETE**: 10 peticiones/minuto por usuario

**Response cuando se excede**:
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "retry_after": 45
}
```

---

## Notas de Implementación

1. **Timezone**: Todos los timestamps en UTC (Z)
2. **Formato de Hora**: HH:MM en formato 24 horas
3. **UUIDs**: Todos los IDs son UUID v4
4. **Pagination**: Implementada en GET bulk (GET /subjects, GET /tasks, etc.)
5. **Caché**: Recomendado cachear en cliente por 5 minutos
6. **Compresión**: Soporta gzip en responses > 1KB

---

Para la documentación completa del módulo de Profesores y Tutorías, ver [professors.md](professors.md).
Para la documentación completa de Perfil de Usuario, Configuración y Notificaciones, ver [user_profile.md](user_profile.md).

**Última actualización**: 2026-04-06
**Versión API**: v1 (`/api/v1`)
**Documentación interactiva**: http://localhost:8000/docs (Swagger UI)
