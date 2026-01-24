# API Specification

## Autenticación
Todos los endpoints (excepto `/auth`) requieren un header `Authorization: Bearer <JWT>`.

## Recursos Principales

| Recurso | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Subjects** | `POST` | `/api/v1/subjects` | Crea una nueva materia con validación de conflictos. |
| | `GET` | `/api/v1/subjects` | Lista materias del semestre activo. |
| | `DELETE` | `/api/v1/subjects/{id}` | Elimina materia (Cascade a sesiones). |
| **Tasks** | `POST` | `/api/v1/tasks` | Crea tarea asociada a materia o libre. |
| | `PATCH` | `/api/v1/tasks/{id}` | Actualiza estado o prioridad. |
| | `POST` | `/api/v1/tasks/{id}/sync` | Sincroniza manualmente con Google Calendar. |
| **Semesters** | `POST` | `/api/v1/semesters` | Configura nuevo periodo académico. |

## Códigos de Error Comunes
- `201`: Creado exitosamente.
- `400`: Error de validación de campos.
- `409`: Conflicto de horario detectado.
- `401`: Token inválido o expirado.
