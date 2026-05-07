# Backend Rules — Skill Chain (full)

1. **KB search** (if KB configured) — `KB_PATH=<path> node cli/kb-search.js search "<keywords>"`
2. **architect-agent RETRIEVE** — understand current module structure before changes
3. **context7 MCP** — verify framework API (NestJS, FastAPI, Express, etc.)
4. **Database MCP** — if schema changes (Supabase MCP or direct SQL)
5. **Implement** — follow patterns from `.claude/references/code-patterns.md`
6. **architect-agent RECORD** — update KB after structural changes
7. **KB update** (if KB configured) — wiki articles for new/changed modules, endpoints, patterns

## Conventions (full)

- Every endpoint has input validation (DTOs/schemas)
- Business logic in services, not controllers
- Error responses: `{ error: string, statusCode: number }`
- DB queries through repository/service layer
- No hardcoded secrets — env vars only
- Auth verified on every route; authorization on every object access

## Critical checklist (full)

- All endpoints authenticated + authorized
- All inputs validated (DTOs/schemas)
- No sensitive fields (hashes, tokens, PII) in API responses
- `npm audit` clean of critical vulnerabilities
- Wiki articles updated for structural changes
- Tests added/updated per testing-by-layer pattern
