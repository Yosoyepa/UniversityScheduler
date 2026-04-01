# Pull Request: Phase 0 - Foundation & Cross-Cutting Concerns

## 📋 Descripción

Esta PR implementa la **Fase 0** del proyecto University Scheduler, estableciendo la base arquitectónica completa para el backend (FastAPI) y frontend (Next.js).

### Problema que resuelve
- Establece la infraestructura base para desarrollo ágil de features
- Implementa patrones de Clean Architecture / Hexagonal
- Provee autenticación JWT completa
- Crea componentes reutilizables siguiendo Atomic Design

---

## 🎯 Cambios Incluidos

### Backend (FastAPI + SQLAlchemy)

| Módulo         | Descripción                                  |
| -------------- | -------------------------------------------- |
| **Database**   | Async SQLAlchemy, Alembic, 6 tablas, 5 ENUMs |
| **Exceptions** | Jerarquía de excepciones + global handler    |
| **Events**     | Domain events + InMemoryEventBus             |
| **Auth**       | User entity, JWT, 5 endpoints                |
| **Domain**     | Base Entity, Value Objects                   |

### Frontend (Next.js + TypeScript + Tailwind)

| Módulo         | Descripción                                 |
| -------------- | ------------------------------------------- |
| **Types**      | Entity types, AsyncState, Result            |
| **Services**   | API client, Auth service                    |
| **Components** | Atomic Design (atoms, molecules, templates) |

---

## 📊 Estadísticas

| Commits | Archivos | Líneas Añadidas |
| ------- | -------- | --------------- |
| 6       | 72+      | ~11,600+        |

---

## 🧪 Verificación

```bash
# Backend
cd backend && python -c "from app.main import app; print('✅ OK')"

# Database
docker-compose up -d && alembic upgrade head

# Frontend
cd frontend && npm run build  # ✅ Success
```

---

## 📝 Checklist

- [x] Código compila sin errores
- [x] Migraciones funcionan
- [x] Tests manuales pasan
- [x] Sigue convenciones del proyecto
- [x] Sin secrets en código

---

## 🔗 Branch Info

- **Source**: `feature/phase-0-foundation`
- **Target**: `develop`
- **Commits**: 6

---

**Labels**: `feature`, `phase-0`, `foundation`
