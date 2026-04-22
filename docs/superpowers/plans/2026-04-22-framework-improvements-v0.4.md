# Framework Improvements v0.4 — PIV+E Hardening Batch — Implementation Plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Every task has a mandatory spec-reviewer checkpoint (Task 3 introduces the enforcement mechanism — apply it retroactively from Task 3 onward and manually after Tasks 1–2 until it's wired up).

**Issue:** [#7](https://github.com/cristian-robert/AIDevelopmentFramework/issues/7) — Framework improvements v0.4 — PIV+E hardening batch
**Branch:** `feat/framework-improvements-v0.4`
**Mode:** Superpowers

**Goal:** Land 10 framework improvements in one batch: enforce per-task spec review, harden the CLI, redesign rules/KB for token-lean loading, adapt the KB to Karpathy's workflow, add `/merge-configs`, add user-facing output compaction with a toggle, and ship research-backed anti-AI-slop frontend rules.

**Architecture:** Three intertwined levers —
1. **Token economy:** thin rules + on-demand references + lean KB indexes + task-aware prime + Karpathy-style LLM-owned wiki. Detail lives in the wiki (loaded only when relevant); rules and CLAUDE.md become pointers.
2. **Pipeline discipline:** every implementer task in `/execute` is immediately followed by a mandatory spec-reviewer dispatch (validates spec adherence + adversarial review of the approach).
3. **Surface hardening:** CLI bugs fixed (P0 symlink/atomic/corruption), new `/merge-configs` command lifted from `/start` Step 0, caveman-style user-facing output compaction with a user toggle, and an enforced anti-AI-slop frontend rule with research-backed patterns.

**Tech Stack:** Node.js CLI (no new runtime deps), Markdown for commands/rules/plans, Shell hooks, Obsidian-compatible wiki, TF-IDF search (existing), firecrawl MCP for research.

**Confidence Score:** 7/10 for one-pass implementation success. The CLI P0 fixes and `/merge-configs` extraction are mechanical. The rules/KB cluster has coupling risk (prime, evolve, rule-file shape, KB lean index all change together). Caveman compaction is the riskiest — implementing it as a Claude Code hook requires care not to mangle formatted output. A context reset before Task 9 (caveman) is recommended.

**Context Reset:** Recommended between Task 7 (rule/KB cluster done) and Task 8 (`/merge-configs` onward). Also recommended before Task 11 (firecrawl research).

---

## Mandatory Reading

Before implementing, read these files to understand the codebase context:

| File | Lines | What to Learn |
|------|-------|--------------|
| `CLAUDE.md` | full | Framework overview, KB config pattern, Post-Init Merge section, Code Review Layers |
| `.claude/commands/prime.md` | 1–85 | Current /prime flow — Sections 1-6 and output format |
| `.claude/commands/evolve.md` | 1–94 | Current /evolve flow — Steps 1-7 and rule-write pattern |
| `.claude/commands/execute.md` | 1–91 | Current /execute flow — Step 3 task loop is where spec-reviewer injection lives |
| `.claude/commands/start.md` | 1–46 | Post-Init Merge logic (Step 0) — source material for `/merge-configs` |
| `.claude/commands/ship.md` | full | Pattern for commands that optionally invoke external plugins (mirror for spec-reviewer dispatch) |
| `.claude/references/plan-template.md` | 1–92 | Plan shape — reused by `/plan-feature` |
| `.claude/references/kb-article-template.md` | 1–276 | Wiki article frontmatter spec, stub/feature/session-learning variants |
| `.claude/rules/_global.md` | 1–38 | Global rules + KB integration hygiene — will add `## References` section convention |
| `.claude/rules/backend.md` | 1–51 | Current "inline" rule shape — will be converted to thin pointers |
| `.claude/rules/frontend.md` | 1–36 | Design skill gate — target for anti-slop integration |
| `cli/kb-search.js` | 1–270 | TF-IDF search + index builder — target for lean-index, atomic writes, flag validation |
| `cli/init.js` | 1–385 | Install flow + backupAndCopy — target for symlink fix, atomic copy, git-init fatal |
| `cli/update.js` | 1–270 | Update flow + preservation logic — target for symlink fix, partial-download cleanup |
| `cli/protected-files.js` | full | Shared protected-file catalog |

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `.claude/commands/merge-configs.md` | New slash command — merge user's existing CLAUDE.md/.claude with framework, usable anytime |
| `.claude/hooks/output-compact.sh` | Stop hook — caveman-style compaction of final user-facing assistant message |
| `.claude/hooks/spec-reviewer-enforce.sh` | PostToolUse hook (TaskUpdate) — verify every implementer task has a paired spec-reviewer dispatch |
| `.claude/references/frontend-antislop-patterns.md` | Research-backed catalogue of AI-slop markers + approved alternatives |
| `.claude/references/merge-strategy.md` | Reusable merge rules table (what to merge vs restore) — source of truth for `/merge-configs` and `/start` Step 0 |
| `.claude/references/output-compaction.md` | Caveman rules + what to compact vs preserve (code blocks, file paths, tables) |
| `.claude/references/spec-reviewer-protocol.md` | Role definition: inputs, checklist, adversarial questions, blocking criteria |
| `.claude/rules/frontend-antislop.md` | Enforced anti-AI-slop rule — loads alongside frontend.md |
| `cli/lean-index.js` | Generates `<kb-path>/_search/lean-index.json` — metadata-only wiki view (title, type, tags, 1-line summary) |
| `cli/lean-index.test.js` | Tests for lean-index builder |
| `cli/cli-hardening.test.js` | Regression tests for P0/P1 CLI bugs (symlink, atomic write, empty query, corrupted index) |
| `docs/changelog/v0.4.md` | Release notes for this batch |

### Modified Files

| File | Changes |
|------|---------|
| `CLAUDE.md` | Add `## Output Compaction` section (default on); clarify that rules are pointers to references/wiki; note new `/merge-configs` command; bump version note |
| `.claude/commands/prime.md` | Section 6 rewritten: ask user (issue / task / none), use lean-index, load only index + top-3 summaries (not full articles) |
| `.claude/commands/evolve.md` | Step 2 + Step 4 + Step 5: detail goes to wiki (raw + stub); rules only get pointer updates; token-budget check on rule files |
| `.claude/commands/execute.md` | Step 3 rewritten: after each task, mandatory spec-reviewer dispatch via `superpowers:subagent-driven-development` reviewer role; cannot proceed to next task without review pass |
| `.claude/commands/start.md` | Step 0 refactored to delegate to `/merge-configs` (keep the detection + hand-off) |
| `.claude/commands/validate.md` | Visual-pass step invokes `frontend-antislop` checklist when UI changes detected |
| `.claude/rules/_global.md` | Add `## References` section convention (thin-pointer protocol); token-budget guidance for rule files (<150 lines) |
| `.claude/rules/_template.md` | New rule shape: Skill Chain + Conventions + `## References` block only |
| `.claude/rules/backend.md` | Convert inline detail to references (link to `security-checklist.md`, wiki articles); target <80 lines |
| `.claude/rules/frontend.md` | Add anti-slop reference + integrate with design gate |
| `.claude/rules/testing.md` | Convert to thin-pointer shape; target <80 lines |
| `.claude/rules/security.md` | Convert to thin-pointer shape; target <60 lines |
| `.claude/rules/database.md` | Convert to thin-pointer shape; target <60 lines |
| `.claude/rules/mobile.md` | Convert to thin-pointer shape; target <60 lines |
| `.claude/rules/knowledge-base.md` | Add Karpathy-workflow checklist items (raw→compile loop, lint pass, lean-index rebuild) |
| `.claude/hooks/session-primer.sh` | Output-compaction aware (skip compaction for primer content) |
| `cli/init.js` | Symlink-safe `backupAndCopy` (`fs.lstatSync`); atomic CLAUDE.md copy; fatal git-init failure; UTF-8 encoding on all reads; install lean-index.js |
| `cli/update.js` | Symlink-safe backup; random UUID tmpDir (not Date.now); partial-download cleanup; install lean-index.js |
| `cli/kb-search.js` | Atomic index write (`.tmp` + rename); delete corrupted index before rebuild; empty-query rejection; `--limit=N` flag; `--type=` empty-value rejection; `--help`; document `stats` in index.js help; call lean-index after build |
| `cli/index.js` | Document `kb-search stats` in help text; expose `lean-index` subcommand |
| `cli/protected-files.js` | Add lean-index.js + new command/reference/hook files to framework list |
| `package.json` | New scripts: `kb:lean-index`, `test:cli` (bundles hardening + backup + kb tests) |

---

## Dependencies

No new runtime dependencies. Research task uses the existing `firecrawl` plugin (no install needed). Optional: `superpowers` plugin for subagent-driven-development (already assumed present in Superpowers mode).

---

## Tasks

> **Execution rule:** Starting from Task 3, every task implementer MUST be followed by a spec-reviewer dispatch before the next task begins (the enforcement mechanism itself is Task 3). For Tasks 1–2 (quick wins), the human operator dispatches the spec-reviewer manually.

---

### Task 1: CLI P0 fixes — symlink-safe backup, atomic index, corruption cleanup, tmpDir collisions

**Files:**
- Modify: `cli/init.js:119-163` (backupAndCopy), `cli/init.js:30-40` (download), `cli/init.js:242-258` (CLAUDE.md copy), `cli/init.js:330-341` (git init), `cli/init.js` (UTF-8 encoding on all reads)
- Modify: `cli/update.js:43-89` (backupAndCopy), `cli/update.js:128-145` (download tmpDir)
- Modify: `cli/kb-search.js:101-134` (buildIndex), `cli/kb-search.js:136-156` (loadIndex corruption)
- Create: `cli/cli-hardening.test.js`
- Modify: `package.json` (add `test:cli` script)

- [ ] Step 1: Write failing regression tests
  ```javascript
  // cli/cli-hardening.test.js
  const fs = require('fs');
  const path = require('path');
  const os = require('os');
  const { execFileSync } = require('child_process');
  const assert = require('assert');

  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-hardening-'));

  function test(name, fn) {
    try { fn(); console.log('PASS', name); }
    catch (e) { console.error('FAIL', name, e.message); process.exitCode = 1; }
  }

  test('backupAndCopy does not follow symlinked directories', () => {
    const src = path.join(TMP, 'src'); const dest = path.join(TMP, 'dest');
    const outside = path.join(TMP, 'outside');
    fs.mkdirSync(src, { recursive: true });
    fs.mkdirSync(outside, { recursive: true });
    fs.writeFileSync(path.join(outside, 'secret.txt'), 'SECRET');
    fs.symlinkSync(outside, path.join(src, 'link-to-outside'), 'dir');
    const { backupAndCopy } = require('./init.js'); // export required
    backupAndCopy(src, dest, { updated: 0, created: 0, backedUp: 0, backedUpFiles: [] });
    assert.ok(!fs.existsSync(path.join(dest, 'link-to-outside', 'secret.txt')),
      'symlink should not be traversed');
  });

  test('kb-search index is atomically written', () => {
    // simulate: start two builds concurrently, index.json must never be mid-write readable
    process.env.KB_PATH = path.join(TMP, 'kb');
    fs.mkdirSync(path.join(process.env.KB_PATH, 'wiki'), { recursive: true });
    fs.writeFileSync(path.join(process.env.KB_PATH, 'wiki', 'a.md'), '---\ntitle: A\n---\nbody');
    const kb = require('./kb-search.js');
    // Trigger two parallel builds via child processes; then read index
    // (simplified: verify no .tmp file lingers after build)
    execFileSync('node', ['cli/kb-search.js', 'index']);
    assert.ok(!fs.existsSync(path.join(process.env.KB_PATH, '_search', 'index.json.tmp')),
      'tmp file should not linger');
  });

  test('corrupted index.json is deleted and rebuilt', () => {
    const idxPath = path.join(process.env.KB_PATH, '_search', 'index.json');
    fs.writeFileSync(idxPath, '{"broken":'); // truncated JSON
    execFileSync('node', ['cli/kb-search.js', 'search', 'a']);
    const result = JSON.parse(fs.readFileSync(idxPath, 'utf-8'));
    assert.ok(result.docs, 'index rebuilt after corruption');
  });

  test('tmpDir does not collide across runs', () => {
    // Date.now() at same ms → both runs pick same path. Ensure UUID-based.
    const { tmpPath: p1 } = require('./init.js').__test_tmpPath();
    const { tmpPath: p2 } = require('./init.js').__test_tmpPath();
    assert.notStrictEqual(p1, p2, 'tmp paths must differ');
  });
  ```

- [ ] Step 2: Run tests to verify they fail
  Run: `node cli/cli-hardening.test.js`
  Expected: FAIL all four tests

- [ ] Step 3: Implement fixes in `cli/init.js`
  - Replace `entry.isDirectory()` + `fs.statSync` with `fs.lstatSync` + explicit `isSymbolicLink()` skip
  - Export `backupAndCopy` and `__test_tmpPath` for tests
  - Replace `const tmpDir = path.join(os.tmpdir(), 'aidf-' + Date.now())` with `crypto.randomUUID()`
  - Wrap CLAUDE.md copy in try/catch; rollback backup if copy fails
  - Make git-init failure fatal when user explicitly opted in: `console.error` + `process.exit(1)`
  - Add `'utf-8'` to every `fs.readFileSync(...)` call missing it

- [ ] Step 4: Implement fixes in `cli/update.js`
  - Same symlink and tmpDir changes as init.js
  - Add cleanup in `finally`: if extraction failed, remove tmpDir before falling back to local

- [ ] Step 5: Implement fixes in `cli/kb-search.js`
  ```javascript
  // atomic write
  function writeIndex(index) {
    const tmp = INDEX_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(index), 'utf-8');
    fs.renameSync(tmp, INDEX_FILE);
  }
  // corruption cleanup
  function loadIndex() {
    try {
      return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    } catch (e) {
      try { fs.unlinkSync(INDEX_FILE); } catch (_) {}
      return buildIndex();
    }
  }
  ```

- [ ] Step 6: Run tests to verify pass
  Run: `node cli/cli-hardening.test.js && node cli/kb-search.test.js && node cli/init-backup.test.js`
  Expected: PASS all

- [ ] Step 7: Commit
  ```bash
  git add cli/init.js cli/update.js cli/kb-search.js cli/cli-hardening.test.js package.json
  git commit -m "fix(cli): harden backup/index/download — symlink-safe, atomic writes, corruption cleanup"
  ```

**GOTCHA:** `fs.lstatSync()` returns a `Stats` object, but inside `fs.readdirSync(dir, { withFileTypes: true })` the entries are `Dirent` objects — use `entry.isSymbolicLink()` directly, don't re-stat.

---

### Task 2: CLI P1/P2 hardening — flag validation, --limit, --help, encoding, discoverability

**Files:**
- Modify: `cli/kb-search.js` (flag parsing, --limit, --help, empty-query exit)
- Modify: `cli/index.js` (help text: add `kb-search stats`, `lean-index`)
- Modify: `cli/init.js` (validate `package.json` existence before parse)
- Modify: `cli/cli-hardening.test.js` (new cases)

- [ ] Step 1: Add test cases to `cli/cli-hardening.test.js`
  ```javascript
  test('empty query exits non-zero with error message', () => {
    try {
      execFileSync('node', ['cli/kb-search.js', 'search', ''], { stdio: 'pipe' });
      throw new Error('should have exited non-zero');
    } catch (e) { assert.ok(e.status !== 0); }
  });
  test('--type= empty value is rejected', () => {
    try {
      execFileSync('node', ['cli/kb-search.js', 'search', 'foo', '--type='], { stdio: 'pipe' });
      throw new Error('should have exited non-zero');
    } catch (e) { assert.ok(e.status !== 0); }
  });
  test('--limit=N limits results', () => {
    // seed 10 articles, search, expect 3
    // ... (setup code)
    const out = execFileSync('node', ['cli/kb-search.js', 'search', 'a', '--limit=3']);
    const res = JSON.parse(out.toString());
    assert.strictEqual(res.results.length, 3);
  });
  test('--help prints usage', () => {
    const out = execFileSync('node', ['cli/kb-search.js', '--help']).toString();
    assert.ok(out.includes('Usage:'));
  });
  ```

- [ ] Step 2: Implement in `cli/kb-search.js`
  - After tokenizing: `if (!queryTerms.length) { console.error('Empty query'); process.exit(2); }`
  - After `--type` parse: `if (typeArg && !opts.type) { console.error('--type requires a value'); process.exit(2); }` (same for `--tag`)
  - Add `--limit=N` parsing; validate `Number.isInteger(limit) && limit > 0`; apply `.slice(0, limit)` before returning
  - Add top-level `--help` handler printing usage, subcommands, flags

- [ ] Step 3: Update `cli/index.js` help text
  - Add lines: `kb-search index | search <q> [--type=T] [--tag=T] [--limit=N] | stats`
  - Add: `lean-index` (to be wired up in Task 5)

- [ ] Step 4: Verify
  Run: `node cli/cli-hardening.test.js`
  Expected: all new cases PASS

- [ ] Step 5: Commit
  ```bash
  git add cli/kb-search.js cli/index.js cli/cli-hardening.test.js cli/init.js
  git commit -m "feat(cli): add --limit/--help/stats docs, validate flags, reject empty query"
  ```

**GOTCHA:** Existing test `kb-search.test.js` may depend on the current "return empty silently" behavior of empty queries. Update any tests that call `search('')` expecting success — rejection is the new contract.

---

### Task 3: Enforce spec-reviewer after every implementer task in `/execute`

**Files:**
- Create: `.claude/references/spec-reviewer-protocol.md` (role definition, adversarial checklist)
- Create: `.claude/hooks/spec-reviewer-enforce.sh` (PostToolUse hook — flags missing reviewer dispatch)
- Modify: `.claude/commands/execute.md` (Step 3 rewrite + new Step 3.5)
- Modify: `.claude/settings.local.json` (register hook)

- [ ] Step 1: Write `spec-reviewer-protocol.md`
  Content: inputs (plan task spec + diff), responsibilities (spec adherence + adversarial review), checklist (acceptance criteria met? tests added? scope creep? security? edge cases? simpler alternative?), blocking criteria (missing test, spec deviation without note, obvious bug), output format (PASS / REQUEST_CHANGES with list).

- [ ] Step 2: Rewrite `.claude/commands/execute.md` Step 3
  Replace current lines 44–60 with:
  ```markdown
  ### Step 3: Execute Tasks (implementer → reviewer loop, mandatory)

  For each task in the plan, dispatch TWO subagents in sequence:

  **3a. Task Implementer**
  1. Announce: "Starting Task N: [task name] — dispatching implementer"
  2. Dispatch via superpowers:subagent-driven-development with role `task-implementer`
  3. Implementer reads plan task + mandatory files, writes tests first, implements, verifies
  4. On implementer return: capture diff (`git diff`) and task exit status

  **3b. Spec Reviewer (MANDATORY — DO NOT SKIP)**
  1. Announce: "Task N implementer complete — dispatching spec-reviewer"
  2. Dispatch subagent with role `spec-reviewer`, passing:
     - The plan task spec
     - The implementer's diff
     - `.claude/references/spec-reviewer-protocol.md`
  3. Reviewer runs the protocol checklist + adversarial questions:
     - "Is the implementer's approach the simplest viable?"
     - "What could be cut without losing acceptance criteria?"
     - "What edge case is missing?"
     - "Does any choice contradict an existing pattern/reference?"
  4. Reviewer returns PASS or REQUEST_CHANGES with specific blockers
  5. If REQUEST_CHANGES: return to 3a with reviewer output; do NOT proceed to next task
  6. If PASS: mark task checkbox done; proceed

  **Enforcement:** The PostToolUse hook `.claude/hooks/spec-reviewer-enforce.sh` watches TodoWrite/TaskUpdate completions. If an implementer task is marked completed without a paired reviewer dispatch in the preceding N tool calls, the hook prints a warning to stderr and blocks the next tool call. Override only with explicit user confirmation.
  ```

- [ ] Step 3: Write the enforce hook
  ```bash
  #!/usr/bin/env bash
  # .claude/hooks/spec-reviewer-enforce.sh
  # PostToolUse hook (event: TaskUpdate / TodoWrite status=completed)
  # Parses tool name + args from stdin JSON. If an implementer task completed
  # without a subsequent spec-reviewer dispatch in the session transcript
  # within 10 tool calls, emit a blocking message.
  set -euo pipefail
  input="$(cat)"
  # Read session transcript path
  transcript="${CLAUDE_TRANSCRIPT_PATH:-$HOME/.claude/latest-transcript.jsonl}"
  # Grep last 20 tool calls for task-implementer / spec-reviewer pairing
  tail -n 40 "$transcript" 2>/dev/null | \
    awk '/"role":"task-implementer"/{impl=NR} /"role":"spec-reviewer"/{rev=NR} END{if(impl && (!rev || rev<impl)) exit 2}' || {
    echo "BLOCK: implementer task completed without spec-reviewer dispatch. See .claude/references/spec-reviewer-protocol.md" >&2
    exit 2
  }
  ```

- [ ] Step 4: Register hook in `.claude/settings.local.json`
  Add under `hooks.PostToolUse`:
  ```json
  { "matcher": "TodoWrite|TaskUpdate", "hooks": [{ "type": "command", "command": ".claude/hooks/spec-reviewer-enforce.sh" }] }
  ```

- [ ] Step 5: Manual verification
  Run: `bash .claude/hooks/spec-reviewer-enforce.sh < /dev/null || echo "ok fail path"`
  Expected: script exits cleanly on empty input (defensive) or emits block message; does not crash.

- [ ] Step 6: Commit
  ```bash
  git add .claude/commands/execute.md .claude/hooks/spec-reviewer-enforce.sh .claude/references/spec-reviewer-protocol.md .claude/settings.local.json
  git commit -m "feat(execute): enforce mandatory spec-reviewer after every implementer task"
  ```

**GOTCHA:** The hook depends on session transcript format. Test on a real session before declaring victory. If the transcript path is not exposed via env var, fall back to a `.claude/.last-impl-task` marker file written by `/execute` itself.

---

### Task 4: Rules restructure — thin-pointer shape + `## References` convention

**Files:**
- Modify: `.claude/rules/_global.md` (add `## References` convention documentation + token-budget guidance)
- Modify: `.claude/rules/_template.md` (new thin shape)
- Modify: `.claude/rules/backend.md` (convert to thin, target <80 lines)
- Modify: `.claude/rules/testing.md` (convert to thin, target <80 lines)
- Modify: `.claude/rules/security.md` (convert to thin, target <60 lines)
- Modify: `.claude/rules/database.md` (convert to thin, target <60 lines)
- Modify: `.claude/rules/frontend.md` (convert to thin, target <60 lines — anti-slop added in Task 12)
- Modify: `.claude/rules/mobile.md` (convert to thin, target <60 lines)
- Create: `.claude/references/backend-detail.md`, `.claude/references/testing-detail.md`, etc. (where content is moved that doesn't already have a reference)

- [ ] Step 1: Update `_template.md` to new shape
  ```markdown
  # [Domain] Rules

  ## Skill Chain

  1. <First skill or agent>
  2. <Second skill>
  3. <Verification step>

  ## Conventions

  - <Highest-leverage conventions only — max 10 bullets>

  ## Checklist

  - [ ] <Post-implementation checks — max 6 items>

  ## References

  Load only when the rule triggers:

  - `path/to/reference.md` — load when <specific condition>
  - `<kb-path>/wiki/<article>.md` — load when <specific condition>
  ```

- [ ] Step 2: Update `_global.md` with the convention
  Add new section:
  ```markdown
  ## Rule File Budget

  - Rule files are indexes, not encyclopedias. Target ≤150 lines, soft cap 200.
  - Detail lives in `.claude/references/*.md` or the wiki (when KB is configured).
  - Every rule file ends with a `## References` block listing `path — when to load`.
  - `/evolve` enforces this — if a rule exceeds 200 lines, /evolve extracts overflow to a reference file on the next run.
  ```

- [ ] Step 3: Convert each domain rule file
  For each of backend/testing/security/database/frontend/mobile:
  1. Keep: Skill Chain, top-5 Conventions, top-5 Checklist items
  2. Move: all long prose, checklists with >8 items, any detailed examples → to a paired reference file (create if none exists)
  3. Add `## References` block with `path — when to load` entries

  Example — new `.claude/rules/backend.md`:
  ```markdown
  # Backend Rules

  ## Skill Chain
  1. KB search (if configured) — `KB_PATH=<path> node cli/kb-search.js search "<keywords>"`
  2. architect-agent RETRIEVE — understand current structure
  3. context7 MCP — verify framework API
  4. Implement — follow patterns
  5. architect-agent RECORD — update knowledge base
  6. KB update — update wiki articles for structural changes

  ## Conventions
  - Every endpoint has input validation (DTOs/schemas)
  - Business logic in services, not controllers
  - Error responses follow `{ error: string, statusCode: number }`
  - No hardcoded secrets — env vars only
  - DB queries via repository/service layer

  ## Checklist
  - [ ] All endpoints authenticated + authorized
  - [ ] All inputs validated
  - [ ] No sensitive fields in API responses
  - [ ] `npm audit` clean
  - [ ] Wiki articles updated for structural changes

  ## References
  - `.claude/references/security-checklist.md` — load for any auth/API/infra change
  - `.claude/references/backend-detail.md` — load for error formats, DI patterns, logging
  - `<kb-path>/wiki/_index.md` — search and load feature articles when touching endpoints
  ```

- [ ] Step 4: Verify line counts
  Run: `wc -l .claude/rules/*.md`
  Expected: each domain rule <150 lines; total `.claude/rules/` shrinks meaningfully.

- [ ] Step 5: Commit
  ```bash
  git add .claude/rules/ .claude/references/
  git commit -m "refactor(rules): convert to thin-pointer shape with on-demand references"
  ```

**GOTCHA:** Don't drop content on the floor — anything removed from a rule file must land in a reference or wiki article. Use `diff` to confirm net content is preserved.

---

### Task 5: KB Karpathy adaptation — lean index, per-doc summaries, health-check CLI

**Files:**
- Create: `cli/lean-index.js` (generates `<kb-path>/_search/lean-index.json`)
- Create: `cli/lean-index.test.js`
- Modify: `cli/kb-search.js` (invoke lean-index generation after build; add `lean` subcommand)
- Modify: `cli/index.js` (expose `lean-index` subcommand)
- Modify: `cli/protected-files.js` (add lean-index.js)
- Modify: `cli/init.js` + `cli/update.js` (install lean-index.js)
- Modify: `.claude/commands/kb-compile.md` (add health-check step — lint inconsistencies, missing data, new-article candidates)
- Modify: `.claude/commands/kb-ingest.md` (Web-Clipper and image-download guidance)
- Modify: `.claude/rules/knowledge-base.md` (Karpathy workflow checklist)
- Modify: `package.json` (add `kb:lean-index` script)

- [ ] Step 1: Write failing test `cli/lean-index.test.js`
  ```javascript
  const assert = require('assert');
  const fs = require('fs'); const path = require('path'); const os = require('os');
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'lean-'));
  process.env.KB_PATH = TMP;
  fs.mkdirSync(path.join(TMP, 'wiki'), { recursive: true });
  fs.writeFileSync(path.join(TMP, 'wiki', 'a.md'),
    '---\ntitle: Auth\ntype: feature\ntags: [auth, security]\n---\nAuthentication module for login/signup flows.');
  const { buildLeanIndex } = require('./lean-index.js');
  const idx = buildLeanIndex();
  assert.strictEqual(idx.docs[0].title, 'Auth');
  assert.strictEqual(idx.docs[0].type, 'feature');
  assert.deepStrictEqual(idx.docs[0].tags, ['auth', 'security']);
  assert.ok(idx.docs[0].summary.length > 0 && idx.docs[0].summary.length < 200);
  assert.ok(!idx.docs[0].body, 'lean index must not contain full body');
  console.log('PASS lean-index');
  ```

- [ ] Step 2: Implement `cli/lean-index.js`
  - Export `buildLeanIndex()` that reads `<KB_PATH>/wiki/*.md`, parses frontmatter, extracts first sentence / first 160 chars as `summary`, writes atomic JSON to `<KB_PATH>/_search/lean-index.json`
  - JSON shape: `{ generated: <iso>, docs: [{ file, title, type, tags, summary }] }`
  - Atomic write pattern (same as Task 1)

- [ ] Step 3: Wire into `cli/kb-search.js`
  - After `buildIndex()` completes, call `buildLeanIndex()` too
  - Add `lean` subcommand that prints the lean index

- [ ] Step 4: Update `/prime`'s KB section (preview — full rewrite in Task 6) to read `lean-index.json` not full wiki articles.

- [ ] Step 5: Update `.claude/commands/kb-compile.md`
  Add new step:
  ```markdown
  ### Step N: Health Check (Karpathy lint pass)
  After compilation, run an LLM-assisted health check:
  1. Identify inconsistent data across articles (conflicting facts, duplicate coverage)
  2. Impute missing data using web search for referenced concepts
  3. Suggest new-article candidates from orphan concepts mentioned but not expanded
  4. Report findings; user approves each before edit
  ```

- [ ] Step 6: Update `.claude/commands/kb-ingest.md`
  Add guidance section for Obsidian Web Clipper + image download:
  ```markdown
  ### Ingesting web articles
  - Preferred path: Obsidian Web Clipper extension → saves article as .md to `<kb-path>/raw/articles/`
  - Related images: use a configured hotkey/script to download inline images alongside the .md so the LLM can reference them by local path
  ```

- [ ] Step 7: Update `cli/protected-files.js` + `cli/init.js` + `cli/update.js`
  Ensure `lean-index.js` is shipped alongside `kb-search.js` (same install hook already exists for kb-search — mirror it).

- [ ] Step 8: Run tests
  Run: `node cli/lean-index.test.js && node cli/kb-search.test.js && node cli/kb-integration.test.js`
  Expected: PASS

- [ ] Step 9: Commit
  ```bash
  git add cli/lean-index.js cli/lean-index.test.js cli/kb-search.js cli/index.js cli/protected-files.js cli/init.js cli/update.js .claude/commands/kb-compile.md .claude/commands/kb-ingest.md .claude/rules/knowledge-base.md package.json
  git commit -m "feat(kb): add lean-index + Karpathy workflow (ingest/compile/health-check)"
  ```

**GOTCHA:** The lean-index must NEVER contain full article bodies — it's there to stay small. Enforce this with a size-cap assertion in the test: lean-index should be <5% the size of the full tf-idf index.

---

### Task 6: Task-aware, lean `/prime`

**Files:**
- Modify: `.claude/commands/prime.md` (full rewrite of sections 4 and 6; add new Section 0 for task-choice prompt)

- [ ] Step 1: Rewrite `.claude/commands/prime.md`
  New flow (abbreviated):
  ```markdown
  # /prime — Context Loader (task-aware, lean)

  ## Step 0: Task Scope

  Ask the user:
  > What's the scope for this session?
  > 1. **Specific GitHub issue** — enter `#<number>`
  > 2. **Task description** — one sentence
  > 3. **No task** — prime with generic project context only

  Wait for answer. Capture keywords for KB search from (1) issue body, (2) description, or (3) default to project name from package.json.

  ## Step 1: Structure + History (unchanged)
  (Parallel: git ls-files head, tree, git log, git status, git branch)

  ## Step 2: Project Docs (lean)
  - CLAUDE.md (full)
  - README.md (full)
  - DO NOT eagerly load docs/plans/PRD.md or feature plans unless the branch/issue matches

  ## Step 3: Active Context
  - If issue # supplied in Step 0: `gh issue view <n>`
  - Look for matching plan file under docs/plans or docs/superpowers/plans
  - If found, read ONLY the "Goal + Architecture + Mandatory Reading" sections — not the full plan

  ## Step 4: Configuration (indexes only)
  - Read `.claude/agents/architect-agent/index.md` (TOC only — do not follow links)
  - Read `.claude/agents/tester-agent/test-patterns.md` (inventory table only)

  ## Step 5: Knowledge Base (LEAN)

  If CLAUDE.md has `## Knowledge Base` with `Path:`:
  1. Read `<kb-path>/_search/lean-index.json` (metadata only — always small)
  2. If task keywords from Step 0:
     - `KB_PATH=<path> node cli/kb-search.js search "<keywords>" --limit=3`
     - Display top-3 with their lean summaries
     - DO NOT read full article bodies. Agent loads full bodies on demand when a task actually references them.
  3. If no task: display lean-index grouped by type. Do not load any bodies.

  ## Output: the summary panel (unchanged shape, with addition)

  Add row: "Task scope: <issue # | description | none>"
  Add row: "KB loaded: lean-index (N docs) + 0-3 summaries"
  ```

- [ ] Step 2: Verification (manual — no unit tests for markdown commands)
  Invoke `/prime` in a test session; verify it asks the scope question before loading anything heavy.

- [ ] Step 3: Commit
  ```bash
  git add .claude/commands/prime.md
  git commit -m "refactor(prime): task-aware scope prompt + lean KB loading (no full-body reads)"
  ```

**GOTCHA:** Do not break existing behavior for users who run `/prime` with no KB configured — the lean-index read must be skipped silently, not error.

---

### Task 7: `/evolve` anti-bloat + KB-first

**Files:**
- Modify: `.claude/commands/evolve.md` (Step 2, Step 4, Step 5 rewrites + new Step 2.5 token-budget check)

- [ ] Step 1: Rewrite `/evolve` steps
  ```markdown
  ### Step 2: Capture Learnings (KB-first)
  Every session learning — even "update CLAUDE.md" style — starts in the wiki:
  1. For each learning, create `<kb-path>/raw/sessions/YYYY-MM-DD-<topic>.md` (raw notes)
  2. Create stub wiki article (type: session-learning) in `<kb-path>/wiki/`
  3. Update `raw/_manifest.md` (status: pending) and `wiki/_index.md`

  ### Step 2.5: Token-Budget Check
  For every file in `.claude/rules/` and `CLAUDE.md`:
  - If file exceeds 200 lines: extract overflow into a reference file (`.claude/references/<domain>-detail.md`) or into the wiki
  - Replace extracted content in the rule with a pointer in the `## References` block
  - Target after extraction: rule files <150 lines, CLAUDE.md <300 lines

  ### Step 3: Architect KB (unchanged structure)

  ### Step 4: Update Rules (pointers only)
  Rules get NO new prose. For each new convention:
  1. Write the detail to the wiki (or the paired `*-detail.md` reference)
  2. Add a single bullet in the rule's Conventions block OR a new entry in the References block
  3. If a rule has no place for the pointer, create the paired detail file first

  ### Step 5: Update CLAUDE.md (pointers only)
  Same policy — detail goes to wiki, CLAUDE.md only references.
  Invoke `revise-claude-md` skill with explicit instruction: "pointer updates only; reject content additions over 3 lines."

  ### Step 6: Update Code Patterns (unchanged)

  ### Step 7: Health Report
  Report:
  - Learnings captured: N (raw + stubs)
  - Rule-file overflow extractions: N (with before/after line counts)
  - CLAUDE.md before/after line count
  - Pending stubs awaiting /kb compile
  ```

- [ ] Step 2: Verify
  Manually confirm the rewritten evolve.md parses (preview in markdown reader); check that Step 2.5 references exact target paths.

- [ ] Step 3: Commit
  ```bash
  git add .claude/commands/evolve.md
  git commit -m "refactor(evolve): KB-first learning capture + rule/CLAUDE.md token-budget guardrail"
  ```

**GOTCHA:** The `revise-claude-md` skill may not honor "pointer updates only" instruction automatically — the /evolve command must post-process the skill's output and reject additions >3 lines.

---

### Task 8: New `/merge-configs` command

**Files:**
- Create: `.claude/commands/merge-configs.md`
- Create: `.claude/references/merge-strategy.md` (single source of truth for merge rules — shared with /start Step 0)
- Modify: `.claude/commands/start.md` (Step 0 delegates to `/merge-configs`)

- [ ] Step 1: Write `.claude/references/merge-strategy.md`
  Extract the full table from CLAUDE.md `## Post-Init Merge` + `/start` Step 0 into one canonical reference:
  ```markdown
  # Config Merge Strategy

  ## File Categories

  | Category | Files | Strategy |
  |----------|-------|----------|
  | CLAUDE.md | Project root | Section-preserving merge (preserve user sections, update framework sections) |
  | Rules | `.claude/rules/*.md` | Append user additions; dedupe |
  | Commands | `.claude/commands/*.md` | Diff vs previous framework version; user-edited → prompt; unchanged → discard backup |
  | References — project-specific | `.claude/references/code-patterns.md` | Always restore from backup |
  | References — templates | `.claude/references/*.md` (other) | Keep framework version |
  | Agents — project KB | `.claude/agents/architect-agent/**` | Always restore from backup |
  | Agents — test patterns | `.claude/agents/tester-agent/**`, `mobile-tester-agent/**` | Always restore from backup |
  | KB content | `<kb-path>/**` | Always restore from backup |
  | Hooks | `.claude/hooks/*.sh` | User-edited → prompt; unchanged → discard |
  | Settings | `.claude/settings.local.json` | Deep JSON merge (user wins on conflict, framework adds new keys) |

  ## Process
  For each `.backup` file found:
  1. Categorize using the table above
  2. Compute merge plan for the category
  3. Present plan to user; await approval
  4. Apply merge
  5. Delete `.backup`

  ## Detection sources
  - `.claude/.init-meta.json` — presence indicates post-init merge pending
  - User-invoked via `/merge-configs` — scans for any `.backup` files plus optionally a user-supplied directory
  ```

- [ ] Step 2: Write `.claude/commands/merge-configs.md`
  ```markdown
  # /merge-configs — Merge Existing Config with Framework

  Usable any time: post-init, after manual framework upgrade, after repo merge, or when adopting the framework mid-project.

  ## Arguments
  - `$ARGUMENTS` — optional path to a user config directory to merge (defaults to scanning current repo for `.backup` files and `.claude/.init-meta.json`)

  ## Process

  ### Step 1: Discover
  1. Check for `.claude/.init-meta.json` (post-init marker)
  2. Find all `*.backup` files under the repo
  3. If `$ARGUMENTS` provided: also scan that directory for `CLAUDE.md`, `.claude/**`, `.obsidian/**`

  If nothing found: exit with "No config to merge."

  ### Step 2: Categorize
  Load `.claude/references/merge-strategy.md`. For every discovered file, assign a category.

  ### Step 3: Plan
  Present a per-file plan to the user grouped by category (CLAUDE.md, Rules, Commands, References, Agents, KB, Hooks, Settings). For each entry: show the strategy to apply and a diff preview for merge-requiring cases.

  ### Step 4: Execute (per-file approval)
  For each file in the plan:
  1. Show the file + strategy
  2. Ask: apply / skip / show full diff / edit
  3. Apply on approval; track applied/skipped counts

  ### Step 5: Cleanup
  - Delete all `.backup` files that were processed
  - Delete `.claude/.init-meta.json` if present
  - Report: N merged, N restored, N skipped

  ## Delegation
  `/start` Step 0 delegates to this command when `.init-meta.json` is found. No logic is duplicated.
  ```

- [ ] Step 3: Refactor `.claude/commands/start.md` Step 0
  Replace the entire inline Step 0 block (lines 5–46) with:
  ```markdown
  ## Step 0: Check for Pending Merge

  If `.claude/.init-meta.json` exists, invoke `/merge-configs` and wait for it to complete before continuing to Step 1. The merge command owns all merge logic; see `.claude/references/merge-strategy.md` for the rules.
  ```

- [ ] Step 4: Manual verification
  Create a dummy `.claude/.init-meta.json` + a dummy `CLAUDE.md.backup` in a throwaway directory; invoke `/merge-configs` (simulated) and walk the flow.

- [ ] Step 5: Commit
  ```bash
  git add .claude/commands/merge-configs.md .claude/references/merge-strategy.md .claude/commands/start.md
  git commit -m "feat(commands): add /merge-configs; /start Step 0 delegates to it"
  ```

**GOTCHA:** The settings.json deep-merge is the trickiest category. For now, implement conservatively: present the JSON diff to the user and ask "keep user / keep framework / manual edit" — don't attempt automatic deep merge of arrays (order matters for hooks).

---

### Task 9: Caveman-style user-facing output compaction hook

**Files:**
- Create: `.claude/hooks/output-compact.sh` (Stop hook — compacts final user-facing text)
- Create: `.claude/references/output-compaction.md` (rules: what to compact, what to preserve)
- Modify: `.claude/settings.local.json` (register Stop hook)
- Modify: `.claude/hooks/session-primer.sh` (mark primer output as no-compact so it stays full)

- [ ] Step 1: Write `.claude/references/output-compaction.md`
  ```markdown
  # Output Compaction Rules (Caveman-style)

  ## Goal
  Reduce user-facing assistant output tokens while preserving all semantic meaning. Applies ONLY to agent→user text, never agent↔agent payloads.

  ## PRESERVE (do not compact)
  - Fenced code blocks (```lang ... ```)
  - File paths with line numbers (`foo.ts:42`)
  - Numeric data, dates, IDs, URLs
  - Headings, lists, tables
  - Text inside inline code backticks
  - Multi-sentence reasoning the user explicitly asked for

  ## COMPACT
  - Hedging: "it seems", "I think", "I believe" → drop
  - Redundant politeness: "Great!", "Absolutely!", "Of course" → drop
  - Filler: "as you can see", "essentially", "basically" → drop
  - Repetition of user's prompt back at them → drop
  - Verbose acknowledgments: "I'll now do X as you asked" → "Doing X"
  - Passive voice → active

  ## OFF-LIMITS
  - Error messages (must remain exact)
  - Security/warning text
  - Anything marked with HTML comment `<!-- no-compact -->`
  ```

- [ ] Step 2: Write `.claude/hooks/output-compact.sh`
  Stop hook: receives final assistant message on stdin; applies a conservative sed/awk pass over non-code, non-table, non-path text; writes compacted version to stdout.
  ```bash
  #!/usr/bin/env bash
  # Stop hook — compact user-facing final message
  set -euo pipefail

  # Respect opt-out: if CLAUDE.md has "## Output Compaction" with "off", pass through
  if [ -f CLAUDE.md ] && awk '/^## Output Compaction/,/^## /' CLAUDE.md | grep -qi 'off'; then
    cat; exit 0
  fi
  # Or .claude/settings.local.json env
  if [ "${CLAUDE_OUTPUT_COMPACT:-on}" = "off" ]; then cat; exit 0; fi

  # Conservative compaction: only touch non-fenced prose
  awk '
    BEGIN { in_fence=0 }
    /^```/ { in_fence = !in_fence; print; next }
    in_fence { print; next }
    /^\|/ { print; next }       # tables
    /^\s*[-*0-9]+\./ { print; next }  # lists
    { gsub(/\b(It seems|I think|I believe|Essentially|Basically|As you can see)[, ]*/, "")
      gsub(/\b(Great|Absolutely|Of course|Certainly)!\s*/, "")
      print }
  '
  ```

- [ ] Step 3: Register hook in `.claude/settings.local.json`
  Add under `hooks.Stop`:
  ```json
  { "hooks": [{ "type": "command", "command": ".claude/hooks/output-compact.sh" }] }
  ```

- [ ] Step 4: Mark primer output as no-compact
  Edit `.claude/hooks/session-primer.sh` to emit `<!-- no-compact -->` at the top of its output; update `output-compact.sh` to pass through the whole input if that marker is present on any line.

- [ ] Step 5: Verify
  Run: `echo "Great! I think we should definitely proceed. As you can see, the file is here:
  \`\`\`js
  const x = 1;
  \`\`\`" | bash .claude/hooks/output-compact.sh`
  Expected: hedging/politeness words stripped; fenced code block intact.

