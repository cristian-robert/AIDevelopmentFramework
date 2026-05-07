# Load-Condition Vocabulary

Canonical condition strings used in the **Load condition** column of command step tables. Keep this list short — every entry must be self-evident at a glance.

## Always-on

| String | Meaning |
|--------|---------|
| `always` | Load on every invocation. |
| `always (skip in autonomous mode)` | Load unless `_shared/context-reset-gate.md` flagged the call as autonomous. |
| `always (sub-steps gated by what changed)` | Load the reference, but the reference itself decides which sub-steps run. |

## Project-state gates

| String | Meaning |
|--------|---------|
| `in-dev project` | Project has at least one of: `package.json`, `tailwind.config.*`, `**/*.tsx`, `**/*.jsx`, `**/*.vue`, `**/*.svelte`. |
| `fresh project` | None of the above; routes through `/brand-extract` Direction Advisor instead. |
| `KB configured` | CLAUDE.md has a `## Knowledge Base` section with `Path:` (per `_shared/kb-detect.md`). |

## Diff-driven gates

| String | Meaning |
|--------|---------|
| `<domain> files in diff` | One or more files matching the domain glob are staged or unstaged. Domains: `UI`, `mobile`, `API`, `DB`, `auth`, `design` (`design/<slug>/**`). |
| `frontmatter: branch=<value>` | Plan file frontmatter `branch:` matches the value (`production-code`, `design-artifact`, `hybrid`). |
| `marker file present` | A specific marker exists (e.g., `.claude/.evolve-ran`, `.claude/.init-meta.json`). |

## Argument-driven gates

| String | Meaning |
|--------|---------|
| `--<flag>` | The command was invoked with that flag (e.g., `/setup --verbose`). |
| `$ARGUMENTS contains <token>` | The arguments string contains the token (e.g., `#<N>` for an issue number). |

## How to write a load condition

- Prefer one of the strings above. New conditions must be added here first.
- Combine with `+` (AND) or `,` (OR) — keep it to two clauses max. If a condition needs three clauses, push the logic into the reference file body.
- Never write narrative load conditions like "load when relevant" — that's a non-condition.
