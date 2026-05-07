# /prime — Step 5: KB Lean Load

Per `_shared/kb-detect.md`. If KB is off → skip Step 5 entirely.

1. **Read lean index:** `<kb-path>/_search/lean-index.json` — metadata-only view, loaded silently into context. If file missing, skip silently.
2. **Task keywords captured in Step 0:** run `KB_PATH=<kb-path> node cli/kb-search.js search "<keywords>" --limit=3` and absorb the top 3 lean summaries into context. **Do not echo them to the user.** Full article bodies load on demand later.
3. **No task:** absorb lean-index entries silently. No grouped display.
