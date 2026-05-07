# /kb-compile — Phase 8: Update Manifest

For each source successfully woven into a compiled article, update its row in `<KB_PATH>/raw/_manifest.md`:

- `Status` column: `pending` or `updated` → `compiled`
- `Wiki Article` column: set to the wiki article filename (e.g., `wiki/<slug>.md`)
