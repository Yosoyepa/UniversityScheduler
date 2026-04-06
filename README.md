# UniversityScheduler

![Version](https://img.shields.io/badge/versión-1.0.0--beta.2-blue)
![License](https://img.shields.io/badge/licencia-MIT-green)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![Node](https://img.shields.io/badge/Node.js-20%2B-brightgreen)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)

**UniversityScheduler** es una aplicación web de gestión académica para estudiantes universitarios. Permite organizar semestres, materias y sesiones de clase con detección automática de conflictos horarios, gestionar tareas en un tablero Kanban, hacer seguimiento de calificaciones ponderadas y administrar un directorio de profesores con reserva de tutorías.

El proyecto es un MVP en estado beta, construido con Arquitectura Hexagonal en el backend y Atomic Design en el frontend.

![Topología de Despliegue](docs/diagrams/Deployment%20Topology.png)

---

## Tabla de Contenido

1. [Funcionalidades](#funcionalidades)
2. [Tecnologías](#tecnologías)
3. [Arquitectura](#arquitectura)
4. [Inicio Rápido](#inicio-rápido)
5. [Documentación](#documentación)
6. [Contribución](#contribución)
7. [Licencia](#licencia)

---

## Funcionalidades

- **Planificación Académica**: Modelado de semestres, registro de materias con créditos y tipo, asignación de sesiones de clase semanales con validación matemática de conflictos horarios (`ConflictDetectionService`).
- **Gestión de Tareas**: Tablero Kanban con máquina de estados (TODO → IN_PROGRESS → DONE → ARCHIVED). Soporte de prioridades y categorías (tarea, examen, proyecto, lectura).
- **Progreso Académico**: Registro de calificaciones con criterios de evaluación ponderados y cálculo de promedio por materia.
- **Directorio de Profesores**: Gestión de un directorio privado por usuario con horas de oficina y reserva de sesiones de tutoría.
- **Notificaciones**: Sistema de notificaciones in-app generado por un bus de eventos en memoria (`SyncEventBus`).
- **Autenticación**: Flujo completo de registro, login, refresh token y logout con JWT (HS256) y bcrypt.
- **Tema Oscuro**: Modo oscuro persistente gestionado por la Context API de React y sincronizado con el backend.

---

## Tecnologías

| Categoría | Tecnología | Versión |
| :--- | :--- | :--- |
| Backend — Framework | FastAPI | 0.110+ |
| Backend — Lenguaje | Python | 3.13 |
| Backend — ORM | SQLAlchemy (async) | 2.0+ |
| Backend — Migraciones | Alembic | 1.13+ |
| Backend — Base de datos | PostgreSQL | 15 |
| Backend — Autenticación | python-jose + bcrypt | 3.3 / 3.2 |
| Backend — Servidor | Uvicorn | 0.29+ |
| Frontend — Framework | Next.js (App Router) | 16.1.4 |
| Frontend — Lenguaje | TypeScript | 5 |
| Frontend — UI | React | 19.2.3 |
| Frontend — Estilos | TailwindCSS | 4 |
| Frontend — Testing E2E | Playwright | 1.59+ |
| Infraestructura | Docker + Docker Compose | — |

---

## Arquitectura

### Backend — Arquitectura Hexagonal

El backend sigue el patrón Hexagonal (Puertos y Adaptadores) organizado en módulos por dominio. Cada módulo contiene cuatro capas:

- `domain/` — Entidades y servicios de negocio puro (sin dependencias de framework).
- `application/` — Casos de uso y DTOs.
- `port/` — Interfaces abstractas (repositorios, servicios externos).
- `adapter/` — Implementaciones concretas (routers FastAPI, repositorios PostgreSQL).

El Shared Kernel (`app/shared/`) concentra las abstracciones transversales: jerarquía de excepciones, bus de eventos, value objects y sesión de base de datos.

### Frontend — Atomic Design

El frontend organiza los componentes en cuatro niveles: atoms (elementos HTML con estilo), molecules (combinaciones simples), organisms (secciones con estado propio) y templates (layouts de página). La lógica de dominio reside en hooks específicos por feature (`features/{nombre}/hooks/`).

Para más detalle, consultar la documentación de arquitectura en [`docs/architecture/`](docs/architecture/).

---

## Inicio Rápido

Para instrucciones completas de instalación, configuración de variables de entorno y ejecución de pruebas, consultar la **[Guía de Inicio](docs/GETTING_STARTED.md)**.

Resumen del flujo básico:

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/UniversityScheduler.git
cd UniversityScheduler

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
# Editar backend/.env con los valores reales

# 3. Levantar la base de datos y aplicar migraciones
docker compose up postgres -d
cd backend && alembic upgrade head && cd ..

# 4. Iniciar el stack completo
chmod +x start_dev.sh && ./start_dev.sh
```

| Servicio | URL |
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Documentación Swagger | http://localhost:8000/docs |

---

## Documentación

| Documento | Descripción |
| :--- | :--- |
| [Guía de Inicio](docs/GETTING_STARTED.md) | Prerequisitos, variables de entorno, instalación, pruebas |
| [Referencia de API](docs/api/endpoints.md) | Todos los endpoints REST con request/response |
| [Módulo Profesores (API)](docs/api/professors.md) | Endpoints de directorio de profesores y tutorías |
| [Perfil y Notificaciones (API)](docs/api/user_profile.md) | Endpoints de perfil, configuración y notificaciones |
| [Decisiones de Arquitectura (ADR)](docs/architecture/00_decisions.md) | Registro de decisiones de diseño |
| [Modelo C4](docs/architecture/01_c4_model.md) | Diagrama de contexto, contenedores y componentes |
| [Esquema de Base de Datos](docs/architecture/02_database_schema.md) | DDL PostgreSQL con relaciones e índices |
| [Modelo de Dominio](docs/architecture/03_domain_model.md) | Entidades, tarjetas CRC y diagramas PlantUML |
| [Diagramas de Comportamiento](docs/architecture/04_behavioral_diagrams.md) | Diagramas de secuencia de los flujos principales |
| [Estructura de Directorios](docs/architecture/05_directory_structure.md) | Árbol de archivos con descripción de cada capa |
| [Casos de Uso](docs/architecture/06_use_cases.md) | Casos de uso en formato Larman |
| [Eventos de Dominio](docs/architecture/08_domain_events.md) | Bus de eventos, listeners y flujo pub/sub |
| [Manejo de Errores](docs/architecture/09_error_handling.md) | Jerarquía de excepciones y formato de respuesta |
| [Arquitectura Frontend](docs/architecture/10_frontend_architecture.md) | Atomic Design, rutas, contextos y convenciones |
| [Estrategia de Pruebas](docs/testing_strategy.md) | Pirámide de pruebas, herramientas y comandos |
| [Glosario](docs/GLOSSARY.md) | Términos del dominio y del proyecto |
| [Diagramas](docs/diagrams/) | ERD, DFD, despliegue y máquinas de estado en PlantUML/PNG |

---

## Contribución

Las contribuciones son bienvenidas. Leer la **[Guía de Contribución](CONTRIBUTING.md)** antes de abrir un Pull Request. El proyecto requiere compilación limpia antes de cada commit y sigue el estándar [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

---

## Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.
