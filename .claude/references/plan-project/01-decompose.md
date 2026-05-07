# /plan-project — Phases 1–3: Parse PRD + Decompose + Order

## Phase 1: Parse PRD

1. Read the PRD file.
2. Identify implementation phases — each becomes a **GitHub milestone**.
3. Within each phase, identify discrete features — each becomes a **GitHub issue**.

## Phase 2: Decompose into issues

For each feature/task:

1. Title: `[type]: brief description`.
2. Body using `.claude/references/issue-template.md` format:
   - Description (what and why)
   - Acceptance criteria (testable checkboxes)
   - Technical notes (files to modify, patterns to follow)
   - Size estimate (S/M/L/XL)
3. Labels: type (`feat`/`fix`/`chore`), priority, size.
4. Map dependencies: which issues block which.

## Phase 3: Determine order

1. Build dependency graph.
2. Identify critical path (longest chain of blocking dependencies).
3. Identify parallelizable work (independent issues).
4. Order issues by: dependencies first → critical path → highest value → smallest size.
