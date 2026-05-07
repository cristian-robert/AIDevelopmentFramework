# /setup — Plugin + MCP + File Tables

## Core Workflow plugins (required)

| Plugin | Install Command |
|--------|----------------|
| superpowers | `claude plugin install superpowers` |
| feature-dev | `claude plugin install feature-dev` |
| code-review | `claude plugin install code-review` |
| commit-commands | `claude plugin install commit-commands` |
| claude-md-management | `claude plugin install claude-md-management` |
| security-guidance | `claude plugin install security-guidance` |
| skill-creator | `claude plugin install skill-creator` |

## Framework Support plugins (recommended)

| Plugin | Install Command |
|--------|----------------|
| firecrawl | `claude plugin install firecrawl` |
| frontend-design | `claude plugin install frontend-design` |
| claude-code-setup | `claude plugin install claude-code-setup` |
| agent-sdk-dev | `claude plugin install agent-sdk-dev` |

## Stack-Specific plugins

| Plugin | When Needed | Install Command |
|--------|------------|----------------|
| context7 | Any framework/library project | `claude plugin install context7` |
| supabase | Supabase projects | `claude plugin install supabase` |
| typescript-lsp | TypeScript projects | `claude plugin install typescript-lsp` |
| expo-app-design | Expo/React Native projects | `claude plugin install expo-app-design --marketplace expo-plugins` |

## Design-Artifact skills

| Skill | Install Command | Detection |
|-------|----------------|-----------|
| huashu-design | `npx skills add alchaincyf/huashu-design` | `~/.claude/skills/huashu-design/SKILL.md` exists |

Required vs. recommended:
- Project commits design work to `design/` OR has `.design-system/brand-spec.md` → **required**; report `[missing]` if absent.
- Otherwise → **recommended**.

### Version-drift check (only if installed)

1. Read `.claude/.versions.json` → `external_skills.huashu-design.skill_md_sha256`.
2. Hash installed file: `shasum -a 256 ~/.claude/skills/huashu-design/SKILL.md | awk '{print $1}'`.
3. Compare:
   - **Pin empty** → first-run; populate with computed hash + today's date. Report `[ok] huashu-design — pinned at <short-hash>`.
   - **Match** → `[ok] huashu-design — pinned at <short-hash>`.
   - **Mismatch** → `[warn] huashu-design — drifted from pinned version`. Show both hashes (short form). Tell operator: "The brand-spec.md schema in `.claude/.versions.json#schema_contract` may have changed. Run `/brand-extract` against a known-good project and confirm it still produces a spec with the expected sections before relying on the design path."
4. **Never auto-update** the pin on drift — only on first-run empty-pin population.

## MCP servers

- shadcn — for shadcn/ui component projects
- context7 — for documentation lookup
- supabase — for database operations
- mobile-mcp — for mobile testing

## Framework files

Top-level structure:

- `.claude/commands/` (15 files)
- `.claude/agents/` (4 agents + template)
- `.claude/rules/` (10 rules + template)
- `.claude/references/` (templates + per-command subdirs + `_shared/`)
- `.claude/hooks/` (8 scripts)
- `.claude/settings.local.json`

Per-command reference subdirs (each must exist if the command body references it):

- `.claude/references/_shared/` — output-contract, kb-detect, git-commit, model-matrix-summary, context-reset-gate, load-conditions, file-size-guard
- `.claude/references/{prime,start,setup,merge-configs}/` — pipeline entry points
- `.claude/references/{create-prd,plan-project,plan-feature,execute,validate,ship,evolve}/` — PIV+E loop
- `.claude/references/{kb-ingest,kb-compile,kb-search,kb-ask}/` — KB pipeline

Hooks (each in `.claude/hooks/`, executable):

- `output-compact.sh` (Stop) · `evolve-reminder.sh` · `architect-sync.sh` · `branch-guard.sh` · `plan-required.sh` · `session-primer.sh` · `spec-reviewer-enforce.sh` · `spec-reviewer-marker.sh`

Report `[missing]` for any subdir or hook absent. Report `[ok]` only when all expected paths resolve.

## Design-artifact pipeline readiness

Run only when the project commits design work (any of the following hold):

- Any file under `design/<slug>/` exists
- `.design-system/` directory exists
- A plan file in `docs/plans/` or `docs/superpowers/plans/` has frontmatter `branch: design-artifact` or `branch: hybrid`

When the pipeline is in use, check:

| Check | Expected | If missing |
|-------|----------|-----------|
| `huashu-design` skill installed | `~/.claude/skills/huashu-design/SKILL.md` exists | **required** — block with install command |
| `.design-system/brand-spec.md` | Present and ≤90 days old | **required** — suggest `/brand-extract` |
| `.claude/skills/brand-extract/SKILL.md` | Present (project-local skill) | **required** — re-run `/setup` against framework source |
| `.claude/references/plan-feature/015-deliverable-routing.md` | Exists | **required** — framework file missing, run `/merge-configs` |
| `.claude/references/design-clarifying-script.md` | Exists | **required** — same as above |

If none of the trigger conditions hold, this section is recommended-only: report missing items with `[recommended]` so the user knows the pipeline isn't ready yet but isn't blocked.

## Context guardrail

Always run as part of `/setup`:

```bash
npx ai-development-framework file-size-check
```

- Exit `0` → `[ok] context files within budget`
- Exit `1` → `[warn] N files past soft cap` (informational; surface in setup output)
- Exit `2` → **blocker** — print the violating files and tell the user to run `/evolve` to extract.
