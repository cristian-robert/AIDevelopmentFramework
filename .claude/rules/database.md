---
description: Database rules — auto-loads when editing migrations, schemas, SQL files
globs: ["**/migrations/**", "**/*.sql", "**/schema*", "**/prisma/**", "**/drizzle/**", "**/supabase/**"]
---

# Database Rules

## Skill chain
KB search → Supabase MCP (`list_tables` → `execute_sql` → `apply_migration` → `get_advisors`) OR `/supabase-postgres-best-practices` OR `/mongodb` per stack.

## Load-bearing rules
- Every migration is reversible (up AND down)
- Never modify existing migrations — create new ones
- Index frequently queried columns
- FK constraints for referential integrity
- RLS on all user-facing tables (Supabase)
- No SQL string concat — parameterized or ORM only
- App connects with limited-permission DB user, never root

## Critical checklist (post-schema-change)
- [ ] `get_advisors` (Supabase) or equivalent linter clean
- [ ] RLS policies still work
- [ ] TypeScript types regenerated
- [ ] architect-agent KB updated
- [ ] KB wiki updated for schema changes
- [ ] Backup/restore still valid for new schema

## References
- `.claude/references/security-checklist.md` — DB security (encryption at rest, network isolation, backups)
- `<kb-path>/wiki/_index.md` — search schema/domain articles before DDL
