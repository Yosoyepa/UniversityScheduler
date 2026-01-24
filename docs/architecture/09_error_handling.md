# Error Handling Strategy

## Jerarquía de Excepciones
Todas las excepciones personalizadas heredan de `BaseAppException`.

- **DomainException**: Errores de lógica de negocio (validaciones, conflictos).
- **InfrastructureException**: Fallos en sistemas externos (DB, APIs).

## Mapeo a HTTP
Un middleware global capturará estas excepciones y las transformará en respuestas JSON consistentes.

| Exception | HTTP Code | Mensaje Usuario |
| :--- | :--- | :--- |
| `ScheduleConflictException` | `409` | "El horario choca con {subject_name}" |
| `EntityNotFoundException` | `404` | "Recurso no encontrado" |
| `ExternalServiceTimeout` | `503` | "Servicio temporalmente no disponible" |
