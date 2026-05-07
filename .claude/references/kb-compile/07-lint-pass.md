# /kb-compile — Phase 7: Karpathy Lint Pass

LLM-assisted content audit. Catches what structural checks (Phase 5) cannot.

## Steps

1. **Inconsistent data across articles** — scan compiled articles for conflicting facts (two articles give different values for the same constant, different descriptions of the same pattern). Flag the pair + the disagreement.

2. **Missing data imputation** — for concepts referenced but underspecified, use web search (or `/kb-ingest`/WebSearch) to fetch authoritative data and propose an update diff. **Do not silently edit** — show the user.

3. **Orphan-concept → new article candidates** — list concepts mentioned in 3+ articles without their own wiki page (beyond what Phase 4 created). Propose new stub titles.

4. **Report first, edit after approval** — print all findings to the user. Wait for explicit approval per item before applying edits. Do not batch-apply.
