# Estrategia de Pruebas

Este documento describe la pirámide de pruebas de UniversityScheduler, las herramientas utilizadas, las convenciones de nomenclatura y los comandos para ejecutar cada nivel.

---

## Pirámide de Pruebas

| Nivel | Proporción objetivo | Herramienta | Requiere infraestructura |
| :--- | :--- | :--- | :--- |
| Unit Tests | 60% | `pytest` | No |
| Integration Tests | 30% | `pytest-asyncio` + PostgreSQL real | Sí (Docker) |
| E2E Tests | 10% | `playwright` | Sí (stack completo) |

**Justificación**: Los unit tests son los más baratos de ejecutar y los que prueban el valor real del sistema: la lógica de dominio pura (`ConflictDetectionService`, máquina de estados de tareas, cálculo de promedio ponderado). Los integration tests validan que el código interactúa correctamente con PostgreSQL. Los E2E tests son los más costosos pero los únicos que garantizan que el flujo completo usuario-browser-API-DB funciona.

---

## Unit Tests (Backend)

**Ubicación**: `backend/tests/unit/`

**Herramientas**: `pytest`, `pytest-asyncio`, `unittest.mock`

**Qué probar**: entidades de dominio y servicios de dominio puro. Sin acceso a base de datos, sin llamadas HTTP, sin efectos secundarios.

### Convención de nomenclatura

- Archivos: `test_{modulo}_{componente}.py`
  - Ejemplo: `test_academic_planning_conflict_detection.py`
- Funciones: `test_{método_bajo_prueba}_{escenario}_{resultado_esperado}`
  - Ejemplo: `test_check_conflicts_same_day_overlap_raises_exception`

### Ejemplos de casos de prueba

```python
# ConflictDetectionService
def test_check_conflicts_same_day_full_overlap_raises_schedule_conflict_exception()
def test_check_conflicts_same_day_partial_overlap_raises_schedule_conflict_exception()
def test_check_conflicts_adjacent_times_no_conflict()
def test_check_conflicts_different_day_no_conflict()

# Task — máquina de estados
def test_task_transition_todo_to_in_progress_valid()
def test_task_transition_in_progress_to_done_emits_task_completed_event()
def test_task_transition_done_to_todo_raises_invalid_entity_state_exception()
def test_task_transition_archived_to_any_state_raises_invalid_entity_state_exception()

# Cálculo de promedio ponderado
def test_weighted_average_single_criterion_full_score()
def test_weighted_average_multiple_criteria_partial_scores()
def test_weighted_average_no_grades_returns_zero()
```

### Convención de mocks

En unit tests, todo lo externo a la clase bajo prueba se reemplaza con `unittest.mock`:

```python
from unittest.mock import AsyncMock, MagicMock

# Repositorios: reemplazar con AsyncMock
mock_repo = AsyncMock(spec=ISubjectRepository)
mock_repo.find_by_semester.return_value = [existing_subject]

# Event bus: reemplazar con SyncEventBus limpio
from app.shared.domain.events import SyncEventBus
event_bus = SyncEventBus()
```

### Comandos

```bash
cd backend

# Ejecutar todos los unit tests con output detallado
pytest tests/unit/ -v

# Ejecutar un archivo específico
pytest tests/unit/test_academic_planning_conflict_detection.py -v

# Ejecutar con cobertura de código
pytest tests/unit/ --cov=app --cov-report=term-missing
```

---

## Integration Tests (Backend)

**Ubicación**: `backend/tests/integration/`

**Herramientas**: `pytest-asyncio`, instancia real de PostgreSQL (via Docker Compose)

**Prerrequisito**: el servicio `postgres` de Docker Compose debe estar activo antes de ejecutar estas pruebas.

**Qué probar**: repositorios PostgreSQL reales. Que las queries SQL retornan los datos correctos. Que las restricciones de la base de datos (CASCADE, UNIQUE, CHECK) funcionan como se espera. Que las migraciones de Alembic son coherentes con los modelos SQLAlchemy.

### Ejemplos de casos de prueba

```python
# PostgresSubjectRepository
async def test_create_subject_persists_and_returns_entity()
async def test_find_subjects_by_semester_filters_correctly()
async def test_delete_subject_cascades_to_class_sessions()

# PostgresTaskRepository
async def test_list_tasks_by_status_returns_only_matching_status()
async def test_update_task_status_to_done_sets_completed_at()

# PostgresNotificationRepository
async def test_mark_all_notifications_read_updates_only_user_notifications()
```

### Comandos

```bash
# Asegurarse que PostgreSQL está corriendo
docker compose up postgres -d

cd backend

# Ejecutar todos los integration tests
pytest tests/integration/ -v

# Ejecutar con timeout extendido (las pruebas de DB pueden ser lentas en CI)
pytest tests/integration/ -v --timeout=30
```

---

## E2E Tests (Frontend + Backend)

**Ubicación**: `frontend/e2e/`

**Herramienta**: Playwright (`@playwright/test` v1.59+)

**Prerrequisito**: el stack completo debe estar activo (backend en `http://localhost:8000`, frontend en `http://localhost:3000`).

**Qué probar**: flujos críticos de usuario completos a través de un browser real. Son los únicos tests que verifican la integración completa desde el browser hasta la base de datos.

### Flujos E2E prioritarios

| Flujo | Descripción |
| :--- | :--- |
| **Autenticación** | Registro de nueva cuenta → Login → Ver dashboard con nombre del usuario |
| **Planificación** | Login → Crear semestre → Crear materia con sesiones → Verificar aparición en ScheduleGrid |
| **Conflicto horario** | Crear materia → Intentar crear otra con horario solapado → Verificar modal de error con detalles del conflicto |
| **Kanban** | Login → Crear tarea → Mover a IN_PROGRESS → Verificar estado → Mover a DONE → Verificar notificación |

### Comandos

```bash
# Con el stack ya corriendo en :3000 y :8000:
cd frontend

# Ejecutar todos los tests E2E en modo headless
npx playwright test

# Ejecutar en modo headed (con browser visible) para depuración
npx playwright test --headed

# Ejecutar un archivo de test específico
npx playwright test e2e/auth.spec.ts --headed

# Ver el reporte HTML tras la ejecución
npx playwright show-report
```

---

## Pre-Commit (Verificaciones Obligatorias)

Antes de cada commit, ejecutar las siguientes verificaciones. Un commit que no las pasa no debe subirse al repositorio.

```bash
# Backend: verificar que el módulo importa sin errores
cd backend && python -c "import app.main"

# Backend: aplicar migraciones si se modificaron modelos
cd backend && alembic upgrade head

# Frontend: verificar tipos TypeScript
cd frontend && npx tsc --noEmit

# Frontend: verificar linting
cd frontend && npm run lint

# Frontend: verificar que el build de producción pasa
cd frontend && npm run build
```

---

## Estructura de Carpetas de Test

```
backend/
└── tests/
    ├── unit/
    │   ├── test_academic_planning_conflict_detection.py
    │   ├── test_tasks_state_machine.py
    │   └── test_academic_progress_weighted_average.py
    └── integration/
        ├── test_postgres_subject_repository.py
        ├── test_postgres_task_repository.py
        └── test_postgres_notification_repository.py

frontend/
└── e2e/
    ├── auth.spec.ts
    ├── schedule.spec.ts
    ├── tasks.spec.ts
    └── professors.spec.ts
```
