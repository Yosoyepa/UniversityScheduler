# Arquitectura de Eventos de Dominio

Este documento describe el sistema de eventos de dominio de UniversityScheduler: el bus de eventos, los eventos definidos, los listeners activos y las instrucciones para extender el sistema.

Para el contexto de la decisión de arquitectura, ver [00_decisions.md](00_decisions.md) (ADR-006).

---

## Visión General

El sistema utiliza un bus de eventos en memoria para desacoplar los módulos del backend. Cuando un módulo realiza una acción de negocio significativa (una tarea se completa, un semestre se activa), publica un evento. Otros módulos pueden suscribirse a esos eventos a través de listeners sin que el emisor conozca la existencia del receptor.

```
[Use Case]
    │
    └─── publish(TaskCompletedEvent) ──► [SyncEventBus]
                                              │
                                    ┌─────────┴──────────┐
                                    ▼                    ▼
                           [NotificationListener]  [GCalSyncListener]
                           (activo en beta.2)       (planificado, Phase 7)
```

---

## Implementación del Bus

**Ubicación**: `backend/app/shared/domain/events.py`

El puerto abstracto `IEventBus` define el contrato:

```python
class IEventBus(ABC):
    @abstractmethod
    def subscribe(self, event_type: type, handler: Callable) -> None: ...

    @abstractmethod
    def publish(self, event: DomainEvent) -> None: ...
```

La implementación concreta `SyncEventBus` ejecuta todos los handlers registrados para el tipo de evento de forma sincrónica en el mismo hilo. Los errores en los handlers son capturados y logueados; no propagan hacia el use case que publicó el evento.

**Registro de listeners**: `backend/app/cross_cutting/event_registration.py`. Este archivo se invoca en el startup de la aplicación FastAPI (`app/main.py`) y llama a `event_bus.subscribe()` para cada par evento-handler.

---

## Invariantes del Sistema de Eventos

1. **Eventos son inmutables**: son dataclasses sin mutación después de la creación.
2. **Los errores en handlers no propagan**: un fallo en `NotificationListener` no revierte la operación del use case ni genera un error HTTP.
3. **Sincrónico en beta**: el handler se ejecuta antes de que el use case retorne. El cliente recibe la respuesta HTTP solo después de que todos los handlers terminaron.
4. **Sin persistencia de eventos**: si la aplicación falla durante el procesamiento de un handler, el evento se pierde. Aceptado para el MVP.

---

## Tabla de Eventos Definidos

| Evento | Emitido por | Listener(s) activo(s) | Efecto | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `TaskCompletedEvent` | `UpdateTaskStatusUseCase` (al pasar a DONE) | `NotificationListener` | Crea una notificación in-app persistente en la tabla `notifications` | Activo |
| `SemesterActivatedEvent` | `CreateSemesterUseCase` / `ActivateSemesterUseCase` | Ninguno activo (solo log) | Futuro: archivar datos del semestre anterior | Planificado |
| `SubjectCreatedEvent` | `CreateSubjectUseCase` | `GCalSyncListener` | Futuro: crear eventos recurrentes en Google Calendar | Planificado (Phase 7) |
| `TaskOverdueEvent` | Job programado (no implementado en beta) | `NotificationListener` | Futuro: crear alerta de tarea vencida | Planificado |

---

## Flujo Detallado: TaskCompletedEvent

```
1. Cliente: PATCH /api/v1/tasks/{id}/status  {"status": "DONE"}
2. Router: llama a UpdateTaskStatusUseCase
3. Use Case:
   a. Carga la entidad Task del repositorio
   b. Llama a task.complete()  →  status=DONE, registra completed_at
   c. Persiste la tarea actualizada en PostgreSQL
   d. Publica: event_bus.publish(TaskCompletedEvent(task_id, user_id, title))
4. SyncEventBus: llama a NotificationListener.handle(event)
5. NotificationListener:
   a. Crea entidad Notification
   b. Persiste en tabla notifications
6. Bus retorna; Use Case retorna la tarea al Router
7. Router: HTTP 200 OK al cliente
```

---

## Cómo Registrar un Nuevo Listener

**Paso 1**: Crear la clase listener en el módulo correspondiente.

```python
# backend/app/cross_cutting/my_listener.py
from app.shared.domain.events import TaskCompletedEvent

class MyNewListener:
    def handle(self, event: TaskCompletedEvent) -> None:
        # lógica del listener
        pass
```

**Paso 2**: Registrar el listener en `event_registration.py`.

```python
from app.cross_cutting.my_listener import MyNewListener

def register_event_listeners(event_bus: IEventBus) -> None:
    # registro existente...
    event_bus.subscribe(TaskCompletedEvent, existing_listener.handle)

    # nueva suscripción:
    my_listener = MyNewListener()
    event_bus.subscribe(TaskCompletedEvent, my_listener.handle)
```

---

## Cómo Definir un Nuevo Evento de Dominio

Los eventos se definen como dataclasses en `app/shared/domain/events.py`:

```python
@dataclass
class MyNewEvent(DomainEvent):
    entity_id: UUID
    user_id: UUID
    # campos adicionales
```

El use case que emite el evento lo publica:

```python
event_bus.publish(MyNewEvent(entity_id=..., user_id=...))
```

---

## Cómo Reemplazar SyncEventBus en Producción

1. Crear `RabbitMQEventBus(IEventBus)` en la capa de infraestructura del Shared Kernel.
2. Implementar `subscribe()` y `publish()` usando el SDK del broker.
3. En `app/main.py`, instanciar `RabbitMQEventBus` en lugar de `SyncEventBus`.

El dominio, los use cases y los listeners no requieren ningún cambio.
