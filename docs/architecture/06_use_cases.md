# Use Cases Document (UC)

Este documento define los casos de uso principales del sistema University Scheduler siguiendo el formato Larman.

---

## Contexto: Gestión Académica (Academic Planning)

### UC-001: Crear Semestre
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona "Crear Semestre"
2. Sistema solicita: nombre, fecha inicio, fecha fin
3. Usuario completa el formulario
4. Sistema valida que fecha_fin > fecha_inicio
5. Sistema persiste el semestre
6. Sistema marca este semestre como activo (desactiva el anterior si existe)

**Flujo Alternativo (Fechas Inválidas)**:
- 4a. Si fecha_fin <= fecha_inicio:
  - Sistema muestra error "La fecha de fin debe ser posterior a la de inicio"
  - Volver al paso 3

**Postcondiciones**: Semestre creado y marcado como activo

---

### UC-002: Crear Materia Semestral
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado, semestre activo

**Flujo Principal**:
1. Usuario selecciona "Agregar Materia"
2. Sistema solicita: nombre, créditos, tipo, profesor, color
3. Usuario completa el formulario
4. Usuario confirma
5. Sistema ejecuta UC-003 (Detectar Conflictos) para las sesiones
6. Sistema persiste la materia
7. Sistema retorna ID de materia

**Flujo Alternativo (Conflicto Detectado)**:
- 5a. Si hay solapamiento de horarios:
  - Sistema muestra conflicto con detalles (materia, horario)
  - Usuario puede descartar o modificar horario
  - Reintentar desde paso 4

**Postcondiciones**: Materia visible en calendario

---

### UC-003: Detectar Conflictos de Horario
**Actores**: Sistema  
**Precondiciones**: Materia A existe, Usuario intenta agregar Materia B

**Flujo**:
1. Para cada sesión de B:
   - Buscar sesiones existentes en el mismo día
   - Comparar rangos de tiempo (start_time, end_time)
   - Si hay intersección > 0 minutos: registrar CONFLICTO
2. Retornar lista de conflictos (vacía si no hay)

**Postcondiciones**: Lista de conflictos disponible para el llamador

---

### UC-004: Editar Materia
**Actores**: Estudiante  
**Precondiciones**: Materia existe

**Flujo Principal**:
1. Usuario selecciona una materia del calendario
2. Sistema muestra modal con datos actuales
3. Usuario modifica campos (nombre, créditos, profesor, sesiones)
4. Usuario confirma
5. Sistema ejecuta UC-003 para validar nuevas sesiones
6. Sistema actualiza la materia

**Postcondiciones**: Materia actualizada en BD y calendario

---

### UC-005: Eliminar Materia
**Actores**: Estudiante  
**Precondiciones**: Materia existe

**Flujo Principal**:
1. Usuario selecciona "Eliminar" en una materia
2. Sistema solicita confirmación
3. Usuario confirma
4. Sistema elimina materia y sus sesiones (CASCADE)
5. Sistema actualiza calendario

**Postcondiciones**: Materia y sesiones eliminadas

---

## Contexto: Gestión de Tareas (Tasks)

### UC-006: Crear Tarea
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado

**Flujo Principal**:
1. Usuario selecciona "Nueva Tarea"
2. Sistema solicita: título, descripción, fecha límite, prioridad, categoría, materia (opcional)
3. Usuario completa el formulario
4. Usuario confirma
5. Sistema persiste tarea con estado TODO
6. Si prioridad = HIGH y usuario tiene GCal vinculado, ejecutar UC-008

**Postcondiciones**: Tarea visible en tablero Kanban

---

### UC-007: Cambiar Estado de Tarea (Kanban)
**Actores**: Estudiante  
**Precondiciones**: Tarea existe

**Flujo Principal**:
1. Usuario arrastra tarea a nueva columna (TODO → IN_PROGRESS → DONE)
2. Sistema actualiza estado de la tarea
3. Si nuevo estado = DONE:
   - Sistema registra fecha de completado
   - Sistema emite evento TaskCompletedEvent

**Postcondiciones**: Estado actualizado, listeners notificados

---

### UC-008: Sincronizar con Google Calendar
**Actores**: Sistema  
**Precondiciones**: Cuenta de Google vinculada, tarea de alta prioridad

**Flujo Principal**:
1. Sistema obtiene credenciales OAuth del usuario
2. Sistema construye evento con datos de la tarea
3. Sistema envía POST a Google Calendar API
4. Google retorna ID de evento
5. Sistema guarda external_id en la tarea
6. Sistema marca is_synced_gcal = true

**Flujo Alternativo (Token Expirado)**:
- 1a. Si token expirado:
  - Intentar refresh token
  - Si falla, notificar al usuario para re-autenticar

**Postcondiciones**: Evento creado en Google Calendar

---

## Contexto: Configuración de Usuario (Users/Settings)

### UC-009: Configurar Preferencias de Alertas
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado

**Flujo Principal**:
1. Usuario accede a "Configuración"
2. Sistema muestra preferencias actuales
3. Usuario modifica:
   - Notificaciones por email (on/off)
   - Tiempos de alerta (ej. 1 día antes, 1 hora antes)
   - Modo oscuro
4. Usuario guarda cambios
5. Sistema persiste en tabla `settings`

**Postcondiciones**: Preferencias actualizadas

---

### UC-010: Ver Progreso Académico
**Actores**: Estudiante  
**Precondiciones**: Usuario autenticado, tareas existen

**Flujo Principal**:
1. Usuario accede a "Progreso Académico"
2. Sistema calcula métricas:
   - Tareas completadas vs pendientes por materia
   - Porcentaje de avance del semestre
3. Sistema muestra gráficos y estadísticas

**Postcondiciones**: Dashboard de progreso visible

---

### UC-011: Consultar Directorio de Profesores
**Actores**: Estudiante  
**Precondiciones**: Materias con profesores asignados

**Flujo Principal**:
1. Usuario accede a "Profesores"
2. Sistema lista profesores únicos de las materias del usuario
3. Usuario puede filtrar por nombre
4. Usuario selecciona un profesor para ver detalles (materias que imparte)

**Postcondiciones**: Información del profesor visible

---

## Matriz de Casos de Uso

| ID | Nombre | Módulo | Prioridad | Estado |
|---|---|---|---|---|
| UC-001 | Crear Semestre | academic_planning | Alta | ⏳ |
| UC-002 | Crear Materia | academic_planning | Alta | ⏳ |
| UC-003 | Detectar Conflictos | academic_planning | Alta | ⏳ |
| UC-004 | Editar Materia | academic_planning | Media | ⏳ |
| UC-005 | Eliminar Materia | academic_planning | Media | ⏳ |
| UC-006 | Crear Tarea | tasks | Alta | ⏳ |
| UC-007 | Cambiar Estado Kanban | tasks | Alta | ⏳ |
| UC-008 | Sincronizar GCal | tasks | Baja | ⏳ |
| UC-009 | Configurar Alertas | users | Media | ⏳ |
| UC-010 | Ver Progreso | users | Baja | ⏳ |
| UC-011 | Directorio Profesores | users | Baja | ⏳ |
