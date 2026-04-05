# Especificación de Vistas (UI/UX)

La UI de UniversityScheduler está construida bajo la metodología **Atomic Design**. Este documento devela la especificación formal del comportamiento actual de las vistas a nivel Organismos.

## `/login` y `/register`
- **Área:** Autenticación.
- **Flujo:** Formularios centrados con validaciones y feedback de error asíncrono. Bloquean el acceso al dashboard si no hay token válido.

## `/dashboard` (Home - Academic Planning)
- **Área:** Programación Académica y Vista Semanal.
- **Descripción:** Presenta tarjetas informativas (`ClassCard`) sobre una grilla HTML. El usuario puede ver huecos horarios con facilidad, similar a un Google Calendar.
- **Acciones Core:** Añadir Semestre, Añadir Materia + Horarios, Eliminar Clases.

## `/dashboard/tasks`
- **Área:** Gestión de Tareas.
- **Descripción:** Muestra un tablero Kanban de 3 columnas (TODO, IN PROGRESS, DONE) con HTML5 Drag and Drop. Se priorizan fechas de entrega coloreadas.
- **Acciones Core:** Añadir nueva Tarea, Editar (doble clic), Arrastrar.

## `/dashboard/progress`
- **Área:** Progreso Académico y Calificaciones.
- **Descripción:** Tablas jerárquicas; Nivel 1: Materia (Muestra Promedio Generado); Nivel 2: Desglose de evaluaciones con pesos porcentuales y nota absoluta.
- **Acciones Core:** Calcular si se proyecta aprobar o reprobar semáforo (Verde, Rojo, Amarillo).

## `/dashboard/settings`
- **Área:** Configuración de Usuario.
- **Descripción:** Secciones con _Tabs_ conteniendo Account (Detalles y Password), App Settings (Dark Mode default, Escala de notas preferida, Horario recordatorio), y Notifications (Manejo de read state).
- **Notificaciones:** Menú desplegable global (Bell) anclado al `DashboardLayout`.

## `/dashboard/directory`
- **Área:** Directorio y Tutorías.
- **Descripción:** Cartas de visualización de Docentes asociados y disponibilidad. Modal interactivo `BookTutoringModal` para seleccionar `OfficeHours` sin conflictos horarios.
