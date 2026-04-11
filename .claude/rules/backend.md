---
description: Backend development rules — auto-loads when editing backend/server files
globs: ["**/backend/**", "**/server/**", "**/api/**", "**/*.controller.*", "**/*.service.*", "**/*.module.*", "**/*.guard.*", "**/*.middleware.*", "**/*.resolver.*"]
---

# Backend Rules

## Skill Chain

When working on backend code, follow this order:
1. **architect-agent RETRIEVE** — understand current module structure before changes
2. **context7 MCP** — verify framework API (NestJS, FastAPI, Express, etc.) before writing
3. **Database MCP** — if schema changes needed, use Supabase MCP or direct SQL
4. **Implement** — follow patterns from `.claude/references/code-patterns.md`
5. **architect-agent RECORD** — update knowledge base after structural changes

## Conventions

- Every endpoint needs input validation (DTOs/schemas)
- Error responses follow consistent format: `{ error: string, statusCode: number }`
- Business logic lives in services, not controllers
- Database queries go through a repository/service layer
- Environment-specific config via env vars, never hardcoded

## Security

- Passwords hashed with bcrypt or argon2 (minimum 12 rounds) — never store plaintext
- Tokens in httpOnly cookies — never localStorage
- JWT secrets: random, minimum 32 characters, never hardcoded
- Access tokens expire within 15–60 minutes; implement refresh token rotation
- Rate limiting on /login, /register, and all public-facing endpoints
- Account lockout after repeated authentication failures
- Sessions invalidated server-side on logout
- Every route must verify authentication — check all endpoints, not just obvious ones
- Authorization enforced: users can only access their own data
- API responses must never expose passwords, hashes, or internal fields
- Error messages must not reveal system internals, stack traces, or file paths
- CORS restricted to specific allowed domains — never wildcard `*`
- HTTPS enforced, HTTP redirected
- No hardcoded credentials or secrets — use environment variables
- Run `npm audit` before shipping; resolve all critical vulnerabilities

See full checklist: `.claude/references/security-checklist.md`

## Testing

- Service methods: unit test with mocked dependencies
- Controllers: integration test with real service, mocked DB if needed
- E2E: API endpoint tests with real DB for critical paths
