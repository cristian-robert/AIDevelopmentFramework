# /execute — Step 3: Implementer → Reviewer Loop (mandatory)

For each task, dispatch TWO subagents in sequence. **Model selection per `_shared/model-matrix-summary.md` is mandatory** — load that reference once at the start of Step 3.

## Implementer model resolution

1. Read task's `model:` frontmatter field if present → use it.
2. If absent, fall back to the matrix using `size:` + body content:
   - S/M with all files pinned + complete code + no design language → `sonnet`
   - L/XL OR body contains "choose"/"decide"/"design"/"consider trade-offs"/"refactor architecture" → `opus`
   - Pure read-only inspection task (rare) → `haiku`
3. If `AIDF_MODEL_FLOOR=opus` env set → force `opus`.
4. Never silently downgrade — matrix says opus, use opus.

## Reviewer model

Always `opus` (Tier 5). Reviewers that don't catch real bugs are worse than no reviewer.

## 3a — Task Implementer

1. Announce: `Starting Task N: [task name] — [dispatch] role=task-implementer task=N model=<resolved-model>`
2. Write hook marker: `.claude/hooks/spec-reviewer-marker.sh write implementer`
3. Dispatch via `superpowers:subagent-driven-development` with role `task-implementer` and `model: <resolved-model>`.
4. Implementer reads plan task + mandatory files, writes tests first, implements, verifies.
5. On return: capture diff (`git diff`) and task exit status.

## 3b — Spec Reviewer (MANDATORY — DO NOT SKIP)

1. Announce: `Task N implementer complete — [dispatch] role=spec-reviewer task=N model=opus`
2. Dispatch subagent with role `spec-reviewer` and `model: opus`, passing:
   - Plan task spec
   - Implementer's diff
   - `.claude/references/spec-reviewer-protocol.md`
3. Reviewer runs the protocol checklist + adversarial questions:
   - "Is the implementer's approach the simplest viable?"
   - "What could be cut without losing acceptance criteria?"
   - "What edge case is missing?"
   - "Does any choice contradict an existing pattern/reference?"
4. Reviewer returns PASS or REQUEST_CHANGES with specific blockers.
5. If REQUEST_CHANGES → return to 3a (same resolved model). Do NOT proceed to next task.
6. If PASS → mark task checkbox done; write reviewer marker (`.claude/hooks/spec-reviewer-marker.sh write reviewer`); proceed.

## Marker coupling

The literal dispatch markers in Announce lines (`[dispatch] role=task-implementer task=N` / `[dispatch] role=spec-reviewer task=N`) are structural tokens. The output-compaction Stop hook preserves any line containing `[dispatch] role=` so user-visible compaction never rewrites them (see `.claude/references/hook-ordering.md`). Note: enforcement does NOT scan announcements — the marker file is the single source of truth.
