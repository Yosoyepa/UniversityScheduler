# Guía de Contribución — UniversityScheduler

Las contribuciones al proyecto son bienvenidas. Este documento describe los prerrequisitos, las convenciones de código y el proceso para abrir un Pull Request.

---

## 1. Configuración del Entorno de Desarrollo

Seguir la **[Guía de Inicio](docs/GETTING_STARTED.md)** para instalar los prerrequisitos y levantar el stack localmente.

Herramientas adicionales para desarrollo activo:

**Backend**:
- `mypy` para verificación estática de tipos Python. Ejecutar con `mypy app/` desde `backend/`.
- Respetar las anotaciones de tipo en todas las funciones nuevas (parámetros y retorno).

**Frontend**:
- ESLint está configurado en `frontend/eslint.config.mjs`. Ejecutar con `npm run lint`.
- Verificar tipos TypeScript con `npx tsc --noEmit` antes de cada commit.

---

## 2. Reglas de Arquitectura

Este proyecto aplica reglas estrictas de capas. Antes de tocar código, leer las reglas del directorio correspondiente (`.rules/layer-rules.md`) y los skills en `.agents/skills/`.

**Backend (Arquitectura Hexagonal)**:
- La capa `domain/` no puede importar FastAPI, SQLAlchemy, ni ningún SDK de nube.
- La capa `application/` solo importa de `domain/` y `port/`.
- Los routers (`adapter/router.py`) son controladores delgados: no contienen lógica de negocio.
- Las nuevas excepciones deben usar la jerarquía de `app.shared.domain.exceptions`. Ver [09_error_handling.md](docs/architecture/09_error_handling.md).

**Frontend (Atomic Design)**:
- Los atoms y molecules no importan desde `features/`.
- Los organisms pueden consumir hooks de `features/`.
- Los templates no contienen lógica de negocio ni llamadas a hooks de datos.
- Ver [10_frontend_architecture.md](docs/architecture/10_frontend_architecture.md) para la tabla de criterios de clasificación.

---

## 3. Convención de Ramas (GitFlow)

| Rama | Propósito |
| :--- | :--- |
| `main` | Producción. Solo recibe merges de `release/*` o `hotfix/*`. |
| `develop` | Integración continua. Objetivo de los PRs de features. |
| `phase-N/nombre-del-feature` | Ramas de desarrollo activo. |
| `hotfix/descripcion` | Corrección crítica sobre `main`. |

**Ejemplos de nombres de rama**:
- `phase-7/google-calendar-sync`
- `phase-8/unit-tests-conflict-detection`
- `hotfix/fix-jwt-expiration-edge-case`

---

## 4. Commits Atómicos y Conventional Commits

Cada commit debe representar una unidad lógica de cambio. No mezclar refactorizaciones con nuevas funcionalidades en el mismo commit.

Formato: `tipo(scope): descripción en imperativo`

| Tipo | Uso |
| :--- | :--- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Cambio de código sin cambio de comportamiento |
| `test` | Agregar o modificar pruebas |
| `docs` | Cambios de documentación |
| `chore` | Tareas de mantenimiento (dependencias, CI, configuración) |
| `style` | Cambios de formato o estilo visual |

**Ejemplos**:
```
feat(professors): add tutoring session booking endpoint
fix(grades): correct weighted average when criteria weight sums to zero
refactor(tasks): extract state machine to domain entity method
test(conflict-detection): add unit test for adjacent time slots edge case
docs(api): document professors module endpoints
```

---

## 5. Checklist del Autor antes de Abrir un PR

Completar todas las verificaciones antes de abrir el Pull Request:

- [ ] El módulo del backend importa sin errores: `python -c "import app.main"`
- [ ] Las migraciones de Alembic están aplicadas: `alembic upgrade head`
- [ ] Sin errores de tipo en TypeScript: `npx tsc --noEmit`
- [ ] Sin errores de linting: `npm run lint`
- [ ] El build de producción del frontend pasa: `npm run build`
- [ ] Los unit tests existentes no tienen regresiones: `pytest tests/unit/ -v`
- [ ] Si se agregó lógica de dominio nueva, tiene al menos un unit test.
- [ ] Si se agregó un endpoint nuevo, está documentado en `docs/api/`.
- [ ] Los nuevos commits siguen el formato Conventional Commits.
- [ ] El PR apunta a la rama `develop`, no a `main`.

---

## 6. Proceso de Revisión

- Se requiere al menos **un aprobador** antes de hacer merge a `develop`.
- El CI debe pasar (cuando esté configurado) antes de que sea posible el merge.
- Responder los comentarios del revisor antes de solicitar una nueva revisión.
- No hacer force-push a una rama con PR abierto sin avisar al revisor.

---

## 7. Estilo de Código

**Backend (Python)**:
- Tipado estricto en todas las funciones (parámetros y retorno).
- Docstrings en clases de dominio y use cases.
- Sin lógica de negocio en los routers (`adapter/router.py`).
- Schemas de Pydantic 2.0 para todos los request/response bodies.

**Frontend (TypeScript)**:
- Sin uso de `any` explícito.
- Componentes tipados con interfaces o types (no inline objects sin tipo).
- Hooks de feature retornan objetos tipados con estado y funciones de mutación.
- El cliente HTTP (`api-client.ts`) es el único punto de contacto con el backend.

---

*Ante cualquier duda sobre la arquitectura o las convenciones, abrir un issue en el repositorio antes de comenzar la implementación.*
