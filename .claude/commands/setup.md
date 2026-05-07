# /setup — Framework Health Check

Checks installed plugins, skills, MCP servers, framework files. Reports gaps.

**Output:** one line per `_shared/output-contract.md`.

## Steps

1. **Plugins** — verify each in `setup/01-plugin-tables.md` (core + recommended + stack-specific).
2. **Design-artifact skills** — see `setup/01-plugin-tables.md` (huashu-design + version-drift check).
3. **MCP servers** — see `setup/01-plugin-tables.md`.
4. **Framework files** — see `setup/01-plugin-tables.md` (commands, rules, agents, references subdirs, hooks).
5. **Design-artifact pipeline readiness** — see `setup/01-plugin-tables.md` (only when project commits design work).
6. **Context guardrail** — `node cli/file-size-check.js` (always; per `_shared/file-size-guard.md`).

## Output (one line)

- **All checks pass:** `Setup OK · plugins=N MCP=N framework=ok · Next: /prime`
- **Recommended items missing:** `Setup OK with N recommended missing · Next: /prime (or install: <one-liner>)`
- **Required items missing:** **blocker** — print exact install commands grouped by category and stop.
- **Drift detected on huashu-design:** **blocker** — show both hashes + brand-spec re-verification step.
- **Context guardrail blocked (`size-check` exit 2):** **blocker** — print the violating files and tell the user to run `/evolve`.

`/setup --verbose` is the only mode that prints the full per-plugin / per-MCP / per-file table. Default mode reports gaps, not green checks.
