# Mockups Documentation

Este documento describe cada pantalla (mockup) del sistema University Scheduler, incluyendo su propósito, componentes principales, comportamiento esperado y estados de error.

---

## 1. University Schedule Dashboard

### Variante 1: `university_schedule_dashboard_1/`
**Propósito**: Vista principal del sistema. Muestra el horario semanal del estudiante.

**Componentes**:
| Componente | Descripción |
|---|---|
| Header | Logo, nombre de usuario, selector de semestre activo |
| Sidebar | Navegación principal (Dashboard, Tareas, Configuración) |
| Calendar Grid | Grilla de 7 días × 24 horas con bloques de clases |
| Class Card | Tarjeta de materia con color, nombre y ubicación |
| Summary Panel | Resumen de créditos totales y horas semanales |

**Comportamiento**:
- **Click en Class Card**: Abre modal de edición (UC-004)
- **Hover en Class Card**: Muestra tooltip con detalles (profesor, ubicación)
- **Conflicto Visual**: Si hay solapamiento, mostrar borde rojo en ambas clases

**Estados de Error**:
- Sin semestre activo: Mostrar mensaje "Crea tu primer semestre para comenzar"
- Sin materias: Mostrar estado vacío con CTA "Agregar Materia"

---

### Variante 2: `university_schedule_dashboard_2/`
**Propósito**: Vista alternativa con selector de vista (semanal/mensual).

**Diferencias con Variante 1**:
- Toggle para cambiar entre vista semanal y mensual
- Vista mensual muestra días con puntos de colores indicando clases
- Filtros por tipo de materia o dificultad

---

## 2. Add and Edit Class Details

### Variante 1: `add_and_edit_class_details_1/`
**Propósito**: Formulario para crear una nueva materia.

**Campos del Formulario**:
| Campo | Tipo | Validación | Obligatorio |
|---|---|---|---|
| Nombre | Text | Max 200 chars, no vacío | ✅ |
| Créditos | Number | 0-6 | ✅ |
| Tipo | Select | Enum (4 opciones) | ✅ |
| Profesor | Text | Max 200 chars | ❌ |
| Color | Color Picker | Hex válido | ❌ (default: #3b82f6) |
| Dificultad | Select | EASY/MEDIUM/HARD | ❌ (default: MEDIUM) |

**Sección de Sesiones**:
- Botón "Agregar Sesión" para añadir bloques horarios
- Cada sesión tiene: Día (1-7), Hora Inicio, Hora Fin, Ubicación
- Validación: `end_time > start_time`

**Comportamiento**:
- **Guardar**: Valida campos → Detecta conflictos → Persiste
- **Cancelar**: Cierra modal sin guardar

**Estados de Error**:
- Campos vacíos: Resaltar en rojo con mensaje inline
- Conflicto detectado: Modal de advertencia con lista de conflictos

---

### Variante 2: `add_and_edit_class_details_2/`
**Propósito**: Modo de edición de materia existente.

**Diferencias**:
- Campos pre-poblados con datos actuales
- Botón adicional "Eliminar Materia" (con confirmación)

---

## 3. Tasks and Exams Manager

### Variante 1: `tasks_and_exams_manager_1/`
**Propósito**: Tablero Kanban para gestión de tareas.

**Componentes**:
| Componente | Descripción |
|---|---|
| Kanban Board | 3 columnas: TODO, IN_PROGRESS, DONE |
| Task Card | Título, fecha límite, prioridad (badge de color), materia |
| Add Task Button | Abre modal de nueva tarea |
| Filters | Por materia, prioridad, categoría |

**Comportamiento**:
- **Drag & Drop**: Mover tarea entre columnas actualiza estado
- **Click en Task Card**: Abre modal de edición
- **Badge de Prioridad**: LOW (gris), MEDIUM (amarillo), HIGH (rojo)
- **Tarea Vencida**: Mostrar con fondo rojo claro

**Estados de Error**:
- Sin tareas: Estado vacío con CTA "Crear tu primera tarea"

---

### Variante 2: `tasks_and_exams_manager_2/`
**Propósito**: Vista alternativa con calendario de fechas límite.

**Diferencias**:
- Vista de calendario mensual con tareas posicionadas por due_date
- Toggle para cambiar entre vista Kanban y Calendario
- Opción de sincronizar con Google Calendar (UC-008)

---

## 4. Alerts and Notification Settings

### Variante 1: `alerts_and_notification_settings_1/`
**Propósito**: Configuración de preferencias de notificaciones.

**Secciones**:
| Sección | Opciones |
|---|---|
| Notificaciones Email | Toggle on/off |
| Alertas de Tareas | Checkboxes: 1 día antes, 1 hora antes, al momento |
| Apariencia | Toggle modo oscuro |

**Comportamiento**:
- Cambios se guardan automáticamente (auto-save) o con botón "Guardar"
- Feedback visual al guardar (toast "Preferencias actualizadas")

---

### Variante 2: `alerts_and_notification_settings_2/`
**Propósito**: Configuración avanzada de alertas.

**Diferencias**:
- Tiempos de alerta personalizables (input numérico)
- Configuración por tipo de tarea (exámenes vs tareas regulares)

---

## 5. Grades and Academic Progress

### `grades_and_academic_progress/`
**Propósito**: Dashboard de progreso académico.

**Componentes**:
| Componente | Descripción |
|---|---|
| Progress Overview | Gráfico circular de tareas completadas vs pendientes |
| Progress by Subject | Barras de progreso por materia |
| Semester Timeline | Línea de tiempo con hitos (exámenes, entregas) |

**Comportamiento**:
- Filtrar por semestre (histórico disponible)

**Estados**:
- Sin datos: "Completa tareas para ver tu progreso"

---

## 6. Professor Directory and Tutoring

### `professor_directory_and_tutoring/`
**Propósito**: Lista de profesores de las materias del usuario.

**Componentes**:
| Componente | Descripción |
|---|---|
| Search Bar | Filtrar profesores por nombre |
| Professor Card | Nombre, materias que imparte |
| Subject Tags | Badges con las materias asociadas |

**Comportamiento**:
- Click en materia: Navega al detalle de esa materia
- Ordenar por nombre o por cantidad de materias

**Estados**:
- Sin profesores: "Agrega materias con profesores asignados"

---

## Mapa de Navegación
