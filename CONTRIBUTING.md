# Guía de Contribución para UniversityScheduler

¡Gracias por tu interés en contribuir a UniversityScheduler! Este documento detalla cómo está estructurado el proyecto y las reglas obligatorias que debes seguir para aportar código de manera limpia.

## 1. Regla de Oro: Lee las Habilidades (Skills) y el layer-rules.md

Este proyecto hace un uso exhaustivo de la **Arquitectura Hexagonal** en el Backend y **Atomic Design** junto a **App Router** en el Frontend. Dependiendo de los directorios que toques, **tienes la obligación** de leer las reglas establecidas en sus respectivas carpetas (`.rules/layer-rules.md`) y el contenido de las `Skills` correspondientes en `.agents/skills/`.
Esto te dirá qué puedes importar, qué excepciones deben levantarse, y cómo nombrar tus clases y componentes atómicos.

## 2. Compilación Pre-Commit Garantizada

Jamás debes generar un `commit` ciego. Antes de enviar tu código a la verificación, debes validar manualmente los lineamientos expuestos en `.agents/workflows/implementation.md`.

- **Frontend**: Ejecuta `npx tsc --noEmit` y obligatoriamente `npm run build`. Si `build` falla, no comprometas el código.
- **Backend**: Ejecuta `python -c "import app.main"`. Y si aplicas nuevas migraciones `alembic upgrade head`.

## 3. Atomic Commits de la Mano de GitFlow

Usamos GitFlow: tus aportes se desarrollan en ramas secundarias por feature (`phase-N/<feature>`) que apuntan hacia `develop`. 
Además todos los commits deben estructurarse atómicamente, como dictamina el skill `git-commit`. Escribe "Un commit por unidad lógica", separando modificaciones, usando las convenciones [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Ejemplos:
- `feat(auth): add google sign in provider`
- `fix(grades): correct floating point math calculation`
- `refactor(scheduler): remove dead hook in ScheduleGrid`

## 4. Estilos y Formatting

- **Frontend (TS/JS)**: Se usa Prettier y ESLint. Asegúrate de correr `npm run lint`.
- **Backend (Python)**: Se confía en tipado riguroso con `mypy` estándar. Se escriben Docs y schemas para Pydantic 2.0. Respeta el Kernel Compartido (`app.shared.*`).

Esperamos tu Pull Request con la plantilla detallada y probada al 100%. ¡Feliz Caching!
