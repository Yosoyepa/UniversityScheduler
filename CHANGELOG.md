# Registro de Cambios

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue el estándar [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) y el versionado respeta [Semantic Versioning](https://semver.org/lang/es/).

---

## [Sin publicar]

### Planificado
- Integración con Google Calendar para sincronización bidireccional de tareas y sesiones de clase (Phase 7).
- Exportación de horario a formato iCal.
- Job programado para notificaciones de tareas vencidas (`TaskOverdueEvent`).

---

## [1.0.0-beta.2] — 2026-04-06

### Agregado

**Módulo de Profesores (Phase 6)**
- CRUD completo del directorio privado de profesores por usuario (`POST/GET/PATCH/DELETE /api/v1/professors`).
- Gestión de bloques de horas de oficina por profesor con tipos de ubicación: OFFICE, LAB, VIRTUAL (`POST/DELETE /api/v1/professors/{id}/office-hours`).
- Ciclo de vida completo de sesiones de tutoría: reserva, cancelación y marcado como completada (`POST/GET /api/v1/tutoring`, `PATCH /tutoring/{id}/cancel`, `PATCH /tutoring/{id}/complete`).
- Campo `is_available_now` calculado dinámicamente en la respuesta de cada profesor.
- Migraciones Alembic: tablas `professors`, `office_hours`, `tutoring_sessions`.
- Componentes frontend: `ProfessorCard`, `BookTutoringModal`, `AddProfessorModal`, página `dashboard/directory`.

**Interfaz de usuario**
- Modo oscuro persistente gestionado por `ThemeContext` de React, sincronizado con la API de configuración del usuario.
- Traducción completa de la interfaz al español.
- Mejoras de contraste y accesibilidad en componentes del modo oscuro.
- Nuevo campo `NotificationDropdown` en la barra de navegación superior con badge de no leídas.

### Modificado
- Modelos Pydantic actualizados para compatibilidad con SQLAlchemy 2.0 async (`model_validate` en lugar de `from_orm`).
- `DashboardLayout` refactorizado con soporte de íconos activos en la barra lateral.
- `ScheduleGrid` y `KanbanBoard` con mejoras de consistencia visual entre modos claro y oscuro.

---

## [1.0.0-beta.1] — 2026-01-24

### Agregado

**Infraestructura base**
- Proyecto inicializado con estructura de monorepo (`backend/`, `frontend/`, `docs/`, `infra/`).
- Contenedorización con Docker Compose: servicio PostgreSQL 15-alpine con volumen persistente.
- Script de inicio unificado `start_dev.sh` que levanta la base de datos, aplica migraciones e inicia ambos servidores.
- Backend desplegable con imagen Docker Python 3.13.

**Módulo de Autenticación (Phase 4)**
- Registro de usuario con hash bcrypt (`POST /api/v1/auth/register`).
- Login con validación de credenciales y emisión de access token (60 min) y refresh token (7 días) en formato JWT HS256 (`POST /api/v1/auth/login`).
- Renovación de tokens sin reautenticación (`POST /api/v1/auth/refresh`).
- Obtención del perfil del usuario autenticado (`GET /api/v1/auth/me`).
- Logout cliente con endpoint de confirmación (`POST /api/v1/auth/logout`).
- Middleware de autenticación JWT (`auth_middleware.py`) que protege todos los endpoints excepto `/auth/register`, `/auth/login` y `/health`.

**Módulo de Planificación Académica (Phase 1)**
- CRUD de semestres con validación de fechas (`POST/GET/PATCH/DELETE /api/v1/semesters`).
- Activación de semestre con desactivación automática del anterior, emite `SemesterActivatedEvent` (`POST /api/v1/semesters/{id}/activate`).
- CRUD de materias con validación de conflictos horarios usando `ConflictDetectionService` (`POST/GET/PATCH/DELETE /api/v1/subjects`).
- CRUD de sesiones de clase semanales con campo de sala opcional (`POST/GET/PATCH/DELETE /api/v1/subjects/{id}/class-sessions`).
- Endpoint de horario semanal consolidado del semestre activo (`GET /api/v1/schedule`).
- Migraciones Alembic iniciales: tablas `users`, `settings`, `semesters`, `subjects`, `class_sessions`, `tasks`.

**Módulo de Tareas (Phase 2)**
- CRUD de tareas con prioridades (LOW, MEDIUM, HIGH) y categorías (TASK, EXAM, PROJECT, READING) (`POST/GET/PATCH/DELETE /api/v1/tasks`).
- Máquina de estados de tarea: TODO → IN_PROGRESS → DONE → ARCHIVED (`PATCH /api/v1/tasks/{id}/status`).
- Emisión de `TaskCompletedEvent` al pasar al estado DONE.
- Tablero Kanban en frontend con 4 columnas y actualización optimista de estado.

**Módulo de Progreso Académico (Phase 3)**
- CRUD de criterios de evaluación con peso porcentual por materia (`POST/GET/PATCH/DELETE /api/v1/evaluation-criteria`).
- CRUD de calificaciones vinculadas a criterios (`POST/GET/PATCH/DELETE /api/v1/grades`).
- Cálculo de promedio ponderado por materia (`GET /api/v1/subjects/{id}/average`).
- Migración Alembic: tablas `evaluation_criteria` y `grades`.

**Módulo de Configuración y Notificaciones (Phase 5)**
- API de configuración de usuario: modo oscuro, preferencias de notificaciones y tiempos de recordatorio (`GET/PATCH /api/v1/user/settings`).
- Actualización de perfil de usuario (`PUT /api/v1/user/profile`).
- Sistema de notificaciones in-app persistentes, generadas por el bus de eventos (`GET /api/v1/user/notifications`).
- Conteo de notificaciones no leídas para badge de campana (`GET /api/v1/user/notifications/count`).
- Marcar notificaciones como leídas individual o masivamente.
- Migración Alembic: tabla `notifications` y expansión de `settings`.

**Arquitectura y patrones**
- Arquitectura Hexagonal completa por módulo: capas `domain/`, `application/`, `port/`, `adapter/`, `infrastructure/`.
- Shared Kernel: jerarquía de excepciones, `SyncEventBus`, value objects (`Email`, `TimeRange`), sesión de base de datos asíncrona.
- Registro de manejadores de excepciones globales en `exception_handler.py` con respuesta JSON canónica.
- `NotificationListener` conectado al `SyncEventBus` para persistir notificaciones de `TaskCompletedEvent`.
- Documentación Swagger/OpenAPI autogenerada por FastAPI en `/docs` y `/redoc`.

**Frontend**
- Implementación de Atomic Design: atoms (Button, Input, Badge), molecules (FormField, TaskCard, ClassCard), organisms (ScheduleGrid, KanbanBoard, GradesTable), templates (DashboardLayout, AuthLayout).
- App Router de Next.js con grupo de rutas protegidas (`/dashboard`) y públicas (`/(auth)`).
- `AuthContext` para gestión del estado de autenticación con tokens en `localStorage`.
- Cliente HTTP centralizado en `src/lib/api.ts` con tipo `Result<T>` para manejo de errores.
- Suite de pruebas E2E con Playwright.
- Pre-commit: verificación de `tsc --noEmit` y `npm run build` antes de cada commit.

**Documentación inicial**
- Documentación de arquitectura en `docs/architecture/` (ADRs, modelo C4, esquema de base de datos, modelo de dominio, diagramas de comportamiento, estructura de directorios, casos de uso).
- Diagramas PlantUML: ERD, DFD, despliegue y máquinas de estado en `docs/diagrams/`.
- Guía de contribución `CONTRIBUTING.md` con reglas de capas y formato de commits.

---

_Formato: [Keep a Changelog](https://keepachangelog.com/es/1.1.0/) — Versionado: [SemVer](https://semver.org/lang/es/)_
