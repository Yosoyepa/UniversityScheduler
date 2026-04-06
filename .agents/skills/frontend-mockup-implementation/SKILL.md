---
name: frontend-mockup-implementation
description: Implement and replicate pixel-perfect UI designs from the docs/mockups directory by strictly translating their HTML/CSS components into functional atomic React components using Tailwind CSS. Use this skill whenever building, modifying, or styling frontend features to ensure the functional app matches the professional mockups.
---

# Frontend Mockup Implementation Skill

This skill provides the process and rules for effectively taking the high-fidelity UI design mockups found in `docs/mockups/` and translating them into the Next.js `frontend/` project. The agent assumes the role of an **Expert UI/UX Frontend Engineer** with an emphasis on pixel-perfect React implementation mapped to existing Tailwind structures.

## Core Mandate
**Never invent designs.** Whenever the user asks you to implement or update a frontend view (like the schedule grid, task management, progress bars, etc.), you must consult the corresponding mockup and reflect its exact typography, spacing, and styling in the project code. 

## Workflow

### 1. Identify the Correct Mockup
Review `docs/mockups/README.md` to map the requested feature URL or area to the correct mockup folder.
- Example: If the user asks to work on `/dashboard/tasks`, the mockup to consult is `tasks_and_exams_manager_x`.

### 2. Analyze the Mockup
Always read the `code.html` file inside the identified mockup directory to extract precise data:
- **Tailwind Utility Classes:** Capture the exact Tailwind utility combinations used for grid alignments, flexbox layouts, rounded corners, drop shadows, etc.
- **Custom Spacing & Typography:** Map the font families (like `Inter`), text sizing, font weights, leading, flex layouts, and padding patterns.
- **Color Palettes:** Capture precise hex codes or semantic color layers mapped (e.g. `indigo-600`, `gray-900/50`).

### 3. Translate to Atomic Design
When translating the HTML/Tailwind from `code.html` to our Next.js frontend:
1. Adhere to the `frontend-atomic-design` rules.
2. Break down `code.html` sections into React Components (Atoms, Molecules, Organisms).
3. Use the global design system (if they reference `text-primary` or `bg-surface-dark`, ensure those are correctly applied in `tailwind.config.ts`, or adapt the raw hex colors functionally).

### 4. Interactive Components & States
Look closely at interactive components like inputs, toggles, borders on focus, and hover states indicated in the HTML (classes like `hover:bg-primary-hover` or `focus:ring-primary`, `transition-all`).
- Implement these strictly in React state using standard HTML/CSS interactive handlers to guarantee a dynamic and responsive user experience.

## Eval Queries
To test formatting mastery, standard tasks for this skill involve:
1. "Update the Add Class Modal to look exactly like the `add_and_edit_class_details_1` mockup."
2. "Refactor the Task Kanban column styling to perfectly mirror the mockup provided in `tasks_and_exams_manager_2`."
3. "Match the navigation header of our generic dashboard to `university_schedule_dashboard_1`."

---
**Remember:** Each React front-end TSX file carries a globally-enforced top-level design rule reminding you of this very workflow. Respect it!
