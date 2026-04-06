---
trigger: always_on
---

# Global Project Rules: UniversityScheduler

## ⚠️ MANDATORY: Pre-Implementation Protocol

**Before writing ANY code in this repository**, you MUST follow the `/pre-implementation` workflow.

This is NON-NEGOTIABLE and applies to every single file change.

---

## ⚠️ MANDATORY: Pre-Commit Build Protocol

**Before executing ANY Git Commit**, you MUST follow the `/implementation` workflow.

This is NON-NEGOTIABLE. You are strictly forbidden from committing code that has not passed compilation checks (e.g., `npm run build` or `npx tsc`). Never commit blindly.

---

## Rule 1: Always Read Layer Rules Before Implementing

Every major directory in this project has a `.rules/layer-rules.md` file that specifies:
- Which skill to consult (the PRIMARY skill)
- Which additional skills apply for edge cases
- Directory conventions and critical rules

**You MUST read the relevant `.rules/layer-rules.md` before modifying any file in that directory.**

### Layer Rules Files Location

```
backend/app/modules/.rules/layer-rules.md       → backend-hexagonal-module skill
backend/app/shared/.rules/layer-rules.md        → backend-shared-kernel skill
backend/app/cross_cutting/.rules/layer-rules.md → backend-cross-cutting skill
frontend/src/app/.rules/layer-rules.md          → frontend-app-router skill
frontend/src/components/.rules/layer-rules.md   → frontend-atomic-design skill
```

---

## Rule 2: Always Read the Skill Before Implementing

After identifying the layer, use `view_file` to read the full `SKILL.md` before writing code.

**Skills define:**
- Exact class/function patterns to follow
- Import boundary rules (what can import what)
- Anti-patterns to avoid
- Examples from the existing codebase

---

## Rule 3: One Logical Unit = One Commit (git-commit skill)

Every implementation must produce **atomic, traceable commits** using the `git-commit` skill.

| Change type | Commit granularity |
|-------------|-------------------|
| New file (any layer) | 1 commit per file OR 1 commit per related group |
| Bug fix | 1 commit |
| Refactor | 1 commit |
| Config change | 1 commit |

**Never use `git add .` to stage everything in one commit.**

Commit format (Conventional Commits):
```
feat(<scope>): <description>
fix(<scope>): <description>
refactor(<scope>): <description>
chore(<scope>): <description>
```

---

## Rule 4: Import Boundaries Are Strict

| Layer | Can import from |
|-------|-----------------|
| `domain/` | `app.shared.domain.*` ONLY |
| `port/` | `domain/` entities only |
| `application/` | `domain/`, `port/`, `app.shared.*` |
| `adapter/` | `application/`, `port/`, `domain/`, `app.cross_cutting.*` |
| `infrastructure/` | `domain/` mappings, `app.shared.infrastructure.*` |

**Outer layers NEVER import from inner layers in reverse.**

---

## Rule 5: Use Shared Kernel, Not Custom

- **Exceptions**: Always use `app.shared.domain.exceptions.*` — never define module-specific exceptions
- **Base Entity**: Always use `app.shared.domain.entities.Entity` as base — never raw `@dataclass`
- **Timestamps**: Always use `utc_now()` from `app.shared.domain.entities` — never `datetime.now()`
- **Events**: Always use `app.shared.domain.events.*` — never define local event classes

---

## Rule 6: Git Flow Branch Strategy

| Branch | Purpose | Merge target |
|--------|---------|--------------|
| `phase-N/<feature>` | Active feature development | `develop` |
| `develop` | Integration branch | `main` |
| `main` | Production-ready releases | — |

- **Never force-push** `develop` or `main`
- **Use `--force-with-lease`** (not `--force`) on feature branches if history was rewritten
- **Always merge with `--no-ff`** to preserve branch history

---

## Rule 7: Always Update the Global Tracking Checklist

**After finishing ANY implementation block or bugfix**, you MUST follow the `/post-implementation` workflow.

This requires you to open and update the local checklist located at:
`.implementation_tasks/analysis_v2.0_tracking.md`

This document is your source of truth. Mark completed tasks `[x]` to maintain an accurate memory of the project state across sessions.

---

## Skill Directory

```
.agents/skills/
├── backend-hexagonal-module/SKILL.md   ← modules layer
├── backend-shared-kernel/SKILL.md      ← shared domain
├── backend-cross-cutting/SKILL.md      ← middleware, auth
├── frontend-atomic-design/SKILL.md     ← components
├── frontend-app-router/SKILL.md        ← pages, routing
├── git-commit/SKILL.md                 ← every commit
├── solid_principles/SKILL.md           ← use case design
├── defensive_programming/SKILL.md      ← validation
└── testable_code/SKILL.md              ← pure functions, mocks
```
