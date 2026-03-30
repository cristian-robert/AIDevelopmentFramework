# /plan-feature — Feature Implementation Planner

Creates a detailed implementation plan for a feature. The plan must pass the "no prior knowledge" test — an engineer unfamiliar with the codebase can implement using only the plan.

## Arguments

- `$ARGUMENTS` — feature description OR GitHub issue number (e.g., `#42`)

## Process

### Phase 1: Feature Understanding

1. If an issue number is provided, read it: `gh issue view <number>`
2. If a description is provided, clarify:
   - What user-facing behavior should change?
   - What are the acceptance criteria?
   - Is this S/M/L/XL scope?
3. For L/XL features, invoke brainstorming skill first
4. Write user stories in "As a [user], I want [action] so that [benefit]" format

### Phase 2: Codebase Intelligence (Parallel Sub-Agents)

Launch 2-3 parallel sub-agents for speed:

**Agent 1 — Structure and Patterns:**
- Run `/prime` if not already primed
- Glob for files related to the feature
- Identify existing patterns (how similar features are built)
- Map the directory structure for relevant areas

**Agent 2 — Dependencies and Integration:**
- architect-agent RETRIEVE for relevant domains
- architect-agent IMPACT to understand what this change affects
- Identify integration points with other modules
- Check for shared utilities, types, or components to reuse

**Agent 3 — Testing and Validation:**
- Find existing test patterns for similar features
- Identify what test infrastructure exists
- Note validation commands (lint, type-check, test runners)

### Phase 3: External Research

- Use context7 MCP to verify framework APIs you plan to use
- Check library documentation for any unfamiliar APIs
- Note any dependencies that need to be installed

### Phase 4: Strategic Thinking

Before writing the plan, think through:
- Does this fit the existing architecture? If not, is refactoring needed first?
- What are the edge cases? (empty states, error states, concurrent access)
- Security implications? (input validation, auth checks, data exposure)
- Performance concerns? (N+1 queries, large payloads, unnecessary re-renders)
- What could go wrong during implementation?

### Phase 5: Plan Generation

Read `.claude/references/plan-template.md` and generate a complete plan.

Requirements for every plan:
- Exact file paths for every file to create or modify
- Complete code in every step (no placeholders)
- Exact terminal commands with expected output for every verification step
- TDD: tests before implementation in every task
- Conventional commit after every task
- GOTCHA warnings for known pitfalls
- Confidence score (1-10) for one-pass success

### Phase 6: GitHub Issue

If no issue exists for this feature:
```bash
gh issue create --title "[type]: description" --body "..." --label "feat,size:M"
```

If issue exists, add a comment linking to the plan:
```bash
gh issue comment <number> --body "Implementation plan: docs/plans/<plan-file>.md"
```

### Phase 7: Save and Offer Execution

Save to `docs/plans/<kebab-case-feature-name>.md`

Commit:
```bash
git add docs/plans/<plan-file>.md
git commit -m "docs: add implementation plan for <feature>"
```

Then offer:

> **Plan saved. Ready to implement?**
>
> For complex features (context reset recommended):
> Start a new session, run `/prime`, then `/execute docs/plans/<plan-file>.md`
>
> For simpler features (stay in session):
> Run `/execute docs/plans/<plan-file>.md`