- [ ] Step 6: Commit
  ```bash
  git add .claude/hooks/output-compact.sh .claude/references/output-compaction.md .claude/settings.local.json .claude/hooks/session-primer.sh
  git commit -m "feat(hooks): add caveman-style user-facing output compaction (code/tables preserved)"
  ```

**GOTCHA:** Claude Code's Stop hook passes JSON on stdin in some harness versions, plain text in others. Detect and handle both — if stdin is JSON, extract the assistant text field, compact, re-wrap.

---

### Task 10: Caveman toggle (user control)

**Files:**
- Modify: `CLAUDE.md` (add `## Output Compaction` section, default `on`)
- Modify: `.claude/references/claude-md-template.md` (include the section in scaffolded CLAUDE.md)
- Modify: `.claude/hooks/output-compact.sh` (already reads the toggle in Task 9 Step 2 — verify path)

- [ ] Step 1: Update `CLAUDE.md`
  Add at a top-level section:
  ```markdown
  ## Output Compaction

  State: on

  Controls the `.claude/hooks/output-compact.sh` Stop hook. Set to `off` to disable user-facing output compaction. Does not affect agent-to-agent communication.

  Override per-session: `CLAUDE_OUTPUT_COMPACT=off` env var.
  ```

- [ ] Step 2: Mirror the section in `.claude/references/claude-md-template.md` so new projects get it on init.

