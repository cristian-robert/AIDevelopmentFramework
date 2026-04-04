# /evolve — Self-Improvement

Updates the framework's rules, knowledge base, and patterns from what was learned in this session. This is what makes the system get smarter over time.

## Philosophy

"Every bug from the AI coding assistant isn't just something to fix — it's an opportunity to address the root cause in your system."

## Process

### Step 1: Reflect on Session

Review what happened in this session:
1. `git log --oneline main..HEAD` — what was built
2. Were there any:
   - Bugs that took multiple attempts to fix?
   - Patterns the AI got wrong repeatedly?
   - Missing context that caused mistakes?
   - New conventions established?
   - Architecture decisions made?

### Step 2: Update CLAUDE.md

Invoke the revise-claude-md skill (from claude-md-management plugin) to:
- Add new conventions discovered
- Update tech stack if it changed
- Add new commands or scripts
- Remove outdated information

If the plugin isn't available, manually check CLAUDE.md for needed updates.

### Step 3: Update Knowledge Bases

**Architect Knowledge Base** — If structural changes were made:
1. Dispatch architect-agent with RECORD query
2. Agent verifies changes exist in codebase
3. Agent updates relevant domain files in modules/ and frontend/
4. Agent updates index.md if new domains were added

**Wiki Knowledge Base** — If configured in CLAUDE.md (`## Knowledge Base` section):
1. Review the session for learnings: decisions made, patterns discovered, bugs solved, trade-offs evaluated, conventions adopted
2. For each significant learning, create a raw session file:
   - Save to `<kb-path>/raw/sessions/YYYY-MM-DD-<topic>.md`
   - Add entry to `<kb-path>/raw/_manifest.md` with status `pending`
3. Create stub wiki articles for each learning (type: `session-learning`)
4. Update `wiki/_index.md` and `wiki/_tags.md`
5. Run: `KB_PATH=<kb-path> node cli/kb-search.js index`
6. If stubs have accumulated, suggest: "Run `/kb compile` to expand session learnings into full articles with cross-links."

### Step 4: Update Rules

Check if any domain rules need updating:
- Did a new pattern emerge in backend code? Update rules/backend.md
- Did a new component pattern emerge? Update rules/frontend.md
- Did a testing anti-pattern surface? Update rules/testing.md

### Step 5: Update Code Patterns

If the /execute phase revealed patterns the AI should follow:
- Add to .claude/references/code-patterns.md
- Include real code examples from the current codebase
- Note common pitfalls with before/after examples

### Step 6: Update Test Patterns

If new pages or screens were created:
- Update .claude/agents/tester-agent/test-patterns.md with new routes
- Update .claude/agents/mobile-tester-agent/screen-patterns.md if mobile

### Step 7: Report

```
=== System Evolution ===

Updated:
- [ ] CLAUDE.md — [what changed]
- [ ] architect-agent knowledge base — [domains updated]
- [ ] rules/[domain].md — [what changed]
- [ ] references/code-patterns.md — [patterns added]
- [ ] test-patterns.md — [routes added]

New decisions recorded:
- ADR-N: [decision title]

System health:
The framework is now better equipped to handle [specific scenario].
```

Commit all updates:
```bash
git add CLAUDE.md .claude/
git commit -m "chore: evolve framework — update rules and knowledge base"
```
