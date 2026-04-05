# Auditoría y Roadmap Evolutivo: UniversityScheduler v2.0

## Contexto de la Evaluación

Hemos completado exitosamente las fundaciones críticas del proyecto **UniversityScheduler**. La aplicación ha pasado de ser un diseño conceptual documentado en enero de 2026, a un MVP funcional e integrado. Este documento audita todo lo implementado a la fecha y formaliza el plan de ataque para los módulos y características pendientes según la visión original.

---

## 📅 Análisis de Progreso: Estado Actual

Se ha superado toda la arquitectura "Core" del sistema.  
**Estado General:** `ESTABLE` (MVP Completado).

### ✅ Fases Completadas y Consolidadas en Main
1. **Fase 1: Módulo Académico (Core)**
   - Dominio de Materias (`Subjects`), Sesiones (`ClassSessions`) y Semestres.
   - Algoritmos avanzados: Detección estricta de conflictos horarios.
   - *Status*: Finalizado y Desplegado en UI con Interfaz Gráfica (`ScheduleGrid`).
2. **Fase 3: Notas y Rendimiento Académico** (*Se adelantó por prioridad*)
   - Sistemas de `Grades` y Criterios de Evaluación Ponderados.
   - *Status*: Finalizado con tablas integradas en UI y cálculos de porcentaje dinámicos en el frontend.
3. **Fase 4: Sistema de Autenticación y Cuentas**
   - Registro y Login vía JWT (FastAPI / Bcrypt).
   - Middleware global de interceptación `auth_middleware.py`.
   - Protección global de Rutas en Next.js (HOC layout guards).
   - *Status*: Finalizado, habilitando el uso multi-tenant persistente de la plataforma.
4. **Fase 2: Gestión de Tareas (Parcialmente Completada)**
   - Dominio de `Task` implementado como Máquina de Estados (State Machine).
   - Aplicación integral del patrón de Bus de Eventos (`TaskCompletedEvent`).
   - UI de `KanbanBoard` funcional con bibliotecas HTML5 de Drag & Drop.
   - *Status*: Dominio y UI finalizados. (Pendiente integración de terceros).

---

## 🚀 ROADMAP EVOLUTIVO: Siguientes Fases

Con la integración principal completada, la arquitectura de la aplicación está madura y lista para escalar. Aquí están las fases detalladas en base al documento maestro de análisis:

### Fase 5: Configuración de Usuario, Notificaciones y Alertas (UX Ecosystem)
En el diseño original, el diagrama de BD especificaba una entidad vital `Settings` adjunta al usuario para gobernar las preferencias de usabilidad y notificaciones.
* **Backend:**
  * Crear la entidad abstracta `Settings` (Value Object / 1-to-1 con `User`).
  * Almacenamiento de preferencias: `dark_mode`, `alert_preferences`, etc.
* **Cross-Cutting / Eventos:**
  * Implementar el motor de resolución de eventos. Un `Listener` de `TaskOverdueEvent` que dispare Notificaciones simuladas o por correo.
* **Frontend:**
  * Sistema de Toasts dinámicos de éxito y error.
  * Vista de *Ajustes de Perfil*.

### Fase 6: Directorio de Profesores y Tutorías (Próxima Fase Inmediata)
Módulo altamente esperado en el mock de diseño de la carpeta `/mockups/professor_directory_and_tutoring/`.
* **Dominio & DB:**
  * `Professors`, vinculados de `N a N` o `1 a N` dependiendo del diseño, con `Subjects`.
  * Sesiones extra curriculares (Tutorías), un Aggregate hermano de `ClassSessions`.
* **Frontend:**
  * Dashboard consultivo de perfiles de docentes con vista detallada.

### Fase 7: Fronteras Externas e Integración de Calendarios (Pospuesto)
Esta tarea ha sido pospuesta para el final del roadmap dado que se requiere configurar formalmente el proyecto en Google Cloud Platform (GCP) y emitir las credenciales OAuth necesarias.
* **Adaptadores (Ports & Adapters):**
  * Definir abstracción de puerto `ICalendarPort` en Dominio.
  * Implementar el adaptador `GoogleCalendarAdapter` mediante librerías de Google Cloud.
* **Orquestación:**
  * Actualizar los *Use Cases* de creación de actividades y sesiones de clases para que publiquen de manera asíncrona sus entradas en el calendario del usuario.

### Fase 8: Saneamiento de Deuda Técnica y Setup Documental
Con el producto materializado, reestructurar la documentación técnica (que fue puntuada con un `7.8/10` de origen) para alcanzar el `10/10` de grado profesional.
* `06_use_cases.md` actualizado en formato Larman al estado final de Fase 7.
* **Testeo**: Aumentar la cobertura actual (pytest).

---

## User Review Required

> [!IMPORTANT]
> **Decisión en Fases:** Hemos dado por completada al 100% la Fase 5 incluyendo todos los detalles visuales de refinamiento. Con la integración a Google Calendar formalmente pospuesta hasta tener el setup en GCP, nuestro siguiente gran objetivo orgánico pasa a ser la **Fase 6: Directorio de Profesores y Tutorías**. ¿Confirmas iniciar la investigación para dicha fase?