- [ ] Step 3: Verify toggle
  - Set `## Output Compaction` state to `off` in CLAUDE.md → pipe test input through hook → no compaction happens
  - Set back to `on` → compaction resumes

- [ ] Step 4: Commit
  ```bash
  git add CLAUDE.md .claude/references/claude-md-template.md
  git commit -m "feat(compaction): user toggle via CLAUDE.md '## Output Compaction' section"
  ```

**GOTCHA:** The awk-based `awk '/^## Output Compaction/,/^## /'` range match will fail if `## Output Compaction` is the last top-level section. Use a block-parser that tolerates EOF instead, or require a trailing section.

---

### Task 11: Anti-AI-slop research pass (firecrawl)

**Files:**
- Create: `.claude/references/frontend-antislop-patterns.md`
- Create: `<kb-path>/raw/articles/2026-04-22-ai-slop-design-research.md` (if KB configured)

- [ ] Step 1: Dispatch a research subagent using the firecrawl MCP
  Sources to crawl (seed list — reviewer may add more):
  - Refactoring UI blog (common critique of AI layouts)
  - Linear, Stripe, Vercel design-system posts (exemplars)
  - Brad Frost on "AI slop" in design
  - Twitter/X threads on telltale AI-generated sites (search "AI slop UI")
  - "Default shadcn glow" critiques
  - Color theory posts on overused purple/blue gradients

  Subagent task: produce a catalogue with this shape —
  ```markdown
  # Frontend Anti-AI-Slop Patterns

  ## Typography Defaults to Avoid
  - Inter everywhere (esp. Inter for body + Inter for headings)
  - Default system-ui stack as the only fallback
  - Alternative: pair a display face (Fraunces, Instrument Serif, GT Sectra) with a neutral body (IBM Plex Sans, General Sans, Söhne)

  ## Color Palette Anti-Patterns
  - Purple→blue gradients (`from-purple-500 to-blue-500`)
  - Neon glow halos on every card
  - "Pastel everything" (washed-out, low-contrast)
  - Alternative: one accent color + neutrals + deliberate contrast tiers

  ## Layout Anti-Patterns
  - Identical bento grids on every landing page
  - Hero: oversized gradient text + subdued subhead + CTA → repeat forever
  - "Three-column feature icons" below the fold
  - Alternative: composition driven by content, not templates

  ## Component Anti-Patterns
  - Default shadcn card + glow + gradient border
  - Emoji-in-button ("🚀 Get Started")
  - "✨ AI-powered" copy anywhere
  - Dot-grid background + radial fade
  - Alternative: custom borders, purposeful motion, content-first copy

  ## Motion Anti-Patterns
  - Marquee logos
  - Scroll-triggered fade-in on every section
  - Alternative: motion with purpose, reduced-motion respected

  ## References (sources)
  - (cite each crawled source with URL + date)
  ```

