# UniversityScheduler v1.0.0-beta.1 🚀🎓

**UniversityScheduler** es tu centro integral de planificación académica y gestión de la carga estudiantil, construido con una arquitectura moderna robusta para el rendimiento y la mantenibilidad.

![Deployment Topology](docs/diagrams/deployment.png)

## Funcionalidades Core (MVP)

- 📅 **Programación Académica:** Modela tus semestres, inscribe materias, asigna créditos y visualiza tu cruzada semanal en una grilla interactiva que evita conflictos horarios.
- 📋 **Task Management (Kanban):** Sigue la metodología ágil con tareas de la Universidad. Un estado manejado estrictamente (TODO, IN PROGRESS, DONE) por drag-and-drop con notificaciones tempranas de vencimiento.
- 📊 **Progreso y Calificaciones:** Ingresa tu matriz de pesos porcentuales (Ej. Parcial 30%, Final 40%) y mide de inmediato de forma proyectada tu probabilidad matemática de sobrepasar la cuota o reprobar con nuestro motor.
- 👨‍🏫 **Directorio y Tutorías:** Coordina disponibilidad con tus profesores y asegura reuniones privadas en horarios limpios y permitidos en su matriz de oficina. 
- 🔒 **Full Auth & UX:** Integración de Tema Oscuro Nativo, Ajuste de configuraciones persistentes, Notificaciones activas en campana y Auth por JWT protegiendo todo tu ciclo estudiantil.

## Arquitectura y Stack Tecnológico

1. **Frontend:** Next.js (App Router), React 19, TypeScript estricto, TailwindCSS (v4), Metodología `Atomic Design`. Pruebas en-a-en Playwright.
2. **Backend:** FastAPI (Python), SQLAlchemy 2 (Alembic), PostgreSQL, `Arquitectura Hexagonal (Puertos y Adaptadores)` junto con `Event Driven Design (EventBus)`. Todo orquestado por un `Shared Kernel` estandarizado.

*(Para más detalle por favor lee nuestros Archivos `.puml` convertidos a `.png` en la carpeta `docs/diagrams/` y el Catálogo de Casos de Uso `docs/architecture`)*

## Empezando Rápidamente (Desarrollo)

Asegúrate de tener un servidor PostgreSQL ejecutándose en el puerto 5432 y variables de entorno seteadas tanto en `/frontend` como `/backend`.

```bash
# Inicia toda tu suite completa con un hit mágico:
chmod +x start_dev.sh
./start_dev.sh
```

El Frontend levantará en `http://localhost:3000` y el Backend en `http://localhost:8000/docs` (Swagger UI).

## Comunidad
Revisa **`CONTRIBUTING.md`** y nuestros PR templates para conocer nuestras rigurosas pero eficaces líneas de aporte mediante Conventional Commits y Pull Requests seguros.

Copyright © 2026 Juan Andrade (Yosoyepa) - Licenciado bajo **MIT License**.
