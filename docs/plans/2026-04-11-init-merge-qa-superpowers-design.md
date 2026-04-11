# Init Merge + QA Automation + Superpowers Integration Design

**Date:** 2026-04-11
**Status:** Approved
**Scope:** Three tightly coupled improvements shipped together

## Problems

### 1. Init Overwrites Project Knowledge

When a user runs `npx ai-framework init` or `update` on a project with existing CLAUDE.md, rules, commands, agents, and KB content, the current system either skips protected files or overwrites them. There is no intelligent merge — project-specific knowledge (tech stack, conventions, agent knowledge bases, wiki articles) can be lost or require manual recovery.

### 2. No Mandatory QA Automation Tests

The framework enforces TDD for unit tests but has no requirement for QA automation tests (E2E, API, mobile). After development, the only verification is unit tests + lint + type-check. Browser flows, API contracts, and mobile interactions are not systematically tested.

### 3. Superpowers Mode Bypasses `/validate`

When users choose Superpowers Mode, the flow uses `superpowers:subagent-driven-development` instead of `/execute` and `superpowers:verification-before-completion` instead of `/validate`. This bypasses critical framework verification: security scans, visual testing via agents, lint/type-check, KB auto-search, and application startup verification.

## Vision

One upgrade experience that preserves all project knowledge. One verification standard that both modes must pass. QA automation tests that are mandatory, not optional.

---

## Part 1: Smart Init Merge

### CLI Backup Behavior

Every file that exists and will be overwritten gets a `.backup` copy first. No exceptions, no categories. The existing protected/customizable/safe distinction is removed — replaced by "back up everything, install everything."

```
# Before init:
CLAUDE.md
.claude/rules/backend.md

# After init:
CLAUDE.md                         ← new framework version
CLAUDE.md.backup                  ← user's old version
.claude/rules/backend.md          ← new framework version
.claude/rules/backend.md.backup   ← user's old version
```

### Init Metadata Marker

CLI creates `.claude/.init-meta.json` after all copies:

```json
{
  "timestamp": "2026-04-11T12:00:00Z",
  "previousVersion": "0.2.0",
  "newVersion": "0.3.0",
  "backedUpFiles": [
    "CLAUDE.md",
    ".claude/rules/backend.md",
    ".claude/rules/frontend.md",
    ".claude/commands/prime.md",
    ".claude/references/code-patterns.md"
  ]
}
```

Version detection: read `package.json` version from the old project (backup) and from the new framework source.

### CLI Output

```
Installing framework...

  Backed up: 12 files (saved as .backup)
  Created:   4 new files
  Updated:   18 files

Next steps:
  1. Open Claude Code in this project
  2. Run /start to merge your existing configuration with the new framework
```

### CLI Changes to `init.js`

- Remove the three-category system (protected/customizable/safe). Every existing file gets `.backup` before overwrite.
- Create `.claude/.init-meta.json` after all copies complete.
- Update CLI output to show backup count and `/start` instruction.
- Keep `protected-files.js` but repurpose: instead of "files to skip," it becomes "files that definitely need LLM merge" as a hint to `/start`.

### `/start` Merge Detection

New Step 0 at the top of `/start`, before scope detection:

1. Check if `.claude/.init-meta.json` exists
2. If yes → enter merge flow
3. If no → proceed with normal `/start` scope detection

### Merge Flow

The LLM processes each backed-up file by category, presenting a diff summary and waiting for user approval before applying each merge.

**Merge order:**

1. **CLAUDE.md** — Read both versions. Identify project-specific sections (Tech Stack, Knowledge Base config, Design Skill Preference, custom conventions, user-added sections). Present merge plan. User approves → write merged file.

2. **Rules** (`.claude/rules/*.md`) — For each rule with a `.backup`: diff old vs new. Identify user-added conventions, checklist items, skill chain customizations. Present merge. User approves → apply.

3. **Commands** (`.claude/commands/*.md`) — Quick diff. If backup is identical to previous framework version, skip. If user modified, present diff and ask.

4. **References** (`.claude/references/*.md`) — `code-patterns.md` is project-specific: always restore from backup. Template references: skip (no project content).

