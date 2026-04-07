---
description: Run the custom bash linter to validate architecture layer rules
---

# Validate Layer Rules Workflow

This workflow ensures that the codebase adheres to the architectural rules established during the MVP phases (Hexagonal Architecture and Atomic Design boundaries).

1. Execute the validation script located in the `scripts` directory.

// turbo
2. Run the bash linter script:
```bash
./scripts/validate_layer_rules.sh
```

3. If the script exits with an error (exit code > 0), review the violations and fix them before committing any code or using `git-commit`. The validation checks for:
   - Business Logic Hooks leaking into Frontend Atoms.
   - Domain and Port directories importing from Adapters and Infrastructure in the Backend.
   - Frontend direct `fetch()` calls bypassing the `api.ts` feature hooks.
