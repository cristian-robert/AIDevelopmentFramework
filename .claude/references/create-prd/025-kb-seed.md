# /create-prd — Phase 2.5: Seed Knowledge Base

Per `_shared/kb-detect.md`. If KB is off → skip this phase.

## Steps

1. Read `.claude/references/kb-article-template.md` for templates.
2. Create the KB structure if it doesn't exist (same as `/start` L0 step — see `start/l0-kb-scaffold.md`).
3. Create `<kb-path>/wiki/project-overview.md` (type: `reference`):
   - Vision from Executive Summary
   - Goals from Goals & Success Criteria
   - Target Users from Target Users section
   - Tech Stack from Technical Architecture
   - Feature Areas listing each epic/feature with wikilinks
4. Create `<kb-path>/wiki/system-design.md` (type: `concept`):
   - Architecture from Technical Architecture and System Diagram sections
5. For each epic or major feature in the PRD, create `<kb-path>/wiki/<feature-name>.md` (type: `feature`):
   - Summary from the epic description
   - GitHub Issues section left empty (populated by `/plan-project`)
   - Key Decisions from brainstorming
   - Related articles linking to project-overview and system-design
6. Update `wiki/_index.md` and `wiki/_tags.md`.
7. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`.
