---
description: Security rules — auto-loads when editing auth, API security, middleware, or infrastructure files
globs: ["**/auth/**", "**/authentication/**", "**/login*", "**/register*", "**/session*", "**/token*", "**/jwt*", "**/middleware/**", "**/guard*", "**/cors*", "**/ssl*", "**/tls*", "**/encrypt*", "**/hash*", "**/password*", "**/security*"]
---

# Security Rules

## Skill Chain

1. **architect-agent RETRIEVE** — understand current auth/security architecture before changes
2. **context7 MCP** — verify framework security APIs (passport, bcrypt, helmet, etc.)
3. **Implement** — follow security checklist from `.claude/references/security-checklist.md`
4. **architect-agent RECORD** — update knowledge base after security-related changes

## Authentication

- Passwords hashed with bcrypt or argon2 (minimum 12 rounds for bcrypt)
- Tokens stored in httpOnly cookies — never localStorage
- JWT secrets must be random, at least 32 characters, never from tutorials or examples
- Access tokens expire within 15–60 minutes
- Refresh token rotation implemented
- Rate limiting on `/login` and `/register` endpoints
- Account lockout after repeated authentication failures
- Sessions invalidated server-side on logout
- Email verification required before granting access

## API Security

- Every route requires authentication verification — check all endpoints, not just obvious ones
- Authorization enforced: users can only access their own data
- All request inputs validated with schema validation (Zod, Joi, etc.)
- API responses never expose passwords, hashes, or internal fields
- Error messages must not reveal system internals, stack traces, or file paths
- Rate limiting on all public-facing endpoints
- CORS restricted to specific allowed domains — never use wildcard `*`
- HTTPS enforced, HTTP requests redirected to HTTPS

## Code Security

- No `console.log` statements in production builds
- Run `npm audit` and resolve all critical vulnerabilities before shipping
- No hardcoded credentials, API keys, or secrets anywhere in the codebase
- No SQL string concatenation — use parameterized queries or ORM exclusively
- All secrets stored in environment variables, never in source code
- `.env` files must not exist in git history

## Infrastructure

- SSL certificate installed and valid
- Server processes must not run as root
- Only ports 80 and 443 publicly accessible
- Database not publicly accessible — must be behind VPC or firewall

## Pre-Ship Security Checklist

Before any `/ship` or `/validate`, verify against the full checklist:
`.claude/references/security-checklist.md`
