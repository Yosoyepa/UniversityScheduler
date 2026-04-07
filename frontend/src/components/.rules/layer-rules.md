# Layer Rules: `frontend/src/components/`

## Required Skills

Before making any changes in this directory, consult these skills:

### Primary: `frontend-atomic-design`
**Always use** when creating, modifying, or organizing any component inside `frontend/src/components/`.

This skill enforces:
- Atomic Design hierarchy: atoms → molecules → organisms → templates
- Composition rules (each level composes only from the level below)
- Barrel export pattern (`index.ts` in each subdirectory)
- One component per file with PascalCase naming
- TypeScript props interfaces

### When to Also Use:

| Scenario | Additional Skill |
|----------|-----------------|
| Creating or modifying pages that consume these components | `frontend-app-router` |
| Complex TypeScript prop types or generics | `typescript-advanced-types` |
| Keeping components simple and focused | `code_simplicity` |

## Directory Structure

```
components/
├── atoms/       # Indivisible UI primitives (Button, Input, Badge, Icon, Label)
├── molecules/   # Atom compositions (FormField, ClassCard, TaskCard)
├── organisms/   # Feature sections (ScheduleGrid, KanbanBoard, modals)
├── templates/   # Layout skeletons (DashboardLayout, AuthLayout)
└── index.ts     # Root barrel re-exporting all categories
```

## Critical Rules

1. **Atoms** → no imports from molecules, organisms, or templates
2. **Molecules** → import only atoms
3. **Organisms** → import atoms and molecules
4. **Templates** → import atoms, molecules, and organisms (rarely)
5. **Always update barrel exports** (`index.ts`) when adding new components
6. **No business logic in atoms or molecules** — keep them purely presentational. Mutation hooks (`useAuth`, `useTasks`, etc.) are STRICTLY PROHIBITED in Atmos and Molecules; they belong in Organisms or Templates.
7. **No direct API calls in components** — use feature hooks from `@/features/`
8. **Premium Glassmorphism Aesthetic** — Floating elements (Modals, Dropdowns) MUST use `backdrop-blur-sm` (or similar utility) and apply consistent semantic BEM classes mapped in `globals.css` (e.g., `.modal-body`) instead of ad-hoc CSS.
9. **Component Interactivity** — Components utilizing heavy interactive hooks (like Framer Motion, Context consumers) must explicitly declare `"use client"` at the top.
