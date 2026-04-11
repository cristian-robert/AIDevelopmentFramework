---
description: Database rules — auto-loads when editing migrations, schemas, SQL files
globs: ["**/migrations/**", "**/*.sql", "**/schema*", "**/prisma/**", "**/drizzle/**", "**/supabase/**"]
---

# Database Rules

## Skill Chain

1. **Supabase MCP** (if using Supabase): `list_tables` → `execute_sql` → `apply_migration` → `get_advisors`
2. **`/supabase-postgres-best-practices`** — for schema design and query optimization
3. **`/mongodb`** or **`/mongodb-development`** — if using MongoDB

## Conventions

- Every migration is reversible (include up AND down)
- Never modify existing migrations — always create new ones
- Add indexes for frequently queried columns
- Use foreign key constraints for referential integrity
- RLS policies on all user-facing tables (Supabase)

## Security

- No SQL string concatenation — use parameterized queries or ORM exclusively
- Application must use a limited-permission DB user, not root
- Database must not be publicly accessible — behind VPC or firewall rule
- Backups configured and restore procedure has been tested (not just backup)
- Sensitive fields (PII, credentials, tokens) encrypted at rest
- RLS policies on all user-facing tables (Supabase)

See full checklist: `.claude/references/security-checklist.md`

## Post-DDL Checklist

After any schema change:
- [ ] Run Supabase advisors (`get_advisors`) or equivalent linter
- [ ] Verify RLS policies still work
- [ ] Update TypeScript types (`generate_typescript_types` or equivalent)
- [ ] Update architect-agent knowledge base
