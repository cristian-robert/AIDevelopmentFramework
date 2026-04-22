---
description: Backend development rules — auto-loads when editing backend/server files
globs: ["**/backend/**", "**/server/**", "**/api/**", "**/*.controller.*", "**/*.service.*", "**/*.module.*", "**/*.guard.*", "**/*.middleware.*", "**/*.resolver.*"]
---

# Backend Rules

## Skill Chain

1. **KB search** (if KB configured) — `KB_PATH=<path> node cli/kb-search.js search "<keywords>"`
2. **architect-agent RETRIEVE** — understand current module structure before changes
3. **context7 MCP** — verify framework API (NestJS, FastAPI, Express, etc.)
4. **Database MCP** — if schema changes needed (Supabase MCP or direct SQL)
5. **Implement** — follow patterns from `.claude/references/code-patterns.md`
6. **architect-agent RECORD** — update knowledge base after structural changes
7. **KB update** (if KB configured) — update wiki articles for new/changed modules, endpoints, patterns

## Conventions

- Every endpoint has input validation (DTOs/schemas)
- Business logic lives in services, not controllers
- Error responses follow `{ error: string, statusCode: number }`
- Database queries go through a repository/service layer
- No hardcoded secrets — env vars only
- Authentication verified on every route; authorization on every object access

## Checklist

- [ ] All endpoints authenticated + authorized
- [ ] All inputs validated (DTOs/schemas)
- [ ] No sensitive fields (hashes, tokens, PII) in API responses
- [ ] `npm audit` clean of critical vulnerabilities
- [ ] Wiki articles updated for structural changes
- [ ] Tests added/updated per the testing-by-layer pattern

## References

Load only when the rule triggers:

- `.claude/references/backend-detail.md` — load for error formats, DI/layering, logging, testing-by-layer
- `.claude/references/security-checklist.md` — load for any auth, API, or infra change
- `.claude/references/code-patterns.md` — load for project-specific code patterns
- `<kb-path>/wiki/_index.md` — search and load feature articles when touching endpoints
