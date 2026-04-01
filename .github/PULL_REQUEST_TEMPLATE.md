# Pull Request: Phase {{ PHASE_NUMBER }} - {{ PHASE_TITLE }}

## 📋 Descripción

{{ Breve descripción de lo que implementa esta PR y la fase del proyecto a la que corresponde. }}

### Problema que resuelve
- {{ Problema o requerimiento principal }}
- {{ Otro problema o requerimiento }}

---

## 🎯 Cambios Incluidos

### Backend (FastAPI + SQLAlchemy)

| Módulo         | Descripción                                  |
| -------------- | -------------------------------------------- |
| **{{ Módulo }}** | {{ Qué se implementó }}                    |

### Frontend (Next.js + TypeScript + Tailwind)

| Módulo         | Descripción                                 |
| -------------- | ------------------------------------------- |
| **{{ Módulo }}** | {{ Qué se implementó }}                   |

---

## 📊 Estadísticas

| Commits | Archivos | Líneas Añadidas |
| ------- | -------- | --------------- |
| {{ N }} | {{ N }}  | ~{{ N }}        |

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

- [ ] Código compila sin errores
- [ ] Migraciones funcionan
- [ ] Tests manuales pasan
- [ ] Sigue convenciones del proyecto
- [ ] Sin secrets en código

---

## 🔗 Branch Info

- **Source**: `{{ branch_name }}`
- **Target**: `develop`
- **Commits**: {{ N }}

---

**Labels**: `feature`, `phase-{{ N }}`, `{{ label }}`
