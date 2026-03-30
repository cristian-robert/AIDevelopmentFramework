# /create-prd — Product Requirements Document Generator

Generate a comprehensive PRD from a product idea. This command ALWAYS starts with brainstorming.

## Arguments

- `$ARGUMENTS` — optional: the product idea in brief (can also be discussed interactively)

## Process

### Phase 1: Brainstorm (MANDATORY)

Invoke the brainstorming skill to explore the idea before writing anything:

1. If `$ARGUMENTS` is provided, use it as the starting point
2. If not, ask: "What are you building? Give me the elevator pitch."
3. Explore through conversation:
   - What problem does this solve?
   - Who is the target user?
   - What are the constraints (timeline, budget, team size, tech preferences)?
   - What does success look like?
   - What's explicitly OUT of scope?
4. Propose 2-3 architectural approaches with tradeoffs
5. Get user's choice before proceeding

### Phase 2: Generate PRD

1. Read `.claude/references/prd-template.md` for the structure
2. Fill in every section based on the brainstorming conversation
3. Be specific — no placeholder text, no "TBD" sections
4. User stories should be concrete and testable
5. Implementation phases should be ordered by dependency and value

### Phase 3: Review and Save

1. Present the PRD to the user section by section
2. Ask for feedback on each major section
3. Incorporate feedback
4. Save to `docs/plans/PRD.md`

### Phase 4: Next Steps

After saving, tell the user:

> **PRD saved to `docs/plans/PRD.md`.**
>
> Next steps:
> - Run `/plan-project` to decompose this into GitHub milestones and issues
> - Or run `/plan-feature` to start planning a specific feature from the PRD

Commit the PRD:
```bash
git add docs/plans/PRD.md
git commit -m "docs: add product requirements document"
```