- [ ] Step 2: Save the crawl raw output to `<kb-path>/raw/articles/2026-04-22-ai-slop-design-research.md` if KB is configured; add to `raw/_manifest.md`.

- [ ] Step 3: Save the synthesized catalogue to `.claude/references/frontend-antislop-patterns.md`.

- [ ] Step 4: Commit
  ```bash
  git add .claude/references/frontend-antislop-patterns.md
  # if KB present:
  # git add <kb-path>/raw/articles/2026-04-22-ai-slop-design-research.md <kb-path>/raw/_manifest.md
  git commit -m "docs(frontend): add anti-AI-slop patterns catalogue (firecrawl research)"
  ```

**GOTCHA:** The research output must cite sources — anti-slop recommendations are opinionated, and the reference needs provenance or it becomes our own slop.

---

### Task 12: Anti-AI-slop rule + design-gate + /validate integration

**Files:**
- Create: `.claude/rules/frontend-antislop.md`
- Modify: `.claude/rules/frontend.md` (link to antislop)
- Modify: `.claude/commands/validate.md` (visual pass: load antislop checklist when UI files changed)

- [ ] Step 1: Write `.claude/rules/frontend-antislop.md`
  ```markdown
  # Frontend Anti-AI-Slop Rules

  Triggered alongside `.claude/rules/frontend.md` for any UI change.

  ## Skill Chain
  1. Load catalogue: `.claude/references/frontend-antislop-patterns.md`
  2. Load design skill (from frontend.md gate)
  3. Cross-check component choices against the catalogue
  4. tester-agent visual verify (antislop checklist mode)

  ## Conventions
  - No Inter-everywhere typography; pair display + body face deliberately
  - No purple→blue gradient defaults
  - No emoji in primary CTAs
  - No "✨ AI-powered" or equivalent copy
  - Custom card borders — not default shadcn glow
  - Motion has a purpose; honor `prefers-reduced-motion`

  ## Checklist
  - [ ] Typography pairing is intentional (not Inter/Inter)
  - [ ] Color system is not default Tailwind gradient
  - [ ] Components diverge from default shadcn look
  - [ ] No AI-themed filler copy
  - [ ] Motion is purposeful and respects reduced-motion

  ## References
  - `.claude/references/frontend-antislop-patterns.md` — full pattern catalogue with alternatives
  ```

