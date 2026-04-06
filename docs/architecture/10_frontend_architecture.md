# Arquitectura del Frontend

Este documento describe las decisiones de diseño, convenciones y estructura del frontend de UniversityScheduler, construido con Next.js 16 (App Router), React 19, TypeScript 5 y TailwindCSS 4.

Para el contexto de la decisión de usar Atomic Design y Context API, ver [00_decisions.md](00_decisions.md) (ADR-007 y ADR-008).

---

## Estructura de Directorios

```
frontend/src/
├── app/                        # Rutas y páginas (Next.js App Router)
│   ├── layout.tsx              # Layout raíz con todos los providers
│   ├── page.tsx                # Redirect a /dashboard/schedule
│   ├── (auth)/                 # Grupo de rutas públicas (sin sidebar)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── dashboard/              # Rutas protegidas (requieren auth)
│       ├── layout.tsx          # Verifica auth, redirige si no autenticado
│       ├── page.tsx            # Home del dashboard (bienvenida)
│       ├── schedule/page.tsx   # Horario semanal
│       ├── tasks/page.tsx      # Tablero Kanban
│       ├── progress/page.tsx   # Calificaciones y progreso
│       ├── directory/page.tsx  # Directorio de profesores
│       └── settings/page.tsx   # Configuración (4 pestañas)
│
├── components/                 # Sistema de diseño Atomic Design
│   ├── atoms/                  # Elementos HTML con estilo básico
│   ├── molecules/              # Composiciones simples de atoms
│   ├── organisms/              # Secciones complejas con estado
│   ├── templates/              # Layouts de página
│   └── index.ts                # Barrel export de todos los componentes
│
├── features/                   # Lógica específica por dominio
│   ├── auth/                   # Contexto de autenticación y hooks
│   ├── theme/                  # Contexto de tema (dark/light)
│   ├── notifications/          # Contexto de toasts
│   ├── schedule/               # Hook useSchedule
│   ├── tasks/                  # Hook useTasks
│   ├── academic_progress/      # Hook useGrades
│   ├── professors/             # Hook useProfessors
│   └── settings/               # Hook useSettings
│
├── lib/                        # Utilidades compartidas
│   ├── api-client.ts           # Cliente HTTP centralizado
│   ├── auth-service.ts         # Funciones de autenticación
│   └── index.ts
│
├── types/                      # Tipos TypeScript compartidos
│   ├── entities.ts             # Modelos de dominio
│   ├── api.ts                  # Tipos de respuesta API y Result<T>
│   └── index.ts
│
└── globals.css                 # Imports globales de TailwindCSS
```

---

## Atomic Design — Convenciones de Clasificación

| Nivel | Criterio de clasificación | Ejemplos |
| :--- | :--- | :--- |
| **Atom** | Un elemento HTML con estilo o comportamiento básico. Sin estado de negocio. No consume hooks de features. | `Button`, `Input`, `Label`, `Badge`, `Icon`, `Spinner` |
| **Molecule** | Combinación de 2-3 atoms con una responsabilidad funcional simple. Puede tener estado local de UI (no de negocio). | `FormField` (Label + Input + mensaje de error), `TaskCard`, `ClassCard`, `KanbanColumn`, `GradeRow` |
| **Organism** | Sección completa de UI con estado propio o que consume hooks de features. Puede contener múltiples molecules y atoms. | `ScheduleGrid`, `KanbanBoard`, `GradesTable`, `ProfessorCard`, `ClassFormModal`, `TaskFormModal`, `NotificationDropdown`, `ProfileDropdown` |
| **Template** | Layout de página. Recibe organisms como children o slots. No contiene lógica de negocio ni datos. | `DashboardLayout` (sidebar + navbar), `AuthLayout` |

**Regla estricta**: los atoms y molecules no deben importar desde `features/`. Los organisms sí pueden.

---

## Estructura de Rutas (App Router)

| Ruta | Archivo de página | Acceso |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | Público — redirige a `/dashboard/schedule` o `/login` |
| `/login` | `app/(auth)/login/page.tsx` | Solo usuarios no autenticados |
| `/register` | `app/(auth)/register/page.tsx` | Solo usuarios no autenticados |
| `/dashboard` | `app/dashboard/page.tsx` | Requiere autenticación |
| `/dashboard/schedule` | `app/dashboard/schedule/page.tsx` | Requiere autenticación |
| `/dashboard/tasks` | `app/dashboard/tasks/page.tsx` | Requiere autenticación |
| `/dashboard/progress` | `app/dashboard/progress/page.tsx` | Requiere autenticación |
| `/dashboard/directory` | `app/dashboard/directory/page.tsx` | Requiere autenticación |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | Requiere autenticación |

