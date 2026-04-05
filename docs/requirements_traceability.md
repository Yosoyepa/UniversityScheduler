# Matriz de Trazabilidad (Requirements Traceability)

El propósito de este documento es alinear los Requisitos Funcionales de las Fases del MVP de UniversityScheduler (v1.0.0-beta.1) contra los Casos de Uso del Backend y los Componentes del Frontend correspondientes.

| Requirement (Fase) | Descripción Breve | Backend Use Case | Frontend Component / Page |
| :--- | :--- | :--- | :--- |
| **REQ-1.1** (F1) | Gestión del Semestre | UC-001 | `SemesterSelector`, `/dashboard` |
| **REQ-1.2** (F1) | Cursos y Asignaturas | UC-002 | `ClassFormModal`, `SubjectDetailsModal` |
| **REQ-1.3** (F1) | Horario Semanal Interactivo | UC-003 | `ScheduleGrid` (Organism) |
| **REQ-2.1** (F2) | Tareas a entregar | UC-004 | `TaskCard` (Molecules), `useTasks` |
| **REQ-2.2** (F2) | Kanban de progresión | UC-005 | `KanbanBoard` (Organism) |
| **REQ-3.1** (F3) | Criterios de Evaluación | UC-006 | `EvaluationCriteriaForm` |
| **REQ-3.2** (F3) | Seguimiento de Notas | UC-007 | `/dashboard/progress`, `GradesTable` |
| **REQ-4.1** (F4) | Autenticación Segura | UC-008 | `/login`, `/register`, `AuthContext` |
| **REQ-5.1** (F5) | Tema Oscuro y Preferencias | UC-009 | `ThemeProvider`, `/dashboard/settings` |
| **REQ-5.2** (F5) | Notificaciones In-App | UC-010 | `NotificationDropdown`, `ToastProvider` |
| **REQ-6.1** (F6) | Directorio Universitario | UC-011 | `ProfessorCard`, `/dashboard/directory` |
| **REQ-6.2** (F6) | Tutorías Agendables | UC-012 | `BookTutoringModal` |
| **REQ-7.1** (F7) | Sincronización Google Calendar | *Pospuesto* | N/A |

### Relación Test-Coverage (Pruebas de Integración)
- El entorno Playwright se introdujo en la fase 8 con `frontend/e2e`. Las especificaciones e2e futuras trazarán uno a uno contra estos `REQ-X.Y` para garantizar QA de regressión en CI/CD.
