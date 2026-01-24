# Domain Events Architecture

## Overview
El sistema utiliza un bus de eventos en memoria (inicialmente) para desacoplar los distintos módulos. Esto permite que acciones en un dominio (ej. Tareas) desencadenen efectos secundarios en otros (ej. Notificaciones, Calendario) sin acoplamiento directo.

## Eventos Definidos

### Academic Context
- **SubjectCreatedEvent**: Emitido cuando se crea una nueva materia.
- **SemesterActivatedEvent**: Emitido cuando cambia el semestre activo.

### Task Context
- **TaskCompletedEvent**: Emitido al mover una tarea a DONE.
- **TaskOverdueEvent**: Emitido por un job programado cuando vence una tarea.
