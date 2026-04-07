# Layer Rules: `frontend/src/app/`

## Required Skills

Before making any changes in this directory, consult these skills:

### Primary: `frontend-app-router`
**Always use** when creating, modifying, or organizing files inside `frontend/src/app/`, including `page.tsx` files, `layout.tsx` wrappers, route groups, loading/error states, and API route handlers.

This skill enforces:
- Next.js App Router conventions (file-based routing)
- Server vs Client Component decisions
- Route group patterns `(groupName)/`
- SEO metadata exports
- Loading and error boundary patterns

### When to Also Use:

| Scenario | Additional Skill |
|----------|-----------------|
| Creating or composing UI components used in pages | `frontend-atomic-design` |
| Complex TypeScript for page props | `typescript-advanced-types` |
| Keeping pages simple by delegating to components | `code_simplicity` |

## Directory Convention

```
app/
├── layout.tsx              # Root layout (html + body + fonts)
├── globals.css             # Global styles
├── page.tsx                # Home / landing page
├── (auth)/                 # Route group for auth pages
│   ├── login/page.tsx
│   └── register/page.tsx
└── dashboard/              # Protected area
    ├── layout.tsx          # Uses DashboardLayout template
    ├── page.tsx            # Dashboard home
    ├── schedule/
    │   ├── page.tsx
    │   ├── loading.tsx     # Loading skeleton
    │   └── error.tsx       # Error boundary
    └── tasks/page.tsx
```

## Critical Rules

1. **Pages consume components** — never define reusable UI here; use `@/components/`
2. **Default is Server Component** — only add `"use client"` when you need hooks or browser APIs
3. **Export metadata** — every page should export `Metadata` for SEO
4. **Use templates from Atomic Design** — `DashboardLayout`, `AuthLayout` etc.
5. **Feature hooks** live in `@/features/<module>/hooks/` — not inlined in pages
6. **API calls** go through `@/lib/api.ts` — never call `fetch()` directly in pages
7. **Hydration Prevention** — Strict HTML hierarchy must be maintained in layouts/pages to prevent Next.js hydration mismatch errors (e.g., never nest `<div>` inside `<p>`).
8. **Route Protection** — Protected routes (e.g. `/dashboard`) must enforce security via Server Layouts or HOC interceptors that strictly push to `/login` if unauthenticated.
9. **Dark Mode Ecosystem** — Visuals must adhere to the global `ThemeProvider`. Always use the `.dark` class semantics for dark mode compatibility instead of hardcoding non-responsive colors.
