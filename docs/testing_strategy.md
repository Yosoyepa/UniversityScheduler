# Testing Strategy

## Niveles de Prueba

### 1. Unit Tests (60%)
- **Foco**: Lógica de dominio pura (`Subject.checkConflict`, `Task.isOverdue`).
- **Herramientas**: `pytest`.
- **Mocking**: Todo lo externo a la clase bajo prueba.

### 2. Integration Tests (30%)
- **Foco**: Repositorios y Adapters.
- **Herramientas**: `testcontainers` (Postgres real), `pytest-asyncio`.
- **Estrategia**: Verificar que las queries SQL y llamadas a APIs funcionen.

### 3. E2E Tests (10%)
- **Foco**: Flujos críticos de usuario (Login -> Add Subject -> Verify Calendar).
- **Herramientas**: `Playwright` (contra API y Frontend corriendo).
