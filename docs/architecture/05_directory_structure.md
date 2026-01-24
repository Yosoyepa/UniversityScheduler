# Directory Structure & File Organization

This document maps the **Hexagonal Architecture** (Ports & Adapters) to the concrete file structure of the Monorepo.

## High-Level Structure
```text
UniversityScheduler/
├── backend/                # Python (FastAPI) - The Hexagonal Core
├── frontend/               # TypeScript (Next.js) - The UI
├── docs/                   # Architecture & Project Documentation
├── infra/                  # Docker & Deployment Configs
└── README.md
```

## Backend Structure (`backend/`)

The backend is organized by **Feature Modules** (Domain Contexts) to ensure modularity. Each feature contains its own Domain, Application, and Infrastructure layers.

```text
backend/
├── app/
│   ├── main.py                     # App Entrypoint
│   ├── config.py                   # Environment Variables
│   ├── shared/                     # Shared Kernel (Utilities, Base Classes)
│   │   ├── domain/                 # Value Objects (Email, UUID)
│   │   └── infrastructure/         # Shared Adapters (Logging, DB Session)
│   │
│   ├── modules/                    # FEATURE MODULES
│   │   ├── academic_planning/      # Context: Classes, Semesters
│   │   │   ├── domain/             # Entities & Logic (Pure Python)
│   │   │   │   ├── entities.py     # Subject, ClassSession
│   │   │   │   └── services.py     # ConflictDetectionService
│   │   │   ├── application/        # Use Cases
│   │   │   │   ├── dtos.py
│   │   │   │   └── use_cases.py    # AddClassUseCase
│   │   │   ├── port/               # Interfaces
│   │   │   │   └── repository.py   # ISubjectRepository
│   │   │   └── adapter/            # Implementations
│   │   │       ├── router.py       # FastAPI Routes (Primary Adapter)
│   │   │       └── postgres_repo.py# SQLAlchemy Repo (Secondary Adapter)
│   │   │
│   │   ├── tasks/                  # Context: Kanban, Exams
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   ├── port/
│   │   │   └── adapter/
│   │   │
│   │   └── users/                  # Context: Auth, Profiles
│   │       └── ...
│   │
│   └── cross_cutting/              # Middleware, Exception Handlers
│
├── tests/
│   ├── unit/                       # Tests Domain Logic (No DB)
│   ├── integration/                # Tests Adapters (With DB)
│   └── e2e/                        # Tests API Endpoints
│
├── alembic/                        # DB Migrations
├── requirements.txt
└── Dockerfile
```

## Frontend Structure (`frontend/`)

Standard Next.js App Router structure, aligned with Atomic Design principles.

```text
frontend/
├── src/
│   ├── app/                        # App Router (Pages)
│   │   ├── (auth)/                 # Login/Register Group
│   │   ├── dashboard/              # Protected Routes
│   │   │   ├── schedule/
│   │   │   ├── tasks/
│   │   │   └── input/
│   │   └── layout.tsx
│   │
│   ├── components/                 # UI Components
│   │   ├── atoms/                  # Buttons, Inputs, Icons
│   │   ├── molecules/              # FormFields, Card s
│   │   ├── organisms/              # CalendarGrid, KanbanBoard
│   │   └── templates/              # Page layouts
│   │
│   ├── features/                   # Feature-specific Logic
│   │   ├── schedule/
│   │   │   ├── hooks/              # Data fetching
│   │   │   └── types/
│   │   └── tasks/
│   │
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # Axios/Fetch client
│   │   └── utils.ts                # Date formatting, etc.
│   │
│   └── styles/                     # Tailwind & Global CSS
│
├── public/                         # Static Assets
├── package.json
└── tailwind.config.ts
```

## Key Architectural Rules
1.  **Dependency Rule**: `domain` must NEVER import from `adapter` or `infrastructure`.
2.  **Shared Kernel**: `modules` should not import from each other directly. Communication should happen via public APIs or Events (Future).
3.  **Ports**: All external dependencies (Database, Auth Provider, Email) must be defined as Abstract Base Classes (ABCs) in the `port/` directory.