5. **Agents** — Architect-agent knowledge (index.md, modules/, decisions/): always restore from backup. Tester/mobile-tester patterns: always restore from backup.

6. **KB content** (`.obsidian/`) — All wiki articles, raw sources: always restore from backup.

**After all merges:**
- Delete all `.backup` files
- Delete `.claude/.init-meta.json`
- Print summary: "Merged N files. Your project configuration is up to date."
- Continue with normal `/start` routing

### CLAUDE.md Merge Instructions

New `## Post-Init Merge` section in the framework's CLAUDE.md template:

```markdown
## Post-Init Merge

When `.claude/.init-meta.json` exists, the framework was recently installed or updated.
Files with `.backup` extensions contain the project's previous versions. The `/start`
command will detect this and run the merge flow before normal routing.

**Merge rules by file type:**

| File | Strategy |
|------|----------|
| `CLAUDE.md` | Merge project-specific sections (Tech Stack, Knowledge Base, Design Skill Preference, custom sections) into new template. Preserve all user-added content. |
| `.claude/rules/*.md` | Append user-added conventions, checklist items, and skill chain customizations to new framework rules. Don't duplicate entries already in the new version. |
| `.claude/commands/*.md` | If user modified a command, present diff and ask. Otherwise skip (no merge needed). |
| `.claude/references/code-patterns.md` | Always restore from backup — entirely project-specific. |
| `.claude/references/*.md` (other) | Skip — framework templates, no project content. |
| `.claude/agents/architect-agent/*` | Always restore from backup — project knowledge base. |
| `.claude/agents/tester-agent/*` | Always restore from backup — project test patterns. |
| `.claude/agents/mobile-tester-agent/*` | Always restore from backup — project screen patterns. |
| `.obsidian/**` | Always restore from backup — project wiki and raw sources. |

**Merge process:** For each `.backup` file, read both versions, present a summary
of what will be merged, wait for user approval, then apply. Delete `.backup` files
and `.init-meta.json` when complete.
```

---

## Part 2: QA Automation Strategy

### Rule

After every development task, QA automation tests are mandatory — not just unit tests. The type depends on what changed.

### Test Types by Domain

| Domain | QA Test Type | Default Tool | What to test |
|--------|-------------|-------------|-------------|
| Backend API | API E2E tests | Supertest/Pactum | Endpoints respond correctly, auth works, error responses match format |
| Frontend Web | Browser E2E tests | Playwright | User flows, form submissions, navigation, responsive viewports |
| Mobile | Mobile E2E tests | Detox/Maestro | Screen navigation, gestures, form inputs, platform-specific behavior |
| Database | Migration tests | Project test runner | Migrations up/down, seed data, constraints hold |

### Tool Override

Projects specify preferred QA test tools in CLAUDE.md under a `## QA Tools` section:

```markdown
## QA Tools

| Domain | Tool |
|--------|------|
| Web E2E | Playwright |
| API E2E | Supertest |
| Mobile E2E | Detox |
```

When no override exists, the defaults above apply. Detected during `/prime`.

### Test Users

- Created manually during project setup (part of `/start` L0 flow)
- Credentials stored as GitHub secrets: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD`
- For local development: stored in `.env.test` (gitignored)
- `/setup` checks that test user secrets exist and reports missing ones
- Rules document which secrets are required per domain

### QA Test Placement Strategy

**Rule:** Before writing any QA test, spawn a test-planning subagent that:

1. **Scans existing tests** — Find all test files, understand structure and naming conventions
2. **Checks for affected tests** — Determine if implementation broke or changed behavior in existing tests. If so, update those instead of creating new ones.
3. **Decides placement** — Either add cases to an existing test file or create a new file only if no existing file covers the area.
4. **Reports back** with a short plan: "Update `tests/e2e/auth.spec.ts` (add 2 cases)" or "Create `tests/e2e/dashboard.spec.ts` (new feature, no existing coverage)"

The subagent does NOT write tests — it only produces the placement plan. The implementer or `/validate` then writes the actual tests following the plan.

**Testing rule additions (`.claude/rules/testing.md`):**
- NEVER create a new test file without first checking existing test files
- Prefer adding test cases to existing files over creating new ones
- One E2E test file per feature area, not per implementation task
- Spawn a test-planning subagent before writing QA tests to avoid context bloat

---

## Part 3: Superpowers Integration Fix

### Problem

In Superpowers Mode, the following are bypassed:

**From `/execute`:**
- KB auto-search before each task
- Lint/type-check after all tasks
- Application startup verification
- Plan checkbox marking

**From `/validate`:**
- Automated security scans (console.log, hardcoded secrets, SQL injection, CORS, npm audit)
- Auth/API/database security checklists
- Visual testing via tester-agent / mobile-tester-agent
- Comprehensive final report with verdicts

### Solution

Make `/validate` the single verification gate for both modes. Update the flow:

**Current Superpowers flow:**
```
/plan-feature → superpowers:subagent-driven-development → superpowers:verification-before-completion → superpowers:requesting-code-review → /ship
```

**New flow:**
```
/plan-feature → superpowers:subagent-driven-development → /validate → /ship
```

### Changes

**1. `/start` mode description update:**

```
Superpowers Mode — Full discipline: brainstorm, plan, TDD, execute (subagent-driven),
/validate (security + visual + code review + QA), /ship, /evolve
```

**2. KB search for superpowers — CLAUDE.md rule:**

Superpowers:subagent-driven-development must search the KB before dispatching each task implementer, same as `/execute` Step 2. This is documented as a rule in CLAUDE.md since the superpowers plugin is external and we can't modify its skill files.

**3. `/validate` gains QA phase:**

Updated phase structure:

| Phase | What it does |
|-------|-------------|
| Phase 1 | Automated checks: lint, type-check, test suite (parallel) |
| Phase 2 | Visual/functional verification: tester-agent, mobile-tester-agent |
| Phase 3 | **QA test verification (NEW):** spawn planning subagent → update/create QA tests → run them |
| Phase 4 | Security verification: automated scans + manual checklists (was Phase 3) |
| Phase 5 | Code review: plan adherence, edge cases, security (was Phase 4) |
| Phase 6 | Report: all phases with verdicts (was Phase 5) |

**4. `/ship` QA gate:**

New pre-flight check in `/ship`:

- Has `/validate` been run this session? If not, run it.
- Do QA tests exist for changed domains? If not, block and report.
- Do all QA tests pass? If not, block and report.

**5. CLAUDE.md verification standard:**

New section:

```markdown
## Verification Standard

Both Standard and Superpowers modes MUST run `/validate` before `/ship`.
The superpowers verification-before-completion skill is NOT a substitute for `/validate`.
The superpowers requesting-code-review skill is NOT a substitute for `/validate` Phase 5.

After implementation (via `/execute` or superpowers:subagent-driven-development),
always run `/validate` to verify: automated checks, visual testing, QA tests,
security scans, and code review.
```

---

## Files to Create/Modify

### Create
- None (all modifications to existing files)

### Modify

| File | Changes |
|------|---------|
| `cli/init.js` | Remove category system, backup everything, create `.init-meta.json` |
| `cli/protected-files.js` | Repurpose as "needs LLM merge" hint list |
| `.claude/commands/start.md` | Add Step 0 merge detection, update Superpowers Mode description |
| `.claude/commands/validate.md` | Add Phase 3 (QA tests), renumber Phase 4-6, add QA planning subagent |
| `.claude/commands/ship.md` | Add `/validate` gate + QA test existence check in pre-flight |
| `.claude/rules/testing.md` | Add QA test placement rules, mandatory QA section |
| `CLAUDE.md` | Add `## Post-Init Merge`, `## Verification Standard`, `## QA Tools` sections |

---

## What This Does NOT Include

- CI/CD pipeline configuration (GitHub Actions for running QA tests) — future iteration
- Test user rotation or ephemeral test environments — manual setup for now
- Modifying superpowers plugin skill files — we use CLAUDE.md rules instead
- Visual regression testing (screenshot diffing) — future enhancement
- Performance/load testing — out of scope