- [ ] Step 2: Link from `.claude/rules/frontend.md`
  Add to References block:
  - `.claude/rules/frontend-antislop.md` — load for every UI change

- [ ] Step 3: Update `.claude/commands/validate.md` visual pass
  Add checklist: when UI files changed (detected via `git diff --name-only` containing `.tsx`/`.jsx`/`.vue`/`.css` etc.), the visual verification step must invoke `tester-agent` with antislop checklist loaded; agent screenshots + flags any match against the catalogue.

- [ ] Step 4: Commit
  ```bash
  git add .claude/rules/frontend-antislop.md .claude/rules/frontend.md .claude/commands/validate.md
  git commit -m "feat(frontend): enforced anti-AI-slop rule wired into design gate + /validate"
  ```

**GOTCHA:** An anti-slop rule is inherently subjective — keep the checklist narrow and catalogue-backed. If the rule is too aggressive it'll be disabled; too loose it's decorative.

---

### Task 13: Release notes + changelog

**Files:**
- Create: `docs/changelog/v0.4.md`
- Modify: `package.json` (bump version to `0.4.0`)

- [ ] Step 1: Write `docs/changelog/v0.4.md`
  ```markdown
  # v0.4.0 — PIV+E hardening batch

  ## New
  - `/merge-configs` command — merge existing user config with framework anytime
  - Caveman-style output compaction (user-toggleable) via Stop hook
  - Anti-AI-slop frontend rule with research-backed pattern catalogue
  - CLI `kb-search`: `--limit`, `--help`, validated flags; new `lean-index` command

  ## Changed
  - `/execute` mandatorily dispatches a spec-reviewer after every implementer task
  - `/prime` is now task-aware and loads lean KB indexes only (no full-body reads)
  - `/evolve` captures learnings in the wiki first; rules/CLAUDE.md get pointer-only updates
  - All domain rules converted to thin-pointer shape with on-demand references
  - KB workflow aligned with Karpathy's pattern (Web Clipper, health-check lint pass)

  ## Fixed (CLI)
  - Symlink traversal in `backupAndCopy` (P0)
  - Non-atomic `index.json` writes (P0)
  - Corrupted index.json silently looping (P0)
  - tmpDir collision from `Date.now()` (P0)
  - CLAUDE.md copy not atomic (P1)
  - Empty query / empty `--type=` silently accepted (P1)
  - Git-init failure not fatal (P1)
  - UTF-8 encoding missing on some reads (P2)

  ## Migration
  Existing installs: run `npx ai-development-framework update` then `/merge-configs` to reconcile.
  ```

