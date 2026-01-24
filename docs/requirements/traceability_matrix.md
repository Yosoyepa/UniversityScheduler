# Requirements Traceability Matrix

Esta matriz vincula los requisitos funcionales con sus casos de uso, pantallas (mockups), y tests correspondientes.

## Leyenda de Estado
- ✅ Implementado y probado
- ⏳ Pendiente de implementación
- 🚧 En desarrollo

---

## Contexto: Gestión Académica

| ID | Requisito | UC | Mockup | Test | Estado |
|---|---|---|---|---|---|
| REQ-001 | Usuario puede crear un semestre con nombre y fechas | UC-001 | - | test_create_semester.py | ⏳ |
| REQ-002 | Sistema marca nuevo semestre como activo | UC-001 | - | test_activate_semester.py | ⏳ |
| REQ-003 | Usuario puede crear materia con nombre, créditos, tipo y profesor | UC-002 | add_and_edit_class_details_1 | test_create_subject.py | ⏳ |
| REQ-004 | Sistema debe detectar conflictos de horario al agregar sesiones | UC-003 | add_and_edit_class_details_2 | test_conflict_detection.py | ⏳ |
| REQ-005 | Soportar 4 tipos de materia (DISCIPLINAR_*, FUNDAMENTAL, LIBRE) | UC-002 | add_and_edit_class_details_1 | test_subject_types.py | ⏳ |
| REQ-006 | Usuario puede editar datos de una materia existente | UC-004 | add_and_edit_class_details_2 | test_edit_subject.py | ⏳ |
| REQ-007 | Usuario puede eliminar una materia (cascade a sesiones) | UC-005 | add_and_edit_class_details_2 | test_delete_subject.py | ⏳ |
| REQ-008 | Calendario muestra todas las sesiones del semestre activo | - | university_schedule_dashboard_1 | test_calendar_view.py | ⏳ |
| REQ-009 | Vista semanal y mensual del horario | - | university_schedule_dashboard_2 | test_calendar_views.py | ⏳ |

---

## Contexto: Gestión de Tareas

| ID | Requisito | UC | Mockup | Test | Estado |
|---|---|---|---|---|---|
| REQ-010 | Usuario puede crear tarea con título, descripción, fecha límite | UC-006 | tasks_and_exams_manager_1 | test_create_task.py | ⏳ |
| REQ-011 | Tarea puede asociarse a una materia (opcional) | UC-006 | tasks_and_exams_manager_1 | test_task_subject_link.py | ⏳ |
| REQ-012 | Usuario puede cambiar estado de tarea (TODO, IN_PROGRESS, DONE) | UC-007 | tasks_and_exams_manager_2 | test_kanban_transition.py | ⏳ |
| REQ-013 | Tablero Kanban muestra tareas agrupadas por estado | - | tasks_and_exams_manager_1 | test_kanban_board.py | ⏳ |
| REQ-014 | Tareas de alta prioridad pueden sincronizarse con Google Calendar | UC-008 | tasks_and_exams_manager_2 | test_gcal_sync.py | ⏳ |
| REQ-015 | Categorías de tarea: TASK, EXAM, PROJECT, READING | UC-006 | tasks_and_exams_manager_1 | test_task_categories.py | ⏳ |

---

## Contexto: Configuración y Perfil

| ID | Requisito | UC | Mockup | Test | Estado |
|---|---|---|---|---|---|
| REQ-016 | Usuario puede activar/desactivar notificaciones por email | UC-009 | alerts_and_notification_settings_1 | test_email_notifications.py | ⏳ |
| REQ-017 | Usuario puede configurar tiempos de alerta personalizados | UC-009 | alerts_and_notification_settings_2 | test_alert_preferences.py | ⏳ |
| REQ-018 | Usuario puede activar modo oscuro | UC-009 | alerts_and_notification_settings_1 | test_dark_mode.py | ⏳ |

---

## Contexto: Progreso y Reportes

| ID | Requisito | UC | Mockup | Test | Estado |
|---|---|---|---|---|---|
| REQ-019 | Sistema muestra progreso de tareas por materia | UC-010 | grades_and_academic_progress | test_progress_by_subject.py | ⏳ |
| REQ-020 | Sistema calcula porcentaje de tareas completadas | UC-010 | grades_and_academic_progress | test_completion_percentage.py | ⏳ |
| REQ-021 | Usuario puede ver lista de profesores de sus materias | UC-011 | professor_directory_and_tutoring | test_professor_list.py | ⏳ |
| REQ-022 | Usuario puede filtrar profesores por nombre | UC-011 | professor_directory_and_tutoring | test_professor_filter.py | ⏳ |

---

## Resumen de Cobertura

| Módulo | Total Requisitos | Implementados | Pendientes |
|---|---|---|---|
| Academic Planning | 9 | 0 | 9 |
| Tasks | 6 | 0 | 6 |
| Settings | 3 | 0 | 3 |
| Progress/Reports | 4 | 0 | 4 |
| **TOTAL** | **22** | **0** | **22** |

