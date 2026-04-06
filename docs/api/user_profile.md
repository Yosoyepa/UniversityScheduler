# API — Perfil de Usuario, Configuración y Notificaciones

Este documento cubre los endpoints del router `user_router.py`, que gestiona el perfil del usuario autenticado, sus preferencias de configuración y el sistema de notificaciones in-app.

Todos los endpoints requieren autenticación JWT.

**Prefijo base**: `/api/v1/user`

---

## Tabla de Endpoints

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `PUT` | `/user/profile` | Actualiza el nombre del usuario |
| `GET` | `/user/settings` | Obtiene las preferencias del usuario |
| `PATCH` | `/user/settings` | Actualiza las preferencias parcialmente |
| `GET` | `/user/notifications` | Lista las notificaciones del usuario |
| `GET` | `/user/notifications/count` | Obtiene el conteo de notificaciones no leídas |
| `PATCH` | `/user/notifications/{id}/read` | Marca una notificación como leída |
| `PATCH` | `/user/notifications/read-all` | Marca todas las notificaciones como leídas |

---

## Schemas de Referencia

### UserResponse

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "estudiante@universidad.edu",
  "full_name": "Juan García López",
  "is_active": true,
  "created_at": "2026-01-24T12:30:00Z"
}
```

### SettingsResponse

```json
{
  "dark_mode": false,
  "email_notifications": true,
  "push_notifications": true,
  "sms_alerts": false,
  "class_reminder_minutes": 15,
  "exam_reminder_days": 3,
  "assignment_reminder_hours": 24,
  "alert_preferences": null
}
```

### NotificationResponse

```json
{
  "id": "ff0e8400-e29b-41d4-a716-446655440001",
  "type": "TASK_COMPLETED",
  "title": "Tarea completada",
  "message": "Has completado \"Taller de Derivadas\"",
  "is_read": false,
  "related_entity_id": "950e8400-e29b-41d4-a716-446655440001",
  "created_at": "2026-03-15T14:30:00Z"
}
```

### Tipos de Notificación (`type`)

| Tipo | Evento que lo genera |
| :--- | :--- |
| `TASK_COMPLETED` | Una tarea pasa al estado `DONE` |
| `TASK_OVERDUE` | Una tarea supera su `due_date` sin completarse (job programado, no activo en beta) |
| `SEMESTER_ACTIVATED` | Un semestre es activado |
| `SUBJECT_CREATED` | Una materia es creada |

---

## Perfil de Usuario

### PUT `/api/v1/user/profile`

Actualiza el nombre completo del usuario autenticado. Solo el campo `full_name` es modificable por este endpoint. El email no es modificable.

**Request**:
```json
{
  "full_name": "Juan Carlos García López"
}
```

**Campos**:
- `full_name` (string, obligatorio): Nombre completo. Se aplican reglas de validación de longitud mínima.

**Response 200 OK**: `UserResponse` con el nombre actualizado.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "estudiante@universidad.edu",
  "full_name": "Juan Carlos García López",
  "is_active": true,
  "created_at": "2026-01-24T12:30:00Z"
}
```

**Errores posibles**: `400 VALIDATION_ERROR` (nombre vacío o demasiado corto).

---

## Configuración

### GET `/api/v1/user/settings`

Retorna las preferencias del usuario autenticado. Si no existen registros de configuración previos, el sistema crea valores por defecto automáticamente.

**Response 200 OK**: `SettingsResponse`.

```json
{
  "dark_mode": false,
  "email_notifications": true,
  "push_notifications": true,
  "sms_alerts": false,
  "class_reminder_minutes": 15,
  "exam_reminder_days": 3,
  "assignment_reminder_hours": 24,
  "alert_preferences": null
}
```

