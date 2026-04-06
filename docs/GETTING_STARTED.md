# Guía de Inicio — UniversityScheduler

Esta guía cubre la configuración del entorno de desarrollo desde cero, incluyendo prerrequisitos, variables de entorno, instrucciones de instalación y ejecución de pruebas.

---

## Prerrequisitos

| Herramienta | Versión mínima | Verificación |
| :--- | :--- | :--- |
| Docker Desktop | 24.0 | `docker --version` |
| Docker Compose | v2 | `docker compose version` |
| Python | 3.13 | `python --version` |
| Node.js | 20 LTS | `node --version` |
| Git | 2.40+ | `git --version` |

> Python y Node.js solo son necesarios si se desea ejecutar el backend o frontend fuera de Docker (modo desarrollo nativo con hot-reload). Para el inicio con Docker no se requieren localmente.

---

## Variables de Entorno

### Backend (`backend/.env`)

Crear el archivo `backend/.env` con los siguientes valores. El archivo no debe enviarse al repositorio (está en `.gitignore`).

```dotenv
# Base de datos PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=university_scheduler

# Autenticación JWT
SECRET_KEY=dev-only-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Modo debug
DEBUG=False
```

Descripción de cada variable:

| Variable | Descripción | Requerida en producción |
| :--- | :--- | :--- |
| `POSTGRES_USER` | Usuario del servidor PostgreSQL | Sí |
| `POSTGRES_PASSWORD` | Contraseña del servidor PostgreSQL | Sí |
| `POSTGRES_SERVER` | Host del servidor PostgreSQL | Sí |
| `POSTGRES_PORT` | Puerto de conexión (por defecto `5432`) | No |
| `POSTGRES_DB` | Nombre de la base de datos | Sí |
| `SECRET_KEY` | Clave HMAC para firma de tokens JWT. Debe ser aleatoria y larga en producción | Sí — rotar antes del despliegue |
| `ALGORITHM` | Algoritmo de firma JWT (por defecto `HS256`) | No |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración en minutos del access token (por defecto `60`) | No |
| `DEBUG` | Activa el modo debug de FastAPI. Nunca `True` en producción | No |

> En producción, `SECRET_KEY` debe generarse con: `python -c "import secrets; print(secrets.token_hex(32))"`.

### Frontend (`frontend/.env.local`)

Crear el archivo `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend. En producción, apunta al servidor desplegado |

---

## Inicio con Docker (método recomendado)

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/UniversityScheduler.git
cd UniversityScheduler

# 2. Crear los archivos de variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con los valores correspondientes

# 3. Levantar el servicio PostgreSQL en segundo plano
docker compose up postgres -d

# 4. Aplicar las migraciones de base de datos
cd backend
alembic upgrade head
cd ..

# 5. Dar permisos de ejecución al script de inicio y lanzar el stack
chmod +x start_dev.sh
./start_dev.sh
```

El script `start_dev.sh` inicia el servidor FastAPI (puerto `8000`) y el servidor de desarrollo Next.js (puerto `3000`).

---

## Servicios Activos

| Servicio | URL | Descripción |
| :--- | :--- | :--- |
| Frontend (Next.js) | http://localhost:3000 | Interfaz de usuario |
| Backend API (FastAPI) | http://localhost:8000 | API REST |
| Documentación Swagger | http://localhost:8000/docs | Interfaz interactiva OpenAPI |
| Documentación ReDoc | http://localhost:8000/redoc | Documentación alternativa |
| Health check | http://localhost:8000/api/v1/health | Estado del servidor |

### Verificación de la instalación

```bash
curl http://localhost:8000/api/v1/health
```

Respuesta esperada:

```json
{"status": "ok"}
```

---

## Inicio en Modo Desarrollo Nativo (sin Docker para el stack de aplicación)

Este modo permite hot-reload nativo tanto en el backend como en el frontend.

### Backend

```bash
cd backend

# Crear y activar entorno virtual
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Aplicar migraciones (requiere PostgreSQL activo via Docker o local)
alembic upgrade head

# Iniciar el servidor con hot-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm run dev
```

---

## Migraciones de Base de Datos (Alembic)

El proyecto usa Alembic para gestionar la evolución del esquema de PostgreSQL. Los archivos de migración se encuentran en `backend/alembic/versions/`.

```bash
cd backend

# Aplicar todas las migraciones pendientes (avanzar al estado más reciente)
alembic upgrade head

# Ver el estado actual de las migraciones aplicadas
alembic current

# Ver el historial de migraciones disponibles
alembic history

# Revertir la última migración aplicada
alembic downgrade -1

# Generar una nueva migración a partir de cambios en los modelos SQLAlchemy
alembic revision --autogenerate -m "descripcion_del_cambio"
```

> Alembic usa la URL de base de datos sincrónica (`postgresql://...` via `psycopg2-binary`) para las migraciones, aunque el resto del backend usa `asyncpg`. Ambos drivers están incluidos en `requirements.txt`.

---

## Ejecución de Pruebas

### Unit Tests (Backend)

Prueban la lógica de dominio pura sin acceso a base de datos ni red.

```bash
cd backend
pytest tests/unit/ -v
```

### Integration Tests (Backend)

Prueban los repositorios contra una instancia real de PostgreSQL. Requiere que el contenedor `postgres` de Docker Compose esté activo.

```bash
# Asegurarse que PostgreSQL está corriendo
docker compose up postgres -d

cd backend
pytest tests/integration/ -v
```

### Type Checking (Frontend)

```bash
cd frontend
npx tsc --noEmit
```

### Linting (Frontend)

```bash
cd frontend
npm run lint
```

### Build de producción (Frontend)

```bash
cd frontend
npm run build
```

### Tests E2E con Playwright

Requieren el stack completo activo (backend en `:8000` y frontend en `:3000`).

```bash
# Con el stack ya corriendo:
cd frontend
npx playwright test

# Para ver el reporte interactivo tras la ejecución:
npx playwright show-report
```

---

## Notas sobre Versionado

El archivo `frontend/package.json` muestra la versión `0.2.0-alpha.1`, que corresponde al versionado interno del paquete npm del frontend. La versión pública del proyecto (visible en el README y el CHANGELOG) es `1.0.0-beta.2` y aplica al monorepo como un todo.

---

## Solución de Problemas Frecuentes

**El backend no puede conectarse a PostgreSQL**
- Verificar que el contenedor `postgres` está corriendo: `docker compose ps`.
- Confirmar que `POSTGRES_SERVER` en `backend/.env` apunta a `localhost` (desarrollo nativo) o al nombre del servicio Docker (`postgres`) si se ejecuta el backend dentro de un contenedor.

**Error `alembic: command not found`**
- Activar el entorno virtual Python: `source backend/.venv/bin/activate`.

**El frontend no puede comunicarse con el backend**
- Verificar que `NEXT_PUBLIC_API_URL` en `frontend/.env.local` apunta a `http://localhost:8000/api/v1`.
- Verificar que el backend está corriendo y responde en `/api/v1/health`.

**Error de TypeScript en `npm run build`**
- Ejecutar `npx tsc --noEmit` para ver los errores detallados antes del build.
