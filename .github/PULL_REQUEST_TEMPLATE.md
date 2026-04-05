# Pull Request: Phase {{ PHASE_NUMBER }} - {{ PHASE_TITLE }}

## 📋 Descripción

{{ Breve descripción de lo que implementa esta PR y la fase del proyecto a la que corresponde. Relacionando esto a la especificación de Larman Use Cases si aplica. }}

Fixes # (issue)

## Tipo de cambio

Por favor, borra las opciones que no sean relevantes.

- [ ] 🐛 Bug fix (cambio sin ruptura que arregla un problema)
- [ ] ✨ New feature (cambio sin ruptura que añade funcionalidad)
- [ ] 💥 Breaking change (fix o feature que causaría que la funcionalidad existente no funcione según lo esperado)
- [ ] 📝 Cambio en la documentación

---

## 🎯 Cambios Incluidos

### Backend (FastAPI + SQLAlchemy)

| Módulo         | Descripción                                  |
| -------------- | -------------------------------------------- |
| **{{ Módulo }}** | {{ Qué se implementó e.g., Puertos, Adaptadores, EventBus emit }} |

### Frontend (Next.js + TypeScript + Tailwind)

| Módulo         | Descripción                                 |
| -------------- | ------------------------------------------- |
| **{{ Módulo }}** | {{ Qué se implementó e.g., Atom, Organism, Hook }}                   |

---

## 📊 Estadísticas

| Commits | Archivos | Líneas Añadidas |
| ------- | -------- | --------------- |
| {{ N }} | {{ N }}  | ~{{ N }}        |

---

## 🧪 Verificación Obligatoria y Checklist (Pre-Commit Workflow)

Por favor, describe y verifica las pruebas estáticas realizadas ANTES del commit.

- [ ] He revisado mi código según la regla Clean Code y **Atomic Design/Hexagonal Architecture**.
- [ ] Backend: `python -c "import app.main"` ejecutado correctamente (No hay imports sueltos). ✅
- [ ] Base de Datos: Verifiqué si hace falta un `alembic upgrade head`.
- [ ] Frontend Types: `npx tsc --noEmit` superado. ✅
- [ ] Frontend Build: `npm run build` genera la build de Next.js sin errores de React Hydration ni rutas muertas. ✅
- [ ] Frontend E2E: Ejecuté `npx playwright test` de haber impactado flujos de UI troncales.
- [ ] Todo el tracking `.implementation_tasks` fue actualizado con las casillas `[x]`.
- [ ] El commit se generó via el entorno automatizado (Skill `git-commit`).

---

## 🔗 Branch Info

- **Source**: `{{ branch_name }}`
- **Target**: `develop`
- **Commits**: {{ N }}

**Labels**: `feature`, `phase-{{ N }}`, `{{ label }}`
