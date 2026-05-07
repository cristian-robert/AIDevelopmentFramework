# /ship — Commit, Push, and Create PR

Full shipping workflow: pre-flight → KB update → security → optional Codex → commit → push → PR.

**Output:** one line per `_shared/output-contract.md`.

## Steps (load on demand)

| # | Step | Reference | Load condition |
|---|------|-----------|----------------|
| 1 | Pre-flight (tests, branch, /validate gate, QA coverage) | `ship/01-preflight.md` | always |
| 1.4 | Auto-evolve fallback | `ship/14-evolve-fallback.md` | only if `.claude/.evolve-ran` is missing or stale (>1h) |
| 1.5 | Update KB | `ship/15-kb-update.md` | only if KB configured per `_shared/kb-detect.md` |
| 1.6 | Security pre-flight | `ship/16-security.md` | always |
| 1.7 | Codex adversarial review | `ship/17-codex-review.md` | only if Codex plugin installed |
| 2–4 | Commit + push + PR | `ship/2-commit-push-pr.md` | always |

## Output (one line)

```
PR #<n> opened: <url> · branch=<name> · closes #<issue> · Next: /evolve (after merge)
```

Step 1.6 security FAILs and Step 1.7 significant-concern blockers print only the failing items + remediation and stop the pipeline — they do not emit the one-line summary.
