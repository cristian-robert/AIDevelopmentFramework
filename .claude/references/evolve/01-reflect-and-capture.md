# /evolve — Steps 1+2: Reflect + Capture Learnings

## Step 1: Reflect on session

1. `git log --oneline main..HEAD` — what was built.
2. Were there any:
   - Bugs that took multiple attempts to fix?
   - Patterns the AI got wrong repeatedly?
   - Missing context that caused mistakes?
   - New conventions established?
   - Architecture decisions made?

## Step 2: Capture learnings (KB-first)

Every session learning starts in the wiki:

1. For each learning → create `<kb-path>/raw/sessions/YYYY-MM-DD-<topic>.md` (raw notes).
2. Create stub wiki article (type: `session-learning`) in `<kb-path>/wiki/`.
3. Update `raw/_manifest.md` (status: pending) and `wiki/_index.md`.

If KB is off (per `_shared/kb-detect.md`) → write learnings to `.claude/.session-learnings.md` instead. Surface this in the one-line output so the user knows to enable KB or migrate manually.

## Step 2.5: File-size guardrail

Run the lint:

```bash
npx ai-development-framework file-size-check
```

Exit codes drive the next action (per `.claude/references/_shared/file-size-guard.md`):

- `0` (all green) → continue.
- `1` (soft-cap warnings) → record `size-warn=N` for the one-line output. Don't extract automatically; warn the user that a follow-up `/evolve` may be needed if the file keeps growing.
- `2` (hard-cap blockers) → **blocker.** For each blocked file, apply the extraction rules from `_shared/file-size-guard.md`:
  1. Fold load-bearing content that already lives in a reference into a one-line pointer.
  2. Move narrow / phase-specific content into `.claude/references/<topic>-detail.md` or a per-command subdirectory; cite with a load condition (`_shared/load-conditions.md`).
  3. Inline mini-steps over 8 lines → per-step reference under `.claude/references/<command>/`.
  4. Re-run the lint; only proceed when exit is 0 or 1.

Never delete content during extraction — relocation only.
