# Use Cases Document (UC)

## UC-001: Crear Materia Semestral
**Actores**: Estudiante
**Precondiciones**: Usuario autenticado, semestre activo

**Flujo Principal**:
1. Usuario selecciona "Agregar Materia"
2. Sistema solicita: nombre, créditos, tipo, profesor
3. Usuario completa el formulario
4. Usuario confirma
5. Sistema valida que no haya conflicto horario
6. Sistema persiste la materia
7. Sistema retorna ID de materia

**Flujo Alternativo (Conflicto Detectado)**:
- 5a. Si hay solapamiento de horarios:
  - Sistema muestra conflicto
  - Usuario puede descartar o modificar horario
  - Reintentar desde paso 4

**Postcondiciones**: Materia visible en calendario

---

## UC-002: Detectar Conflictos de Horario
**Actores**: Sistema
**Precondiciones**: Materia A existe, Usuario intenta agregar Materia B

**Flujo**:
1. Para cada sesión de B:
   - Comparar con todas las sesiones de A
   - Si días y horas se solapan: retornar CONFLICTO
2. Retornar lista de conflictos

---

## UC-003: Sincronizar Calendario
**Actores**: Sistema
**Precondiciones**: Cuenta de Google Vinculada

**Flujo**:
1. Usuario activa "Sincronizar con Google Calendar" en una tarea
2. Sistema verifica credenciales de Google
3. Sistema envía evento a Google Calendar API
4. Google retorna ID de evento
5. Sistema guarda ID externo en Tarea

**Flujo Alternativo (Error Auth)**:
- 2a. Si token expirado:
  - Solicitar re-login
