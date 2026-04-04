# Knowledge Base Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional, Obsidian-compatible knowledge base that pipeline commands read from and write to at natural checkpoints, giving the agent persistent project understanding across sessions.

**Architecture:** Configurable path (default `.obsidian/`) with feature notes, decision records, and project overview. Existing commands (`/start`, `/prime`, `/create-prd`, `/plan-project`, `/ship`, `/execute`) gain knowledge read/write operations guarded by a `Knowledge Base` config in CLAUDE.md. No new commands or skills.

**Tech Stack:** Markdown files, Claude Code commands, `.gitignore` configuration

---

### Task 1: Gitignore — Add Obsidian Config Exclusions

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add Obsidian config ignores to `.gitignore`**

Append to the end of `.gitignore`:

```
# Obsidian config (machine-specific, notes are tracked)
.obsidian/app.json
.obsidian/appearance.json
.obsidian/core-plugins.json
.obsidian/core-plugins-migration.json
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/hotkeys.json
.obsidian/plugins/
.obsidian/themes/
```

- [ ] **Step 2: Verify gitignore works**

Run: `git status`
Expected: Obsidian config files no longer show as untracked (if they were). Knowledge note files (`.obsidian/*.md`, `.obsidian/features/`, etc.) remain trackable.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: add Obsidian config to gitignore"
```

---

### Task 2: Reference Templates — Feature Note + Decision Record

**Files:**
- Create: `.claude/references/knowledge-base-templates.md`

- [ ] **Step 1: Create the templates reference file**

```markdown
# Knowledge Base Templates

Used by pipeline commands when creating knowledge base notes.

---

## Feature Note Template

Create one per feature area in `<knowledge-base-path>/features/<feature-name>.md`.

```markdown
# Feature: [Name]

## Summary

[1-2 sentences: what this feature does and why]

## GitHub Issues

- #N — [title] (status: open/closed)

## Key Decisions

- [Decision and why]

## Implementation Notes

[Updated by /ship after work is completed — endpoints created, components built, patterns used]
```

## Decision Record Template

Create in `<knowledge-base-path>/decisions/NNN-title.md` when:
- A technology or approach was chosen over alternatives
- A pattern was established that future work should follow
- Something was intentionally excluded (and why)

NOT for every small implementation choice.

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

## Overview Template

Create once at `<knowledge-base-path>/overview.md` during project setup or PRD creation.

```markdown
# [Project Name]

## Vision

[1-2 sentences: what this project is and why it exists]

## Goals

- [Goal 1]
- [Goal 2]

## Target Users

- [User type 1]: [their key need]
- [User type 2]: [their key need]

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| | | |

## Feature Areas

- [Feature 1] — see `features/feature-1.md`
- [Feature 2] — see `features/feature-2.md`
```
```

- [ ] **Step 2: Commit**

```bash
git add .claude/references/knowledge-base-templates.md
git commit -m "docs: add knowledge base note templates"
```

---

### Task 3: Update `/start` — L0 Knowledge Base Flow

**Files:**
- Modify: `.claude/commands/start.md`

- [ ] **Step 1: Add knowledge base detection to Step 1 (Gather Context)**

Add item 6 to the existing parallel checks:

```
6. Check if knowledge base exists: look for `Knowledge Base` path in CLAUDE.md, then check if that directory has `overview.md`
```

- [ ] **Step 2: Update L0 route to include knowledge base creation**

Replace the L0 section:

```markdown
**L0 (New Project)** — No PRD, no issues, minimal/no code
→ "Looks like a fresh project. Let's plan it from scratch."
→ Route to:
  1. Brainstorm functionalities (interactive discussion)
  2. If knowledge base configured in CLAUDE.md:
     a. Create knowledge base folder structure (overview.md, features/, decisions/, config/, research/, architecture/)
     b. Create `overview.md` from brainstorming results
     c. Create feature notes in `features/` for each agreed functionality
  3. Create GitHub issues linked to feature notes
  4. STOP — present the issue list and ask: "Which issue do you want to work on first?"
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/start.md
git commit -m "feat: add knowledge base creation to /start L0 flow"
```

---

### Task 4: Update `/prime` — Smart Knowledge Loading

**Files:**
- Modify: `.claude/commands/prime.md`

- [ ] **Step 1: Add knowledge base loading section**

Add a new section `### 6. Knowledge Base Context` after the existing `### 5. Configuration` section:

```markdown
### 6. Knowledge Base Context

Check CLAUDE.md for a `Knowledge Base` path (e.g., `.obsidian/`). If configured and the directory exists:

1. **Always read:** `<kb-path>/overview.md`
2. **Find linked feature note:** If working on a specific issue (detected from branch name or user input), grep `<kb-path>/features/*.md` for the issue number. Read the matching feature note.
3. **Scan for related features:** List all files in `<kb-path>/features/`. Read the first 5 lines (## Summary) of each. If any feature has a clear dependency or overlap with the current issue (shared entities, referenced in acceptance criteria, same domain area), read the full note.
4. **Check decisions:** List `<kb-path>/decisions/`. Read any whose title references the same feature area.

If no knowledge base configured, skip this section entirely.
```

- [ ] **Step 2: Update output format**

Add to the session summary output template after `Knowledge Base: [N domains documented in architect-agent]`:

```markdown
Project Knowledge: [summary from overview.md if knowledge base exists, or "not configured"]
Related Features: [list of feature notes loaded for this session]
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/prime.md
git commit -m "feat: add smart knowledge loading to /prime"
```

---

### Task 5: Update `/create-prd` — Knowledge Base Seeding

**Files:**
- Modify: `.claude/commands/create-prd.md`

- [ ] **Step 1: Add Phase 2.5 for knowledge base seeding**

Add between Phase 2 (Generate PRD) and Phase 3 (Review and Save):

```markdown
### Phase 2.5: Seed Knowledge Base (if configured)

Check CLAUDE.md for a `Knowledge Base` path. If configured:

1. Read `.claude/references/knowledge-base-templates.md` for templates
2. Create `<kb-path>/overview.md` from the PRD:
   - Vision from Executive Summary
   - Goals from Goals & Success Criteria
   - Target Users from Target Users section
   - Tech Stack from Technical Architecture
   - Feature Areas listing each epic/feature
3. Create `<kb-path>/architecture/system-design.md` from the PRD's Technical Architecture and System Diagram sections
4. For each epic or major feature in the PRD, create `<kb-path>/features/<feature-name>.md` using the feature note template:
   - Summary from the epic description
   - GitHub Issues section left empty (populated by /plan-project)
   - Key Decisions from any decisions made during brainstorming

If no knowledge base configured, skip this phase.
```

- [ ] **Step 2: Update Phase 4 commit to include knowledge files**

Update the commit step in Phase 4:

```markdown
Commit the PRD and knowledge base files (if created):
```bash
git add docs/plans/PRD.md
# If knowledge base was seeded:
git add <kb-path>/overview.md <kb-path>/architecture/ <kb-path>/features/
git commit -m "docs: add PRD and seed project knowledge base"
```
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/create-prd.md
git commit -m "feat: add knowledge base seeding to /create-prd"
```

---

### Task 6: Update `/plan-project` — Feature Notes Alongside Issues

**Files:**
- Modify: `.claude/commands/plan-project.md`

- [ ] **Step 1: Add knowledge base integration to Phase 5**

Add to Phase 5 (Create in GitHub), after each issue is created:

```markdown
#### Knowledge Base Integration (if configured)

After creating each GitHub issue:

1. Check if a feature note already exists in `<kb-path>/features/` for this feature area
2. If yes: update the `## GitHub Issues` section with the new issue number and title
3. If no: create a new feature note using `.claude/references/knowledge-base-templates.md` template, with:
   - Summary from the issue description
   - GitHub Issues section listing the new issue
4. If architectural decisions were made during the planning process, create `<kb-path>/decisions/NNN-title.md` for each significant decision
```

- [ ] **Step 2: Update Phase 6 commit to include knowledge files**

Add to the commit step in Phase 6:

```markdown
# If knowledge base configured:
git add <kb-path>/features/ <kb-path>/decisions/
```

- [ ] **Step 3: Commit**

```bash
git add .claude/commands/plan-project.md
git commit -m "feat: add feature note creation to /plan-project"
```

---

### Task 7: Update `/ship` — Knowledge Update Checkpoint

**Files:**
- Modify: `.claude/commands/ship.md`

- [ ] **Step 1: Add Step 1.5 for knowledge base update**

Add between Step 1 (Pre-flight Check) and Step 2 (Stage and Commit):

```markdown
### Step 1.5: Update Knowledge Base (if configured)

Check CLAUDE.md for a `Knowledge Base` path. If configured:

1. **Find the feature note:** Detect the current issue number from the branch name. Grep `<kb-path>/features/*.md` for that issue number. If no match, use keyword matching between branch name and feature note filenames.

2. **Update the feature note:**
   - `## Implementation Notes` — append what was built: key files created/modified, endpoints added, components built, patterns used
   - `## GitHub Issues` — update the status of the current issue to reflect completion
   - `## Key Decisions` — add any decisions made during implementation that weren't pre-planned

3. **Create decision records** (only if warranted):
   - A technology or approach was chosen over alternatives during implementation
   - A pattern was established that future features should follow
   - Something was intentionally excluded and the reason matters for future work

4. **Update overview** (only if significant):
   - New integration or service was added to the stack
   - Project scope changed

5. Stage knowledge base changes alongside code changes.

If no knowledge base configured, skip to Step 2.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/ship.md
git commit -m "feat: add knowledge update checkpoint to /ship"
```

---

### Task 8: Update `/execute` — Knowledge-Aware Context

**Files:**
- Modify: `.claude/commands/execute.md`

- [ ] **Step 1: Add knowledge base reading to Step 2**

Add to Step 2 (Read Mandatory Files), after reading plan-specified files:

```markdown
#### Knowledge Base Context (if configured)

Check CLAUDE.md for a `Knowledge Base` path. If configured:

1. Detect the issue number from the plan file or current branch
2. Grep `<kb-path>/features/*.md` for the issue number — read the matching feature note
3. Scan other feature notes (first 5 lines each) for related features — read any with clear overlap
4. Check `<kb-path>/decisions/` for decisions referencing the same feature area
5. Read `<kb-path>/overview.md` for project context

This supplements the plan's mandatory reading with project-level context the plan author may not have included.

If no knowledge base configured, skip this step.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/commands/execute.md
git commit -m "feat: add knowledge-aware context loading to /execute"
```

---

### Task 9: Update CLAUDE.md Template + Project CLAUDE.md

**Files:**
- Modify: `.claude/references/claude-md-template.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add Knowledge Base section to the template**

Add after the `## Agents` section in `.claude/references/claude-md-template.md`:

```markdown
## Knowledge Base

Path: .obsidian/

[Auto-configured during /init-claude-md setup. Set to the folder path for project knowledge notes. Remove this section to disable knowledge base features.]
```

- [ ] **Step 2: Add Knowledge Base documentation to project CLAUDE.md**

Add after the `## Agents` section in `CLAUDE.md`:

```markdown
## Knowledge Base

Optional Obsidian-compatible project knowledge base. Stores feature specs, architecture decisions, and project overview as markdown notes that the agent reads/writes during the pipeline.

**Configuration:** Add `## Knowledge Base` with `Path: <path>` to your project's CLAUDE.md. Default: `.obsidian/`. Remove the section to disable.

**Structure:**
```
<path>/
├── overview.md          # Project vision, goals, tech stack
├── architecture/        # System design, data model
├── features/            # One note per feature area, linked to GitHub issues
├── decisions/           # Architecture Decision Records (ADRs)
├── config/              # Integration metadata, env var names (never actual secrets)
└── research/            # Brainstorming notes, tech comparisons
```

**When commands read it:**
- `/prime` — loads overview + related feature notes (smart/targeted)
- `/execute` — reads feature context before implementing

**When commands write it:**
- `/start` (L0) — creates structure + feature notes during brainstorming
- `/create-prd` — seeds overview + architecture from PRD
- `/plan-project` — creates feature notes alongside GitHub issues
- `/ship` — updates feature notes with implementation details
```

- [ ] **Step 3: Commit**

```bash
git add .claude/references/claude-md-template.md CLAUDE.md
git commit -m "docs: add knowledge base configuration to CLAUDE.md and template"
```

---

### Task 10: Update Customization Docs

**Files:**
- Modify: `docs/customization.md`

- [ ] **Step 1: Add knowledge base customization section**

Add before the `## Contributing` section:

```markdown
## Configuring the Knowledge Base

The framework includes an optional project knowledge base (Obsidian-compatible) that gives the agent persistent project understanding across sessions.

### Enable

Add to your project's `CLAUDE.md`:

```markdown
## Knowledge Base

Path: .obsidian/
```

### Custom Path

Use any folder name:

```markdown
## Knowledge Base

Path: knowledge/
```

### Disable

Remove the `## Knowledge Base` section from CLAUDE.md. All knowledge operations are skipped — commands work exactly as before.

### What It Does

Pipeline commands automatically read from and write to the knowledge base:
- `/start` creates the structure when starting a new project
- `/prime` loads relevant notes for context before work
- `/create-prd` seeds the knowledge base from the PRD
- `/plan-project` creates feature notes alongside GitHub issues
- `/execute` reads related feature notes before implementing
- `/ship` updates feature notes after completing work

### Obsidian

If you have [Obsidian](https://obsidian.md/) installed, open your project folder as a vault. The `.obsidian/` directory makes it a valid vault. Notes are navigable, linkable, and searchable through Obsidian's UI. Obsidian is not required — the notes are plain markdown.
```

- [ ] **Step 2: Commit**

```bash
git add docs/customization.md
git commit -m "docs: add knowledge base customization guide"
```
