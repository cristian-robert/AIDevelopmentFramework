# /plan-feature — Phase 2: Codebase Intelligence (Parallel Sub-Agents)

Launch 2-3 parallel sub-agents for speed. **Model selection per `_shared/model-matrix-summary.md`** — these are Tier 1/2 reads, not judgement work.

## Agent 1 — Structure and Patterns *(model: `haiku`)*

Pure file-system retrieval. Do NOT have this agent infer "patterns" — that's the orchestrator's job.

- Glob for files related to the feature
- Map directory structure for relevant areas
- Output: flat file inventory

## Agent 2 — Dependencies and Integration *(model: `sonnet`)*

- architect-agent RETRIEVE for relevant domains
- architect-agent IMPACT to understand what this change affects
- Identify integration points with other modules
- Check for shared utilities, types, or components to reuse

## Agent 3 — Testing and Validation *(model: `sonnet`)*

- Find existing test patterns for similar features
- Identify what test infrastructure exists
- Note validation commands (lint, type-check, test runners)

The orchestrator (Opus) consumes all three reports and does the actual planning judgement in Phase 4-5.
