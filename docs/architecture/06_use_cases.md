# Catálogo de Casos de Uso (Use Cases)

Este documento centraliza y describe los casos de uso principales implementados en UniversityScheduler v1.0.0-beta.1. Sigue los principios de Arquitectura Hexagonal donde los Casos de Uso (Interactors) forman la Capa de Aplicación.

## Actor Principal: Estudiante
El único actor directo del sistema (v1.0.0-beta.1) es el Estudiante Universitario autenticado, que interactúa a través del frontend (Next.js App Router) para gestionar su vida académica. El BFF (Backend for Frontend) orquesta las peticiones hacia la API principal en FastAPI.

---

## 1. Academic Planning (Fase 1)

### UC-001: Gestionar Semestres (Semesters)
- **Descripción:** El usuario puede crear, leer, actualizar o eliminar periodos académicos semestrales (ej. "2026-1").
- **Flujo Principal:** El usuario define fecha de inicio, fecha de fin y estado (Activo/Inactivo).
- **Invariante de Dominio:** Solo puede haber un semestre "Activo" a la vez por usuario.

### UC-002: Gestionar Materias (Subjects)
- **Descripción:** El usuario registra asignaturas en un Semestre específico.
- **Flujo Principal:** El usuario ingresa Nombre, Código, Créditos y Color de la materia.
- **Invariante de Dominio:** Los créditos deben ser mayores a 0, y el color debe ser un HexCode válido.

### UC-003: Programación Semanal de Clases (Class Sessions)
- **Descripción:** El usuario asigna sesiones semanales (ej. Lunes de 10:00 a 12:00) a una Materia.
- **Invariante de Dominio:** El backend valida (vía `DetectScheduleConflictsUseCase`) que la sesión a inscribir no choque en el tiempo con ninguna otra clase ni tutoría existente en el mismo ciclo.

---

## 2. Task Management (Fase 2)

### UC-004: Tareas con Ciclo de Máquina de Estado
- **Descripción:** Gestión de entregables atemporales o en fecha específica.
- **Flujo Principal:** Transiciones puras de estado: TODO -> IN_PROGRESS -> DONE -> ARCHIVED.
- **Invariante de Dominio:** Una tarea no puede pasar de TODO directamente a ARCHIVED sin cancelarse (estado adicional de flujo opcional). Emiten `TaskCompletedEvent`.

### UC-005: Visión Kanban (Reactiva)
- **Descripción:** Interacción visual drag-and-drop.
- **Flujo Principal:** Frontend calcula la nueva posición y estado, llamando asíncronamente al caso de uso de actualización y reflejando de inmediato en UI (optimistic updates).

---

## 3. Grades & Academic Progress (Fase 3)

### UC-006: Definición de Criterios de Evaluación
- **Descripción:** Cada materia puede subdividir su progreso (ej. Parcial 1: 30%, Parcial 2: 30%, Final: 40%).
- **Invariante de Dominio:** La suma total de los pesos dentro de una misma Materia no debe superar el 100%.

### UC-007: Cálculo de Promedio Ponderado
- **Descripción:** Registro de notas y predicciones.
- **Invariante de Dominio:** Las notas se registran en una escala predefinida (0.0 a 5.0 o 0 a 100 dependiendo de UserSettings). El `CalculateSubjectAverageUseCase` realiza matemática pura validando pesos para determinar si el estudiante reprueba o aprueba proyectadamente.

---

## 4. Authentication (Fase 4)

### UC-008: Autenticación por JWT
- **Flujo Principal:** El usuario se registra (`/register`) e inicia sesión (`/login`). El backend emite un JWT.
- **Seguridad:** El App Router actúa como guardián intermedio inyectando el token por Authorization Header.

---

## 5. Settings & Notifications (Fase 5)

### UC-009: Configuración Global (User Settings)
- **Descripción:** Mutación de las preferencias de aplicación (Dark Mode default, Escala de notas preferida, Reminder Time de tareas).
- **Flujo Principal:** Aplicación de preferencias en el fronten vía Context API.

### UC-010: Lifecycle de Notificaciones (Event-Driven)
- **Descripción:** Recepción y lectura (Mark As Read) de alertas.
- **Flujo Principal:** Si el EventBus dispara un evento (ej. `TaskOverdueEvent`), el `NotificationListener` guarda de forma asíncrona una entrada de `Notification` para notificar al usuario.

---

## 6. Professor Directory & Tutoring (Fase 6)

### UC-011: Directorio Académico
- **Descripción:** Centralización de contacto de los docentes.
- **Invariante de Dominio:** Cada materia puede tener vinculado de forma opcional un Profesor.

### UC-012: Horarios de Oficina y Tutorías
- **Descripción:** Programación de citas individuales con los profesores.
- **Invariante de Dominio:** Las Tutorías (Tutoring Sessions) se incrustan en el horario semanal analizando conflictos tanto con otras sesiones de clase regulares como con otras tutorías activas.
