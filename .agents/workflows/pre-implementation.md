---
description: pre-implementation checklist — consult skills and layer rules before writing code
---

# Pre-Implementation Checklist

Every time you are about to **write, modify, or refactor code** in this project, follow these steps **before touching any file**.

## Step 1: Identify the target layer

Determine which directory/layer you are working in:

| Directory | Layer | Primary Skill |
|-----------|-------|---------------|
| `backend/app/modules/<name>/domain/` | Domain | `backend-hexagonal-module` |
| `backend/app/modules/<name>/port/` | Port | `backend-hexagonal-module` |
| `backend/app/modules/<name>/application/` | Application | `backend-hexagonal-module` |
| `backend/app/modules/<name>/adapter/` | Adapter | `backend-hexagonal-module` |
| `backend/app/modules/<name>/infrastructure/` | Infrastructure | `backend-hexagonal-module` |
| `backend/app/shared/` | Shared Kernel | `backend-shared-kernel` |
| `backend/app/cross_cutting/` | Cross-Cutting | `backend-cross-cutting` |
| `frontend/src/components/atoms/` | Atoms | `frontend-atomic-design` |
| `frontend/src/components/molecules/` | Molecules | `frontend-atomic-design` |
| `frontend/src/components/organisms/` | Organisms | `frontend-atomic-design` |
| `frontend/src/components/templates/` | Templates | `frontend-atomic-design` |
| `frontend/src/app/` | Pages / Routes | `frontend-app-router` |
| `frontend/src/features/` | Hooks / Context | `frontend-atomic-design` + `frontend-app-router` |

## Step 2: Read the layer-rules.md

Open and read the `.rules/layer-rules.md` file inside the target directory **before writing code**.

```bash
# Example
cat backend/app/modules/.rules/layer-rules.md
cat frontend/src/components/.rules/layer-rules.md
```

## Step 3: Read the primary skill

Use `view_file` on the primary skill's `SKILL.md` before writing any implementation.

The skill defines:
- Exact patterns to follow (class structure, imports, naming)
- Import rules (what can depend on what)
- Anti-patterns to avoid

## Step 4: Identify secondary skills if applicable

Check the "When to Also Use" section in `layer-rules.md` and read additional skills if needed.

## Step 5: Implement following the skill patterns EXACTLY

- ✅ Use the same base classes, decorators, signatures as the skill examples
- ✅ Follow the import boundary rules
- ✅ Use the project's shared exceptions, value objects, events (not custom ones)
- ❌ Do NOT use patterns from other frameworks/projects

## Step 6: Commit each logical unit separately (git-commit skill)

After each **coherent logical unit** is complete, make a commit. Logical units are:

| Unit | Commit scope |
|------|-------------|
| One layer file (e.g. `domain/entities.py`) | One commit |
| One layer group (e.g. `adapter/schemas.py` + `adapter/router.py`) | One commit |
| Bug fix in any file | One commit |
| Refactor | One commit |
| Config change | One commit |

```bash
# Stage only the files for this logical unit
git add <specific_files>

# Commit with conventional commit format
git commit -m "feat(<scope>): <description>"
```

## Step 7: Never batch multiple layers into one commit

❌ BAD: `git add .` then `git commit -m "feat: implement tasks module`
✅ GOOD: 6 separate commits, one per layer

---

## Quick Reference: Skill → Layer Mapping

```
backend-hexagonal-module  →  modules/<name>/{domain,port,application,adapter,infrastructure}
backend-shared-kernel     →  shared/domain/{entities,events,exceptions,value_objects}
backend-cross-cutting     →  cross_cutting/{auth,middleware,exception_handler}
frontend-atomic-design    →  components/{atoms,molecules,organisms,templates} + features/
frontend-app-router       →  app/{page,layout,loading,error}.tsx
git-commit                →  EVERY commit in the entire project
```
