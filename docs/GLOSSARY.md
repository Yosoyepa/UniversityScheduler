# Glosario de Términos

Este documento define la terminología ubicua (Ubiquitous Language) utilizada en el proyecto University Scheduler para asegurar una comunicación clara entre desarrolladores y expertos del dominio.

## Dominio Académico

### Materia (Subject)
Unidad académica o curso que un estudiante inscribe en un semestre (ej. "Cálculo I", "Historia del Arte").
- **Disciplinar Obligatoria**: Materia requerida por el plan de estudios.
- **Libre Elección**: Materia opcional elegida por interés personal.

### Sesión de Clase (Class Session)
Bloque de tiempo específico asignado a una materia en el horario semanal.
- *Ejemplo*: "Lunes de 08:00 a 10:00 en el Salón 101".
- Una materia suele tener múltiples sesiones por semana.

### Semestre (Semester)
Período académico definido por una fecha de inicio y fin (ej. "2024-1").
- **Semestre Activo**: El período actual sobre el cual se realizan validaciones de horario.
- Un usuario solo puede tener un semestre marcado como activo a la vez.

### Crédito Académico
Unidad de medida del trabajo académico. Se utiliza para calcular la carga total del estudiante.

### Conflicto Horario (Schedule Conflict)
Condición inválida donde dos sesiones de clase ocupan el mismo intervalo de tiempo (solapamiento parcial o total) en el mismo día de la semana.

## Gestión de Tareas

### Tarea (Task)
Unidad de trabajo que el estudiante debe completar.
- Puede estar vinculada a una **Materia** específica o ser general.
- Tiene estados definidos por el flujo Kanban.

### Kanban States
- **TODO**: Tarea creada pero no iniciada.
- **IN_PROGRESS**: Tarea en curso.
- **DONE**: Tarea completada.

### Prioridad
Nivel de urgencia de una tarea (`LOW`, `MEDIUM`, `HIGH`). Las tareas `HIGH` pueden desencadenar notificaciones más agresivas o sincronización con calendario externo.

## Arquitectura y Técnica

### Hexagonal Architecture (Ports & Adapters)
Estilo arquitectónico que aísla la lógica de negocio (Dominio) de los detalles técnicos (Infraestructura).

### Port (Puerto)
Interfaz (clase abstracta en Python) que define un contrato para interactuar con el mundo exterior (ej. `ISubjectRepository`).

### Adapter (Adaptador)
Implementación concreta de un puerto (ej. `PostgresSubjectRepository`).

### DTO (Data Transfer Object)
Objeto simple utilizado para transferir datos entre las capas de la aplicación (ej. del Controller al UseCase), sin lógica de negocio.
