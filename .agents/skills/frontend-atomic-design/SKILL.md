---
name: frontend-atomic-design
description: Guide for building and organizing UI components using Atomic Design methodology in the UniversityScheduler Next.js frontend. Use this skill whenever creating, modifying, or organizing components inside frontend/src/components/, including atoms (Button, Input, Badge, Icon, Label), molecules (FormField, ClassCard, TaskCard), organisms (ScheduleGrid, KanbanBoard, modals), and templates (DashboardLayout, AuthLayout). Also use when the user mentions component hierarchy, atomic design, design system, reusable UI, or component composition patterns.
---

# Frontend Atomic Design

This skill defines how to build and organize UI components in `frontend/src/components/` following the Atomic Design methodology established in this project.

## Component Hierarchy

```
frontend/src/components/
├── atoms/            # Smallest, indivisible UI primitives
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   ├── Icon.tsx
│   ├── Label.tsx
│   └── index.ts      # Barrel export
├── molecules/        # Combinations of atoms with specific behavior
│   ├── FormField.tsx  # Input + Label
│   └── index.ts
├── organisms/        # Complex, feature-ready sections (future)
│   ├── ScheduleGrid.tsx
│   ├── KanbanBoard.tsx
│   └── index.ts
├── templates/        # Page-level layout skeletons
│   ├── DashboardLayout.tsx
│   ├── AuthLayout.tsx
│   └── index.ts
└── index.ts          # Root barrel: re-exports all categories
```

## Level Definitions

### Atoms (`atoms/`)

The smallest building blocks — a single UI element with no internal composition.

**Rules:**
- Zero business logic; purely presentational
- Accept props for variants, sizes, states (via TypeScript interfaces)
- Should be fully self-contained (own styles)
- Examples: `Button`, `Input`, `Badge`, `Icon`, `Label`

**Existing pattern** (from `Button.tsx`):
- Uses TypeScript interface for props with `variant`, `size`, `disabled` etc.
- Applies CSS classes based on props
- Exports both the component and its props type

**When to create a new atom:** When you have a primitive UI element used in 2+ molecules or organisms that isn't a composition of other atoms.

### Molecules (`molecules/`)

Combinations of 2+ atoms that work together as a unit.

**Rules:**
- Compose atoms only — never import other molecules
- Have a clear, singular purpose
- May contain light state management (e.g., controlled inputs)
- Import atoms from `@/components/atoms` or `@/components`
- Examples: `FormField` (Label + Input), `ClassCard`, `TaskCard`

**When to create a molecule:** When you find yourself repeating the same atom combination across multiple places.

### Organisms (`organisms/`)

Complex, feature-level components that combine molecules and atoms into functional sections.

**Rules:**
- Compose molecules and atoms
- Can have significant state management
- Often receive data via props and delegate display to molecules
- May use custom hooks from `@/features/<module>/hooks/`
- Examples: `ScheduleGrid`, `KanbanBoard`, `ClassFormModal`, `TaskFormModal`

**When to create an organism:** When you're building a feature-specific section of a page (a schedule grid, a kanban board, a form modal).

### Templates (`templates/`)

Page-level layout skeletons that define the structural arrangement of organisms.

**Rules:**
- Define slot-based layouts (sidebar + content, header + body)
- Accept `children` as the primary content
- Handle navigation, sidebar state, responsive breakpoints
- No feature-specific logic — templates are reusable across pages
- Examples: `DashboardLayout` (sidebar + header + content), `AuthLayout` (centered card)

**When to create a template:** When you need a new page layout structure not covered by existing templates.

## Composition Rule (Critical)

Each level composes only from the level below:

| Level | Can Import |
|-------|------------|
| Atoms | Nothing (external deps only) |
| Molecules | Atoms |
| Organisms | Atoms, Molecules |
| Templates | Atoms, Molecules, Organisms (rarely) |

**Never** have atoms importing molecules, or molecules importing organisms.

## Barrel Exports Pattern

Each subdirectory has an `index.ts` that re-exports all components:

```typescript
// atoms/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Badge } from "./Badge";
export { Icon } from "./Icon";
export { Label } from "./Label";
```

The root `components/index.ts` re-exports all categories:
```typescript
export * from "./atoms";
export * from "./molecules";
export * from "./templates";
```

When you add a new component, always update the relevant `index.ts` barrel file.

## Naming and File Conventions

- **One component per file** with PascalCase filename matching the component name
- **Props interface** exported alongside the component: `export interface ButtonProps { ... }`
- **TypeScript** for all components (`.tsx` extension)
- **Default export** or named export — be consistent with existing pattern (this project uses named exports in barrel files)

## Styling Approach

This project uses CSS (not Tailwind) by default. The root layout loads `globals.css`. When styling components:
- Use CSS Modules for component-scoped styles (preferred)
- Use inline styles sparingly for dynamic values only
- Follow the design system tokens if established

## Adding a New Component — Checklist

1. **Determine the correct level**: Is it an atom, molecule, organism, or template?
2. **Create the `.tsx` file** in the appropriate directory
3. **Define the props interface** with TypeScript
4. **Implement the component** composing only from lower levels
5. **Update the `index.ts`** barrel in the same directory
6. **Verify the root barrel** (`components/index.ts`) re-exports the category

## Related Skills

- **frontend-app-router**: For pages that consume these components
- **typescript-advanced-types**: For complex component prop types and generics
