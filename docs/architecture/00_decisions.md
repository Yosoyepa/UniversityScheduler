# Architecture Decision Records (ADR)

## ADR-001: Technology Stack Selection

**Status**: Accepted  
**Date**: 2026-01-24  
**Context**: We need a modern, free-tier compatible stack for a University Scheduler. The team has expertise in Python and TypeScript.  
**Decision**:
*   **Backend**: Python with **FastAPI**.
    *   *Reason*: High performance (asyncio), automatic OpenAPI docs, excellent ecosystem for data-heavy apps.
*   **Frontend**: TypeScript with **Next.js**.
    *   *Reason*: Industry standard, React ecosystem, Vercel optimization (free tier).
*   **Database**: **PostgreSQL**.
    *   *Reason*: Relational data (schedule/tasks) requires strong consistency and complex joins.

## ADR-002: Architectural Pattern (Cloud Agnosticism)

**Status**: Accepted  
**Context**: The application must run on a free tier (Render/Railway) initially but be easily portable to AWS/GCP without code rewrites.  
**Decision**: Use **Hexagonal Architecture (Ports & Adapters)** within a **Modular Monolith**.
*   **Core Principle**: The Domain layer MUST NOT import frameworks or cloud SDKs.
*   **Implementation**:
    *   Infrastructure dependencies (DB, File Storage, Email) are injected as interfaces (Ports).
    *   Adapters (e.g., `SupabaseStorageAdapter`, `S3StorageAdapter`) plug into these ports.
**Consequences**:
*   Slightly more boilerplate (defining interfaces).
*   Massive gain in portability and testability.

## ADR-003: Database Strategy

**Status**: Accepted  
**Context**: Zero-cost requirement for the database.  
**Decision**: Use **Supabase** (Managed PostgreSQL Free Tier).
*   **Abstraction**: Use `SQLAlchemy` or `Prisma` (ORM) to prevent vendor lock-in to Supabase specifics.
*   **Backup**: Logical backups to ensure data portability.
