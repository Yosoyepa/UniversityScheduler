---
name: frontend-app-router
description: Guide for creating Next.js pages, layouts, and route handlers in the UniversityScheduler frontend using the App Router. Use this skill whenever creating, modifying, or organizing files inside frontend/src/app/, including page.tsx files, layout.tsx wrappers, route groups, loading/error states, and API route handlers. Also use when the user mentions Next.js pages, routing, layouts, server components, client components, route groups, or the app directory structure.
---

# Frontend App Router

This skill defines how to create pages, layouts, and routes in `frontend/src/app/` using Next.js App Router conventions for the UniversityScheduler project.

## Directory Structure

```
frontend/src/app/
├── favicon.ico
├── globals.css           # Global styles
├── layout.tsx            # Root layout (html + body + fonts)
├── page.tsx              # Landing / Home page
├── (auth)/               # Route group for auth pages (future)
│   ├── login/page.tsx
│   └── register/page.tsx
└── dashboard/            # Protected dashboard pages (future)
    ├── layout.tsx        # Uses DashboardLayout template
    ├── page.tsx          # Dashboard home
    ├── schedule/page.tsx # Schedule view
    ├── tasks/page.tsx    # Tasks kanban
    └── settings/page.tsx # User settings
```

## Key Concepts

### Route Groups `(groupName)/`

Use parenthesized folder names to group routes that share a layout without affecting the URL path:

- `(auth)/` — groups login and register under `AuthLayout` template
- URL remains `/login`, not `/(auth)/login`

### Layouts vs Pages

- **`layout.tsx`**: Wraps all child routes. Persistent across navigation. Use for navigation bars, sidebars.
- **`page.tsx`**: The actual content for a URL segment. Re-renders on navigation.

### Server vs Client Components

By default, Next.js App Router components are **Server Components**. Add `"use client"` at the top only when you need:
- Browser APIs (`window`, `document`, event listeners)
- React hooks (`useState`, `useEffect`, custom hooks)
- Interactive elements (forms, buttons with onClick)

**Rule of thumb:** Keep pages as Server Components that fetch data, and delegate interactivity to Client Component organisms from `@/components`.

## Page Patterns

### Server Component Page (data fetching)

```tsx
// app/dashboard/schedule/page.tsx
import { ScheduleGrid } from "@/components";

export default async function SchedulePage() {
  // Server-side data fetching (future)
  // const subjects = await getSubjects();

  return (
    <div>
      <h1>Mi Horario</h1>
      <ScheduleGrid />
    </div>
  );
}
```

### Client Component Page (interactive)

```tsx
// app/dashboard/tasks/page.tsx
"use client";

import { KanbanBoard } from "@/components";
import { useTasks } from "@/features/tasks/hooks/useTasks";

export default function TasksPage() {
  const { tasks, updateStatus } = useTasks();

  return <KanbanBoard tasks={tasks} onStatusChange={updateStatus} />;
}
```

### Dashboard Layout Pattern

```tsx
// app/dashboard/layout.tsx
import { DashboardLayout } from "@/components";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

## Connecting to Atomic Design Components

Pages are the **consumers** of the Atomic Design component hierarchy:

| Page | Template | Organisms Used |
|------|----------|---------------|
| `(auth)/login` | `AuthLayout` | LoginForm |
| `dashboard/*` | `DashboardLayout` | *varies by page* |
| `dashboard/schedule` | *inherited* | `ScheduleGrid` |
| `dashboard/tasks` | *inherited* | `KanbanBoard` |

Pages should **never** define their own reusable UI elements — those belong in `@/components`.

## Feature Hooks and State

Feature-specific logic (API calls, state management) lives in `frontend/src/features/`:

```
frontend/src/features/
├── auth/
│   └── AuthContext.tsx
├── schedule/
│   └── hooks/useSchedule.ts
└── tasks/
    └── hooks/useTasks.ts
```

Pages import hooks from features, not raw `fetch()` calls.

## API Client

All HTTP calls go through `frontend/src/lib/api.ts` which handles:
- Base URL configuration
- JWT token injection via interceptor
- Consistent error handling

Pages and hooks should use this client rather than calling `fetch()` directly.

## Creating a New Page — Checklist

1. **Choose the route**: Determine the URL path and find or create the directory
2. **Pick server or client**: Does this page need interactivity? If yes, add `"use client"`
3. **Select the template**: Which layout wraps this page? If none exists, create one in `components/templates/`
4. **Use existing organisms**: Compose the page from organisms in `@/components`
5. **Add feature hooks** if needed in `@/features/<module>/hooks/`
6. **Set metadata**: Export `metadata` object for SEO (title, description) in server components

## SEO and Metadata

Every page should export metadata for SEO:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Horario | University Scheduler",
  description: "Visualiza y gestiona tu horario universitario",
};
```

## Loading and Error States

Use Next.js conventions for loading/error handling:

```
app/dashboard/schedule/
├── page.tsx
├── loading.tsx    # Suspense boundary loading UI
└── error.tsx      # Error boundary UI ("use client" required)
```

## Related Skills

- **frontend-atomic-design**: For the components consumed by pages
- **typescript-advanced-types**: For page props and metadata types
