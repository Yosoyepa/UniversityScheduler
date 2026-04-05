# Use Cases Document (UC)

Este documento define los casos de uso principales del sistema University Scheduler siguiendo el formato Larman. Representa la lógica de negocio **real y verificable** implementada actualmente en el código base (v1.0.0-beta.1).

---

## Contexto: Gestión Académica (Academic Planning)

### UC-001: Crear Semestre
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona "Crear Semestre"
2. Sistema solicita: nombre, fecha inicio, fecha fin
3. Usuario completa el formulario
4. Sistema valida que fecha_fin > fecha_inicio (`CreateSemesterUseCase`)
5. Sistema persiste el semestre
6. Sistema marca este semestre como activo (desactiva el anterior si existe emitiendo `SemesterActivatedEvent`)

**Flujo Alternativo (Fechas Inválidas)**:
- 4a. Si fecha_fin <= fecha_inicio:
  - Sistema arroja `ValidationException` indicando rango de fechas inválido.
  - El frontend muestra error y el usuario vuelve al paso 3.

**Postcondiciones**: Semestre creado y marcado como activo

---

### UC-002: Crear Materia Semestral
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado, semestre activo

**Flujo Principal**:
1. Usuario selecciona "Agregar Materia"
2. Sistema solicita: nombre, créditos, tipo, profesor, color, sesiones (DayOfWeek, start_time, end_time)
3. Usuario completa el formulario y confirma.
4. Sistema ejecuta UC-003 (Detectar Conflictos) para las clases usando el `ConflictDetectionService`.
5. Sistema persiste la materia (`CreateSubjectUseCase`)
6. Sistema retorna ID de materia.

**Flujo Alternativo (Conflicto Detectado)**:
- 5a. Si hay solapamiento de horarios con otra materia inscrita:
  - Sistema arroja un error con detalles del conflicto (materia, horario).
  - Usuario debe modificar el horario o descartar.

**Postcondiciones**: Materia visible en calendario

---

### UC-003: Detectar Conflictos de Horario
**Actores**: Sistema  
**Precondiciones**: Existen materias con sesiones. Usuario intenta agregar otra sesión.

**Flujo**:
1. El `ConflictDetectionService` toma la nueva sesión.
2. Para cada sesión existente en el mismo día, evalúa la instersección matemática:
   - Compara rangos (`max(start1, start2) < min(end1, end2)`).
   - Si hay intersección de tiempo: levanta excepción de Validación con los datos del conflicto.
3. El servicio retorna silencio si está limpio, aprobando la transacción.

**Postcondiciones**: Operador sabe con 100% de certeza que no se le cruzan las clases.

---

### UC-004: Eliminar Materia
**Actores**: Estudiante  
**Precondiciones**: Materia existe y es propiedad del usuario (`user_id` match)

**Flujo Principal**:
1. Usuario selecciona "Eliminar" en una materia o desde modal.
2. Sistema solicita confirmación UI.
3. Usuario confirma.
4. Sistema ejecuta `DeleteSubjectUseCase`.
5. Repositorio Postgres elimina la materia y dispara el borrado en cascada (CASCADE) de las Tareas (`Tasks`) y Sesiones (`ClassSessions`) vinculadas.

**Postcondiciones**: Entidades erradicadas y calendario liberado.

---

## Contexto: Gestión de Tareas (Tasks)

### UC-005: Crear Tarea
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona "Nueva Tarea"
2. Sistema solicita: título, descripción, fecha límite, prioridad, categoría, materia (opcional).
3. Usuario completa y persiste la tarea con estado `TODO`.
4. Si hubiese GCal (Pospuesto a Fase 7), se dispararía la sincronía. Hoy solo se almacena localmente.

**Postcondiciones**: Tarea visible en Kanban

---

### UC-006: Cambiar Estado de Tarea (Kanban)
**Actores**: Estudiante  
**Precondiciones**: Tarea existe y pertenece al usuario.

**Flujo Principal**:
1. Usuario arrastra tarea usando DragAndDrop HTML5.
2. Sistema intercepta el payload y dispara PATCH del estado (`ChangeTaskStatusUseCase`).
3. Si el estado nuevo es `DONE`:
   - Sistema lo persiste y dispara internamente el `publish(TaskCompletedEvent)` mediante el `SyncEventBus`.
   - Nuestro `NotificationListener` oye el evento y envía una in-app Notification asíncrona de completitud.

**Postcondiciones**: Estado de Kanban sincronizado con Base de Datos y Notificaciones creadas.

---

## Contexto: Seguimiento Académico (Grades)

### UC-007: Configurar y Registrar Calificaciones
**Actores**: Estudiante
**Precondiciones**: Materia existe.

**Flujo Principal**:
1. Usuario abre sección de "Progreso".
2. Usuario agrega Criterios de Evaluación (`EvaluationCriteria` por Materia).
   - Sistema valida que la sumatoria de los Pesos (`Weight`) no supere el 100%.
3. Usuario introduce su nota obtenida en el rango 0 a 100 (configurable).
4. El dominio recalcula ponderadamente cuánto ha progresado.

**Postcondiciones**: Predicción de aprobación generada.

---

## Contexto: Interacción de Usuarios, Settings y Tutorías

### UC-008: Configurar App y Alertas
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado

**Flujo Principal**:
1. Usuario accede a `/dashboard/settings`.
2. Sistema muestra el Contexto de React actual hidratado con el GET de la API.
3. Usuario elige el Modo (Claro/Oscuro) y tiempos de alerta.
4. Se envían mutaciones a la base de datos (Entidad `Settings`).

**Postcondiciones**: Apariencia y respuestas del sistema alteradas inmediatamente.

---

### UC-009: Bookear Tutoría con Profesor
**Actores**: Estudiante
**Precondiciones**: Existe un Profesor con Horario de Oficina disponible (`OfficeHour`).

**Flujo Principal**:
1. Usuario en Directorio selecciona "Book Session".
2. Usuario escoge la Hora de Oficina y de cuál asignatura consultará dudas.
3. El frontend envía la postulación.
4. El backend verifica (`CreateTutoringSessionUseCase`) que el estudiante no tenga ninguna sesión de clase matriculada (cruce conflictivo) justo a la hora de esa asesoría.
5. Se aprueba la sesión si el horario está libre.

**Postcondiciones**: Aparece la Tutoría en el ScheduleGrid de la semana.

---

## Matriz de Casos de Uso (Estado Real)

| ID | Nombre | Módulo / Fase | Estado | Implementado En Código |
|---|---|---|:---:|:---:|
| UC-001 | Crear y Manejar Semestres | academic_planning (F1) | ✅ | Sí |
| UC-002 | CRUD Materias | academic_planning (F1) | ✅ | Sí |
| UC-003 | Detectar Conflictos | academic_planning (F1) | ✅ | Sí (`ConflictDetectionService`) |
| UC-004 | Eliminar Materia & Cascada | academic_planning (F1) | ✅ | Sí (Postgres CASCADE) |
| UC-005 | Crear Tarea | tasks (F2) | ✅ | Sí |
| UC-006 | Cambiar Estado Kanban (Drag) | tasks (F2) | ✅ | Sí (`EventBus` acoplado) |
| UC-007 | Progreso y Notas | grades (F3) | ✅ | Sí |
| UC-008 | Configurar Alertas & Tema | settings (F5) | ✅ | Sí |
| UC-009 | Programar Tutoría Validando | professors (F6) | ✅ | Sí |
| UC-010 | *Sincronizar GCal* | *tasks externa* (F7) | ⏳ | *Pospuesto Post-MVP* |
