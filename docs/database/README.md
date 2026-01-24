# Database Schema

Esta carpeta contiene los scripts DDL para la base de datos PostgreSQL del proyecto University Scheduler.

## Archivos

- `schema.sql` - Script completo de creación del esquema de base de datos

## Tablas

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema |
| `settings` | Configuraciones del usuario (1:1) |
| `semesters` | Semestres académicos |
| `subjects` | Materias/Asignaturas |
| `class_sessions` | Sesiones de clase (horario semanal) |
| `tasks` | Tareas, exámenes y proyectos |

## Tipos ENUM

- `difficulty_level`: EASY, MEDIUM, HARD
- `subject_type`: DISCIPLINAR_OBLIGATORIA, DISCIPLINAR_OPTATIVA, FUNDAMENTAL_OBLIGATORIA, LIBRE_ELECCION
- `task_status`: TODO, IN_PROGRESS, DONE
- `task_priority`: LOW, MEDIUM, HIGH
- `task_category`: TASK, EXAM, PROJECT, READING

## Cómo ejecutar

```bash
# Conectar a PostgreSQL y ejecutar el script
psql -U usuario -d university_scheduler -f schema.sql

# O desde dentro de psql
\i /ruta/a/schema.sql
```

## Migraciones

Para el manejo de migraciones en producción, se utiliza **Alembic** (ubicado en `backend/alembic/`).
