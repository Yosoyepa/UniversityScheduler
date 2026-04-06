# Registro de Decisiones de Arquitectura (ADR)

Este documento registra las decisiones de diseño significativas tomadas durante el desarrollo de UniversityScheduler. Cada ADR captura el contexto, las alternativas evaluadas, la decisión adoptada y sus consecuencias.

---

## ADR-001: Selección de Stack Tecnológico

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: El proyecto requiere un stack moderno, con soporte de tier gratuito para el MVP, y alineado con las competencias del equipo (Python y TypeScript).

**Decisión**:
- **Backend**: Python con **FastAPI**.
  - Razón: alto rendimiento (asyncio), generación automática de documentación OpenAPI, ecosistema maduro para aplicaciones con lógica de datos compleja.
- **Frontend**: TypeScript con **Next.js** (App Router).
  - Razón: estándar de la industria, ecosistema React, optimización para Vercel en tier gratuito, soporte nativo de Server Components.
- **Base de datos**: **PostgreSQL**.
  - Razón: los datos del dominio (horarios, tareas, calificaciones) son relacionales y requieren consistencia fuerte con joins complejos.

**Consecuencias**:
- El equipo puede reutilizar conocimiento existente de Python y TypeScript sin curva de aprendizaje adicional.
- FastAPI y Next.js tienen excelente compatibilidad con los servicios de despliegue en tier gratuito (Render, Railway, Vercel).

---

## ADR-002: Patrón Arquitectónico — Monolito Modular Hexagonal

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: La aplicación debe ser portable entre proveedores de nube sin reescrituras del código de negocio. El equipo es pequeño y una arquitectura de microservicios añadiría complejidad operacional injustificada en esta fase.

**Decisión**: **Arquitectura Hexagonal (Puertos y Adaptadores)** dentro de un **Monolito Modular**.

Principio central: la capa de dominio no debe importar frameworks, ORMs ni SDKs de nube. Todas las dependencias externas (base de datos, almacenamiento, email) se inyectan como interfaces abstractas (Puertos). Las implementaciones concretas (Adaptadores) se definen en la capa de infraestructura.

Estructura de capas por módulo:
- `domain/` — Entidades, value objects y servicios de negocio puro.
- `application/` — Casos de uso y DTOs.
- `port/` — Interfaces abstractas (repositorios, servicios externos).
- `adapter/` — Implementaciones concretas (routers FastAPI, repositorios SQLAlchemy).
- `infrastructure/` — Modelos ORM y utilidades de infraestructura.

**Consecuencias positivas**:
- El dominio puede testearse sin levantar una base de datos ni un servidor HTTP.
- Cambiar de proveedor de base de datos requiere solo reemplazar el adaptador.
- Migración futura a microservicios es posible extrayendo módulos sin modificar el dominio.

**Consecuencias negativas**:
- Mayor cantidad de archivos y clases por módulo (interfaces de repositorio, DTOs separados de entidades).
- La inyección de dependencias requiere disciplina para no cortocircuitar las capas.

---

## ADR-003: Estrategia de Base de Datos

**Estado**: Aceptado (revisado)
**Fecha**: 2026-01-24

**Contexto**: El proyecto requiere una base de datos relacional sin costo directo en el entorno de desarrollo. Se evaluó usar Supabase (PostgreSQL gestionado) y PostgreSQL local via Docker.

**Decisión**: **PostgreSQL 15 via Docker Compose** para desarrollo local. **SQLAlchemy 2.0** como ORM con soporte asíncrono (`asyncpg`) para prevenir acoplamiento al proveedor de base de datos.

La abstracción de SQLAlchemy permite conectar a cualquier instancia de PostgreSQL (Supabase, Railway, Neon, Amazon RDS) con solo cambiar las variables de entorno `POSTGRES_*`, sin modificar código.

**Gestión de esquema**: Alembic para migraciones versionadas. Las migraciones usan la URL sincrónica (`postgresql://...` con `psycopg2-binary`) ya que Alembic no soporta motores asíncronos.

**Consecuencias**:
- El entorno de desarrollo no requiere cuenta en ningún servicio externo.
- Los backups y la disponibilidad en producción dependen del proveedor PostgreSQL elegido para el despliegue.
- Alembic garantiza que el esquema de base de datos esté versionado junto al código fuente.

---

## ADR-004: Estrategia de Autenticación con JWT

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: La aplicación es multi-usuario y requiere autenticación segura. Se evaluaron sesiones en servidor (stateful), OAuth externo (Google/GitHub) y JWT (stateless).

**Decisión**: **JWT (HS256)** con dos tokens:
- **Access token**: duración corta (60 minutos). Se envía en el header `Authorization: Bearer` en cada request.
- **Refresh token**: duración larga (7 días). Se usa exclusivamente para renovar el access token vía `POST /auth/refresh`.

