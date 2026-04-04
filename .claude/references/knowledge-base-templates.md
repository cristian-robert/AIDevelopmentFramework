# Knowledge Base Templates

Used by pipeline commands when creating knowledge base notes. The knowledge base path is configured in the project's CLAUDE.md under `## Knowledge Base`.

---

## Feature Note Template

Create one per feature area in `<kb-path>/features/<feature-name>.md`.

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

---

## Decision Record Template

Create in `<kb-path>/decisions/NNN-title.md` when:
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

---

## Overview Template

Create once at `<kb-path>/overview.md` during project setup or PRD creation.

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

---

## Architecture Template

Create at `<kb-path>/architecture/system-design.md` from PRD's technical architecture section.

```markdown
# System Design

## Overview

[High-level description of the system architecture]

## Components

| Component | Responsibility | Tech |
|-----------|---------------|------|
| | | |

## Data Flow

[How data moves through the system]

## Integrations

[External services and how they connect]
```
