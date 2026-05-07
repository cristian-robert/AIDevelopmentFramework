# /kb-compile — Knowledge Base Compiler

Deep-compile: expand stubs into full articles, cross-link concepts, extract new topics, run health check, rebuild indexes.

**Args:** optional scope — tag name (`architecture`), filename (`monads.md`), or `all` / omitted.

**Output:** one line per `_shared/output-contract.md`.

## Prerequisites

KB must be configured (per `_shared/kb-detect.md`). At least one article in `wiki/`. Otherwise blocker — direct user to `/kb-ingest`.

## Phases (load on demand)

| # | Phase | Reference |
|---|-------|-----------|
| 1 | Scan for work | `kb-compile/01-scan.md` |
| 2 | Expand stubs | `kb-compile/02-expand-stubs.md` |
| 3 | Cross-link articles | `kb-compile/03-cross-link.md` |
| 4 | Extract new concepts | `kb-compile/04-extract-concepts.md` |
| 5 | Health check + stats.md | `kb-compile/05-health-check.md` |
| 6 | Rebuild indexes | `kb-compile/06-rebuild-indexes.md` |
| 7 | Karpathy lint pass | `kb-compile/07-lint-pass.md` |
| 8 | Update manifest | `kb-compile/08-update-manifest.md` |

## Output (one line)

```
Compiled N stubs · M new · K cross-links · H health issues · stats=<KB_PATH>/_search/stats.md · Next: /kb-compile (if H>0) or /start
```

Errors (missing source files, unreadable articles) → blocker, list them and stop. Phase 7 lint-approval prompts are blockers, not output.