Las contraseñas se almacenan con hash bcrypt usando `passlib`. El secreto de firma (`SECRET_KEY`) se configura como variable de entorno.

**Consecuencias positivas**:
- Sin estado en el servidor: no requiere almacenamiento de sesiones.
- Escalable horizontalmente sin sticky sessions.

**Consecuencias negativas**:
- No existe invalidación de tokens antes de su expiración. El logout es del lado del cliente (descarte de tokens en `localStorage`). Aceptado para el MVP. En producción se puede implementar una lista negra de tokens (Redis) o reducir el tiempo de expiración.

---

## ADR-005: SQLAlchemy Asíncrono con asyncpg

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: FastAPI ejecuta handlers en un event loop asíncrono. Usar el driver sincrónico (`psycopg2`) bloquearía el event loop durante las consultas a la base de datos, eliminando el beneficio de la arquitectura asíncrona.

**Decisión**: **SQLAlchemy 2.0 con `AsyncSession`** y el driver **`asyncpg`** para todas las operaciones del servidor. Alembic continúa usando el URL sincrónico con `psycopg2-binary` exclusivamente para migraciones.

**Consecuencias**:
- Todas las funciones de repositorio son `async def`.
- Las pruebas de integración requieren `pytest-asyncio`.
- `app/shared/infrastructure/database.py` expone `get_async_session()` para el servidor y una función de sesión sincrónica para Alembic.

---

## ADR-006: Bus de Eventos en Memoria (SyncEventBus)

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: El sistema necesita comunicación desacoplada entre módulos. Cuando una tarea pasa a `DONE`, el módulo de notificaciones debe reaccionar sin que el módulo de tareas conozca la existencia del módulo de notificaciones. Se evaluaron llamada directa entre use cases (alto acoplamiento), RabbitMQ/Kafka (overhead operacional injustificado) y bus en memoria.

**Decisión**: **`SyncEventBus`** como adaptador del puerto abstracto `IEventBus` en el Shared Kernel (`app/shared/domain/events.py`). Los listeners se registran en el startup de la aplicación. El bus es sincrónico: los handlers se ejecutan en el mismo hilo antes de que el use case retorne.

**Consecuencias positivas**:
- Cero dependencias externas adicionales.
- Simple de testear: `bus.clear()` entre tests.
- El puerto `IEventBus` permite el swap hacia RabbitMQ, Redis Pub/Sub o AWS SQS sin modificar el dominio.

**Consecuencias negativas**:
- Los eventos no se persisten: si la aplicación falla durante el procesamiento, el evento se pierde.
- No escala entre múltiples instancias del servidor. Ambas limitaciones son aceptables para el MVP de instancia única.

---

## ADR-007: Atomic Design para el Frontend

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: El frontend necesita una convención de organización de componentes que prevenga el crecimiento desordenado de `components/`. Se evaluaron organización por tipo (pages/components/hooks), por feature y Atomic Design.

**Decisión**: **Atomic Design** con cuatro niveles:
1. **Atoms**: elementos HTML con estilo básico, sin estado de negocio (Button, Input, Badge, Icon).
2. **Molecules**: combinaciones de 2-3 atoms con responsabilidad simple (FormField, TaskCard, ClassCard).
3. **Organisms**: secciones completas con estado propio o consumo de hooks (ScheduleGrid, KanbanBoard, modales).
4. **Templates**: layouts de página (DashboardLayout, AuthLayout).

La lógica de dominio (hooks de datos, transformaciones) reside en `src/features/{nombre}/` para mantener los componentes desacoplados de la fuente de datos.

**Consecuencias**:
- Convención clara que facilita onboarding de nuevos contribuidores.
- Alta reutilización de atoms y molecules al no tener dependencias de negocio.
- Requiere disciplina: no incluir lógica de negocio en atoms ni molecules.

---

## ADR-008: Context API en Lugar de Redux/Zustand

**Estado**: Aceptado
**Fecha**: 2026-01-24

**Contexto**: El frontend necesita estado global compartido principalmente para autenticación y tema. Se evaluaron Redux Toolkit, Zustand y la Context API nativa de React.

**Decisión**: **Context API de React** con hooks personalizados (`useAuth`, `useTheme`, `useToast`). Sin librerías de gestión de estado global adicionales.

**Razón**: El estado global del MVP está acotado a tres contextos. Redux o Zustand añadirían boilerplate y una dependencia adicional para un problema que la Context API resuelve adecuadamente (principio YAGNI).

**Consecuencias**:
- Bundle más pequeño, código más simple.
- Si el estado global crece en fases futuras, Zustand es la ruta de migración recomendada: el contrato de los custom hooks se mantiene; solo cambia la implementación interna del provider.