- [ ] Step 2: Bump `package.json` version to `0.4.0`

- [ ] Step 3: Commit
  ```bash
  git add docs/changelog/v0.4.md package.json
  git commit -m "chore: release v0.4.0 — PIV+E hardening batch"
  ```

---

## Acceptance Criteria

- [ ] **#1 Spec-reviewer enforcement:** /execute dispatches spec-reviewer after every implementer task; hook blocks completion when reviewer is missing
- [ ] **#2 /evolve anti-bloat:** rule files stay <150 lines after /evolve; overflow extracted to references/wiki
- [ ] **#3 Task-aware lean /prime:** /prime prompts for issue/task/none and loads only lean-index + top-3 summaries
- [ ] **#4 Karpathy KB workflow:** lean-index generator, kb-compile health-check pass, Web Clipper guidance all in place
- [ ] **#5 /merge-configs:** command exists standalone; /start Step 0 delegates to it
- [ ] **#6 Caveman compaction:** Stop hook compacts user-facing output; code/tables/paths preserved
- [ ] **#7 Caveman toggle:** `## Output Compaction: off` in CLAUDE.md disables hook; env override works
- [ ] **#8 Anti-AI-slop:** rule file exists + research-backed catalogue + /validate integration + design-gate link
- [ ] **#9 Thin rules:** every domain rule has `## References` block; detail moved to references/wiki
- [ ] **#10 CLI hardening:** all P0 bugs fixed with regression tests; P1 validations in place
- [ ] All existing tests still pass: `npm test`
- [ ] Version bumped to 0.4.0; changelog present

