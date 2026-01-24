# API Specification

## Autenticación
Todos los endpoints (excepto `/auth`) requieren un header `Authorization: Bearer <JWT>`.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📋 Tabla General de Recursos

| Recurso | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/login` | Autentica usuario y retorna JWT |
| **Semesters** | `POST` | `/api/v1/semesters` | Crea nuevo período académico |
| | `GET` | `/api/v1/semesters` | Lista todos los semestres del usuario |
| | `GET` | `/api/v1/semesters/{id}` | Obtiene detalles de un semestre |
| | `PATCH` | `/api/v1/semesters/{id}` | Actualiza semestre |
| **Subjects** | `POST` | `/api/v1/subjects` | Crea nueva materia con validación de conflictos |
| | `GET` | `/api/v1/subjects` | Lista materias del semestre activo |
| | `GET` | `/api/v1/subjects/{id}` | Obtiene detalles de una materia |
| | `PATCH` | `/api/v1/subjects/{id}` | Actualiza materia |
| | `DELETE` | `/api/v1/subjects/{id}` | Elimina materia (Cascade a sesiones) |
| **ClassSessions** | `POST` | `/api/v1/subjects/{id}/sessions` | Agrega sesión a materia |
| | `PATCH` | `/api/v1/sessions/{id}` | Actualiza sesión |
| | `DELETE` | `/api/v1/sessions/{id}` | Elimina sesión |
| **Tasks** | `POST` | `/api/v1/tasks` | Crea tarea asociada a materia o libre |
| | `GET` | `/api/v1/tasks` | Lista todas las tareas del usuario |
| | `PATCH` | `/api/v1/tasks/{id}` | Actualiza estado o prioridad |
| | `DELETE` | `/api/v1/tasks/{id}` | Elimina tarea |
| | `POST` | `/api/v1/tasks/{id}/sync` | Sincroniza tarea con Google Calendar |
| **Settings** | `GET` | `/api/v1/settings` | Obtiene configuración del usuario |
| | `PATCH` | `/api/v1/settings` | Actualiza preferencias |

---

## 🔐 Authentication

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

## 📚 Semesters (Períodos Académicos)

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

## 📖 Subjects (Materias/Cursos)

### POST `/api/v1/subjects` ⭐ ENDPOINT CRÍTICO

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

## 📝 Tasks (Tareas y Exámenes)

### POST `/api/v1/tasks` ⭐ ENDPOINT IMPORTANTE

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

## ⚙️ Settings (Configuración del Usuario)

### GET `/api/v1/settings`

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

### PATCH `/api/v1/settings`

**Descripción**: Actualiza preferencias del usuario

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

## 🔢 Códigos de Error Comunes

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

## 🔄 Flujo de Manejo de Errores

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

## 🔐 Headers Requeridos

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

## ⏱️ Límites de Rate Limiting

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

## 📌 Notas de Implementación

1. **Timezone**: Todos los timestamps en UTC (Z)
2. **Formato de Hora**: HH:MM en formato 24 horas
3. **UUIDs**: Todos los IDs son UUID v4
4. **Pagination**: Implementada en GET bulk (GET /subjects, GET /tasks, etc.)
5. **Caché**: Recomendado cachear en cliente por 5 minutos
6. **Compresión**: Soporta gzip en responses > 1KB

---

**Última actualización**: 24 de Enero de 2026  
**Versión API**: v1.0  
**Status**: Production Ready