### Protección de rutas

El archivo `app/dashboard/layout.tsx` actúa como guardia de autenticación. En el montaje verifica el estado de `AuthContext`. Si el usuario no está autenticado, redirige a `/login` usando `router.push`. Mientras el estado de autenticación se carga, muestra un estado de carga (skeleton o spinner).

---

## Estado Global — Context API

### AuthContext (`features/auth/context/AuthContext.tsx`)

Gestiona el ciclo de vida de la sesión del usuario.

**Estado expuesto**:
- `user: User | null` — El usuario autenticado o `null`.
- `isLoading: boolean` — Verdadero mientras se verifica el token inicial.
- `isAuthenticated: boolean` — Derivado de `user !== null`.

**Funciones expuestas**:
- `login(email, password): Promise<void>` — Llama a `POST /auth/login`, guarda los tokens en `localStorage` y actualiza el estado.
- `register(email, fullName, password): Promise<void>` — Llama a `POST /auth/register`.
- `logout(): void` — Limpia `localStorage` y restablece el estado.
- `refreshToken(): Promise<void>` — Llama a `POST /auth/refresh` y actualiza los tokens.

**Persistencia**: Los tokens (`access_token` y `refresh_token`) se almacenan en `localStorage`. En el montaje del provider, el contexto verifica si existe un token y llama a `GET /auth/me` para validarlo y poblar el estado `user`.

### ThemeContext (`features/theme/context/ThemeContext.tsx`)

Gestiona el modo oscuro/claro de la interfaz.

**Estado expuesto**:
- `isDark: boolean` — Verdadero si el modo oscuro está activo.
- `toggleTheme(): void` — Alterna entre modo oscuro y claro.

**Persistencia**: Al cambiar el tema, se actualiza la clase `dark` en el elemento `<html>`, se guarda en `localStorage` para la próxima visita y se sincroniza con la API de configuración del usuario (`PATCH /user/settings`).

### ToastContext (`features/notifications/context/ToastContext.tsx`)

Sistema de notificaciones toast para feedback visual inmediato al usuario.

**Funciones expuestas**:
- `showToast(message, type): void` — Muestra un toast con tipo `success`, `error`, `info` o `warning`.
- Los toasts se descartan automáticamente después de 4 segundos. Se pueden mostrar hasta 5 simultáneamente.

---

## Cliente HTTP (`src/lib/api-client.ts`)

Centraliza todas las llamadas a la API del backend. No se llama a `fetch` directamente en los componentes o hooks.

### Tipo Result\<T\>

El cliente usa un tipo discriminado para el manejo de errores, evitando el uso de try/catch en los componentes:

```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: ApiError };
```

Los hooks consumen este tipo y mapean los errores a mensajes de toast o estados de error en el componente.

### Comportamiento ante errores HTTP

| Código | Comportamiento del cliente |
| :--- | :--- |
| `401` | Intenta renovar el token con `POST /auth/refresh`. Si falla, redirige a `/login` y limpia `localStorage`. |
| `409` | El componente recibe el campo `conflicts` en el objeto de error para mostrar detalles del conflicto. |
| `400` / `422` | El campo `details` del error se mapea a mensajes de error inline en los formularios. |
| `5XX` | Muestra un toast de error genérico vía `ToastContext`. |

---

## Convención de Feature Hooks

Cada feature tiene un hook principal que encapsula el estado y las llamadas a la API:

| Hook | Feature | Responsabilidad |
| :--- | :--- | :--- |
| `useSchedule()` | `features/schedule/` | Semestres, materias, sesiones de clase |
| `useTasks()` | `features/tasks/` | CRUD de tareas, transición de estados |
| `useGrades()` | `features/academic_progress/` | Calificaciones, criterios, promedios |
| `useProfessors()` | `features/professors/` | Directorio de profesores, tutorías |
| `useSettings()` | `features/settings/` | Preferencias del usuario |

Cada hook retorna un objeto con: el estado actual (datos, `isLoading`, `error`) y funciones de mutación (crear, actualizar, eliminar). Los componentes no interactúan con `api-client.ts` directamente.

---

## Notas de Convención

- Los componentes interactivos (con estado, efectos o event handlers) deben tener la directiva `"use client"` al inicio del archivo. Los demás son Server Components por defecto.
- Los barrel exports en `components/index.ts` permiten importar cualquier componente con `import { Button, KanbanBoard } from "@/components"`.
- El alias `@/*` apunta a `./src/*` (configurado en `tsconfig.json`).
- TailwindCSS usa la clase `dark` en el elemento raíz para el modo oscuro (`dark:` utilities).