---

## GOTCHA Warnings

- **GOTCHA (all tasks):** The rules-restructure task moves large chunks of content around. Use `git diff --stat` per-commit to verify net content preserved; never drop sections silently.
- **GOTCHA (Task 1):** `fs.lstatSync` on Windows + junction points behaves differently than on Unix — test on both or document Unix-only support.
- **GOTCHA (Task 3):** The spec-reviewer enforce hook depends on session transcript format; if Claude Code changes the transcript schema, the hook will silently no-op. Add a self-test that checks the schema on hook load.
- **GOTCHA (Task 5):** Lean-index generator parses frontmatter — YAML errors must not crash the build. Wrap per-file parsing in try/catch; skip malformed with a warning.
- **GOTCHA (Task 6):** The prompt in Step 0 of /prime is interactive. If /prime is invoked non-interactively (scripted), default to "no task" behavior.
- **GOTCHA (Task 9):** The output-compaction hook must not break when the assistant emits Markdown tables or ASCII diagrams. Add golden-file tests.
- **GOTCHA (Task 12):** /validate visual pass requires a running dev server + browser context for tester-agent. If UI change is backend-only (e.g., SSR API route), skip visual pass.
- **GOTCHA (general):** Spec-reviewer dispatch enforcement (Task 3) applies from Task 3 onward. For Tasks 1–2, the operator dispatches the reviewer manually before committing.

---

## Execution Order (recommended)

1. Task 1 (CLI P0) — isolated, quick wins, low risk
2. Task 2 (CLI P1/P2) — continues from Task 1
3. Task 3 (spec-reviewer enforcement) — lands before bulk restructuring so reviewer catches issues in remaining tasks
4. Task 4 (rules → thin pointers) — enables the token-economy cluster
5. Task 5 (KB Karpathy + lean-index) — provides the lean data for Task 6
6. Task 6 (/prime lean + task-aware)
7. Task 7 (/evolve anti-bloat)
8. Task 8 (/merge-configs) — depends on merge-strategy reference
9. Task 9 (caveman compaction)
10. Task 10 (caveman toggle)
11. Task 11 (antislop research — firecrawl)
12. Task 12 (antislop rule integration)
13. Task 13 (changelog + version bump)

Recommended context resets: after Task 3, after Task 7, before Task 11.
