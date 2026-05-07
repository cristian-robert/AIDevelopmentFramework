# /kb-search — Knowledge Base Search

Search the wiki for articles matching a query. Optional filters: article type and tags.

**Args:** `$ARGUMENTS` = query text, optionally followed by `--type=X` and/or `--tag=X` and/or `--full`.

**Output:** display-purpose command — exempt from one-line rule, but stays lean (no banners, no separators).

## Steps

1. **Detect KB** per `_shared/kb-detect.md`. If KB is off → use default `.obsidian`.

2. **Parse args:** query = everything before any `--` flag. Flags: `--type=X`, `--tag=X`, `--full`.

3. **Run search:**

   ```bash
   KB_PATH=<kb-path> node cli/kb-search.js search "<query>" [--type=X] [--tag=X]
   ```

   Output is JSON array. Each item: `file`, `title`, `type`, `tags`, `score`, `excerpt`.

4. **Output (lean table):**

   ```
   KB: "<query>" · N hits
   1. <title> [<type>] · <file> · <one-line excerpt>
   2. <title> [<type>] · <file> · <one-line excerpt>
   ...
   ```

   Top 5 results max.

   If `--full` passed → additionally Read top 1 article body inline.

   If 0 results: `KB: "<query>" · 0 hits · Try /kb-ingest <source> or /kb-ask <question>`.
