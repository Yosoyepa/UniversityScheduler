# UniversityScheduler v1.0.0-beta.1 🚀🎓

**UniversityScheduler** es tu central interactiva académica. Es un MVP de software diseñado en una arquitectura orientada al dominio y modularizada para alto rendimiento, escalabilidad comunitaria e ingeniería moderna.

![Despliegue General](docs/diagrams/Deployment%20Topology.png)

## Tabla de Contenido
1. [Funcionalidades Core](#funcionalidades-core)
2. [Arquitectura e Infraestructura](#arquitectura-e-infraestructura)
   - [Event-Driven In-Memory (Pub/Sub)](#event-driven-in-memory-pubsub)
   - [Documentación Interactiva y Estática](#documentación-interactiva-y-estática)
   - [API Reference (Swagger)](#api-reference-swagger)
3. [Empezando Rápidamente](#empezando-rápidamente-desarrollo)
4. [Contribución Comunitaria](#contribución-comunitaria)

---

## Funcionalidades Core

- 📅 **Programación Académica:** Modela semestres, inscribe materias, asigna créditos y esquiva choques horarios con validaciones matemáticas integradas a nivel Backend (`DetectScheduleConflictsUseCase`).
- 📋 **Task Management:** Gestión de prioridades usando la UI Kanban interactiva mediante *Optimistic UI* de Next.js y un despachito de eventos interno asíncrono para las notificaciones al hacer Drag And Drop.
- 📊 **Progreso Ponderado:** Algoritmos matemáticos implementados en tu dominio para dictaminar con semáforo porcentual tu progresión y proyección de aprobación en tu trimestre.
- 👨‍🏫 **Directorio Institucional:** Control estricto de horas de asesoría y oficinas para no irrumpir sobre el horario de tus asignaturas diarias. 
- 🔒 **Full Auth & System Tuning:** UX envidiable; Tema Oscuro persistente en el Contexto de React, y un entorno cerrado y seguro vía JSON Web Tokens protegiendo todo tu panel de control y API.

---

## Arquitectura e Infraestructura

Este software se forjó respetando los patrones de diseño modernos tanto a nivel Backend como Frontend.

1. **Frontend:** React 19, Next.js (App Router), TailwindCSS (v4), Metodología `Atomic Design` con fuerte tipado en TypeScript. Cuenta con suite Pre-Commit e incio de QA E2E bajo Playwright.
2. **Backend:** FastAPI, Python 3.10+, SQLAlchemy (PostgreSQL y Alembic). Moldeado exquisitamente bajo **Arquitectura Hexagonal** (Puertos, Adaptadores, Dominio, Aplicación), con Inversión de Control de Dependencias.

### Event-Driven In-Memory (Pub/Sub)
El proyecto cuenta con un sistema Pub/Sub. Sin embargo, no usa conectores pesados e instrumentales como Apache Kafka o RabbitMQ en su estado de Beta MVP (mitigando costos directos y DevOps abultado vía el principio YAGNI).
Para lograr este flujo, usamos `SyncEventBus` (y `NotificationListener` atados mediante Callables en memoria ubicados en el `Shared Kernel`). La interfaz abstracta de este modelo permitirá el _swap_ rápido e inter-proceso hacia tecnologías de Message Broking (ej: SQS, Rabbit) en Fases masivas posteriores sin disrupción alguna en la lógica gracias a los Adapters.

### Documentación Interactiva y Estática
* `docs/architecture/06_use_cases.md`: Todo aspecto de negocio estructurado en Formato de Casos de Uso (Metodología Larman).
* `docs/diagrams/`: Toda la topología gráfica (`ERD` de Postgres, `DFD` - Data Flow para el App Router, `Despliegues` y diagramas de estados) escritos en **PlantUML** y portabilizados nativamente a formato libre PNG.
* `docs/requirements_traceability.md` y `docs/mockups/`: Listas de control de QA.

### API Reference (Swagger)
El backend cuenta por defecto y en un 100% con *Documentación Asíncrona Integrada*. FastAPI autogenera las especificaciones [OpenAPI](https://swagger.io/specification/v3/).
Para consultar los endpoints, validaciones HTTP (4XX, 5XX) o parámetros JWT en tiempo real:
- Dirígete a la ruta nativa `http://localhost:8000/docs`.

---

## Empezando Rápidamente (Desarrollo)

Asegúrate de preparar tu archivo `.env` de Postgres (local o cloud) con su URL canónica y los secretos HMAC del JWT.

```bash
# Permisos iniciales de ejecución a nuestro root script
chmod +x start_dev.sh

# Despliega tu base de PostgreSQL y luego unifica las dos cabezas del stack:
./start_dev.sh
```

Levanta el Frontend en `http://localhost:3000` y aliméntalo de su respectiva capa Backend en `http://localhost:8000`.

---

## Contribución Comunitaria

Apreciamos inmensamente la colaboración en el código abierto. Hemos construido una guía sólida en **`CONTRIBUTING.md`** y un PR template (`.github/PULL_REQUEST_TEMPLATE.md`) que exigen un escrutinio automatizado del Pre-Commit y `git-commit` skills previos para asegurar cero quiebres a este gran software.

*Con amor para la ingeniería,* **MIT License**.