**Descripción de campos**:

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `dark_mode` | bool | Modo oscuro activo |
| `email_notifications` | bool | Habilitar notificaciones por correo electrónico |
| `push_notifications` | bool | Habilitar notificaciones push |
| `sms_alerts` | bool | Habilitar alertas por SMS |
| `class_reminder_minutes` | int | Minutos de anticipación para recordatorio de clase |
| `exam_reminder_days` | int | Días de anticipación para recordatorio de examen |
| `assignment_reminder_hours` | int | Horas de anticipación para recordatorio de entrega |
| `alert_preferences` | object o null | Campo extendido para preferencias adicionales (JSONB) |

---

### PATCH `/api/v1/user/settings`

Actualiza las preferencias del usuario. Semántica PATCH: solo los campos enviados se modifican; los demás mantienen su valor actual.

**Request** (todos los campos son opcionales):
```json
{
  "dark_mode": true,
  "push_notifications": false,
  "exam_reminder_days": 5
}
```

**Response 200 OK**: `SettingsResponse` con los valores actualizados.

**Errores posibles**: `400 VALIDATION_ERROR` (valores fuera de rango, por ejemplo `class_reminder_minutes` negativo).

---

## Notificaciones

### GET `/api/v1/user/notifications`

Lista las notificaciones del usuario autenticado, ordenadas por fecha de creación descendente.

**Query Parameters**:

| Parámetro | Tipo | Por defecto | Descripción |
| :--- | :--- | :--- | :--- |
| `unread_only` | bool | `false` | Si `true`, retorna solo notificaciones no leídas |
| `limit` | int | `50` | Número máximo de notificaciones a retornar |

**Ejemplo**: `GET /api/v1/user/notifications?unread_only=true&limit=20`

**Response 200 OK**:

```json
{
  "data": [
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440001",
      "type": "TASK_COMPLETED",
      "title": "Tarea completada",
      "message": "Has completado \"Taller de Derivadas\"",
      "is_read": false,
      "related_entity_id": "950e8400-e29b-41d4-a716-446655440001",
      "created_at": "2026-03-15T14:30:00Z"
    },
    {
      "id": "ff0e8400-e29b-41d4-a716-446655440002",
      "type": "TASK_COMPLETED",
      "title": "Tarea completada",
      "message": "Has completado \"Examen Parcial Física I\"",
      "is_read": true,
      "related_entity_id": "950e8400-e29b-41d4-a716-446655440002",
      "created_at": "2026-03-10T11:00:00Z"
    }
  ],
  "unread_count": 1
}
```

---

### GET `/api/v1/user/notifications/count`

Retorna únicamente el conteo de notificaciones no leídas. Diseñado para la actualización periódica del badge en la campana de notificaciones del navbar.

**Response 200 OK**:

```json
{
  "unread_count": 3
}
```

---

### PATCH `/api/v1/user/notifications/{notification_id}/read`

Marca una notificación específica como leída.

**Path Parameters**: `notification_id` (UUID).

**Response 200 OK**:

```json
{
  "message": "Notification marked as read"
}
```

**Errores posibles**: `404 NOTIFICATION_NOT_FOUND` (la notificación no existe o no pertenece al usuario).

---

### PATCH `/api/v1/user/notifications/read-all`

Marca todas las notificaciones del usuario como leídas en una sola operación.

**Response 200 OK**:

```json
{
  "message": "3 notifications marked as read",
  "updated_count": 3
}
```

Si no hay notificaciones no leídas, `updated_count` será `0`.

---

## Notas

- Las notificaciones son generadas automáticamente por el `NotificationListener` cuando el `SyncEventBus` publica eventos de dominio (por ejemplo, `TaskCompletedEvent`). No existe un endpoint para crear notificaciones manualmente.
- Las notificaciones no se eliminan automáticamente. La retención depende de la implementación de limpieza futura.
- El campo `related_entity_id` es el UUID de la entidad relacionada con la notificación (por ejemplo, el `id` de la tarea completada), lo que permite navegar directamente al recurso desde la UI.
