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

## Testing

- Service methods: unit test with mocked dependencies
- Controllers: integration test with real service, mocked DB if needed
- E2E: API endpoint tests with real DB for critical paths
