# Knowledge Base Integration Design

**Date:** 2026-04-04
**Status:** Approved

## Problem

The agent starts each session with no project-level context beyond what it can read from code and git history. It doesn't know what features are planned, why decisions were made, or how features relate to each other. This leads to:

- Agent trying to implement entire projects in one shot instead of following the issue-based pipeline
- No persistent project understanding across sessions
- Brainstorming insights lost after the session ends
- No automatic check for related features/decisions before starting work

## Solution

Add an optional, Obsidian-compatible knowledge base (`.obsidian/` by default) that pipeline commands read from and write to at natural checkpoints. The knowledge base complements the existing architect-agent (code-level knowledge) with project-level understanding.

## Design

### Knowledge Base Structure

Default path: `.obsidian/` (configurable via `Knowledge Base: <path>` in project CLAUDE.md).

```
.obsidian/
├── app.json                     # Obsidian config (gitignored)
├── appearance.json              # Obsidian config (gitignored)
├── core-plugins.json            # Obsidian config (gitignored)
├── workspace.json               # Obsidian config (gitignored)
├── overview.md                  # Project vision, goals, tech stack, target users
├── architecture/
│   └── system-design.md         # High-level architecture, component diagram
├── features/
│   ├── feature-name.md          # One per feature area, links to GitHub issues
│   └── ...
├── decisions/
│   └── NNN-title.md             # ADR format: context, decision, consequences
├── config/
│   └── integrations.md          # Third-party services, env var names (never store actual secrets)
└── research/
    └── ...                      # Brainstorming notes, tech comparisons
```

### Gitignore Rules

Obsidian config files are gitignored (machine-specific). Notes are committed.

```
.obsidian/app.json
.obsidian/appearance.json
.obsidian/core-plugins.json
.obsidian/core-plugins-migration.json
.obsidian/workspace.json
.obsidian/hotkeys.json
.obsidian/plugins/
.obsidian/themes/
```

### Feature Note Template

```markdown
# Feature: [Name]

## Summary
[1-2 sentences: what this feature does and why]

## GitHub Issues
- #N — [title] (status)
- #N — [title] (status)

## Key Decisions
- [Decision and why]

## Implementation Notes
[Updated after work is completed — endpoints created, components built, patterns used]
```

### Decision Record Template

```markdown
# NNN: [Title]

**Date:** YYYY-MM-DD
**Status:** Accepted

## Context
[What situation led to this decision]

## Decision
[What we chose and why]

## Consequences
[What this means for future work — both positive and negative]
```

## Command Integration

### `/start` — New L0 Behavior

Detects empty project → routes to new flow:
1. Brainstorm functionalities (interactive)
2. Create `.obsidian/` structure with `overview.md`
3. Create feature notes in `.obsidian/features/`
4. Create GitHub issues linked to feature notes
5. STOP — ask user which issue to work on

### `/prime` — Smart Knowledge Loading

Add to existing context loading:
1. Read `.obsidian/overview.md` (always)
2. If working on a specific issue → read the linked feature note
3. Scan other feature note filenames + summaries → pull in related ones
4. Include knowledge context in session summary output

### `/create-prd` — Knowledge Base Seeding

Add after saving PRD:
1. Create `.obsidian/overview.md` extracted from PRD (vision, goals, tech stack, users)
2. Create `.obsidian/architecture/system-design.md` from PRD's architecture section

### `/plan-project` — Feature Notes Alongside Issues

Add after creating each GitHub issue:
1. Create `.obsidian/features/<feature-name>.md` with the feature template
2. Link the GitHub issue numbers in the note
3. If architectural decisions were made during brainstorming, create `.obsidian/decisions/NNN-title.md`

### `/ship` — Knowledge Update Checkpoint

Add before committing:
1. Read the feature note for the issue being completed
2. Update `## Implementation Notes` with what was built
3. Update `## GitHub Issues` status if issue is being closed
4. If a significant decision was made, create a decision record
5. Commit knowledge updates alongside code

### `/execute` — Knowledge-Aware Context

Add to mandatory file reading step:
1. Check `.obsidian/` for the feature note linked to the current issue
2. Read related feature notes (smart/targeted scan)
3. Check `.obsidian/decisions/` for relevant past decisions

## Read-Before-Work Flow (Smart/Targeted)

When the agent starts work on an issue:

1. **Always read:** `overview.md` + directly linked feature note
2. **Scan for related:** list `.obsidian/features/`, read first 5 lines of each, pull in notes with clear dependency/overlap
3. **Check decisions:** scan `.obsidian/decisions/` titles, read relevant ones
4. **Check codebase:** existing `/prime` behavior (code structure, git history, architect-agent)

### Issue-to-Feature Linking

- Feature notes list issue numbers in `## GitHub Issues`
- Agent greps `.obsidian/features/*.md` for the current issue number
- Fallback: keyword matching between issue title and feature note filenames/summaries

## Write-After-Work Flow (End of Issue)

Triggered by `/ship`:

### Updated:
- **Feature note:** `## Implementation Notes`, `## GitHub Issues` status, `## Key Decisions`
- **Decision records:** only when a technology/approach was chosen over alternatives, a pattern was established, or something was intentionally excluded

### Updated only when significant:
- **Overview:** only when new integration added or scope changed

### Not updated:
- Bug fixes (L3) unless they reveal a design decision
- Unrelated feature notes
- No full rewrites — only append/update relevant sections

## Configuration & Optionality

### CLAUDE.md Configuration

```markdown
## Knowledge Base

Path: .obsidian/
```

When path is set → commands read/write from it.
When absent → knowledge operations skipped entirely. Zero impact.

### `/init-claude-md` Integration

During setup, ask:
1. Yes, use `.obsidian/` (default)
2. Yes, custom path
3. No — skip knowledge base

### Guard Behavior

Every command that touches the knowledge base:
1. Read project CLAUDE.md → look for `Knowledge Base` path
2. If not found → skip all knowledge operations
3. If found → check folder exists
4. If folder doesn't exist → create it with initial structure

## Relationship to Existing Systems

- **architect-agent:** Keeps code-level knowledge (modules, endpoints, patterns). Knowledge base holds project-level understanding. Agent reads both.
- **docs/plans/:** Untouched. Superpowers skills write here. Knowledge base is additive.
- **docs/superpowers/plans/:** Untouched. Same reason.
- **Obsidian:** Optional. The `.obsidian/` folder works as plain markdown without Obsidian installed. Obsidian users get a navigable vault for free.
