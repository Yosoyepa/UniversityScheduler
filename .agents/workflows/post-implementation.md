---
description: post-implementation checklist — update tracking documents, run tests, and make commits
---

# Post-Implementation Checklist

Every time you **finish implementing a feature, layer, or bugfix**, you MUST follow these steps before moving on to the next task or yielding control back to the user.

## Step 1: Update the Global Tracking Checklist (MANDATORY)

The project maintains a living document of its progress based on the initial architectural analysis.

1. Open `.implementation_tasks/analysis_v2.0_tracking.md`.
2. Find the current Phase or feature you just implemented.
3. Change the `[ ]` to `[x]` for the completed items.
4. If you completed a new sub-task not originally listed, add it to the checklist and mark it as done `[x]`.
5. This folder is in `.gitignore`, so updates to this file stay local and act as the agent's memory/tracking system.

## Step 2: Verify the Code Compiles / Type Checks

- **Backend**: Run `python -c "import app.main"` or run pytest.
- **Frontend**: Run `npm run lint` or `npx tsc --noEmit`.

Fix any errors before proceeding.

## Step 3: Run the Git Commit Skill

Follow Rule 3 from `.agents/rules.md`: **One Logical Unit = One Commit**.

If you haven't committed your work yet, use the `git-commit` skill to analyze your diff and create atomic commits.

```bash
# Example: If you finished the domain and port layers
git add backend/app/modules/<module>/domain/
git add backend/app/modules/<module>/port/
# Then run git-commit logic
```

## Step 4: Summary for the User

Always provide a brief summary of what you implemented and confirm that the tracking document has been updated.
