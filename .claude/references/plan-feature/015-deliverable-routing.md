# /plan-feature — Phase 1.5: Deliverable-Type Routing (ask, don't guess)

Decides whether the feature is **production code**, a **design artifact**, or a **hybrid**. Do not silently keyword-match — load the canonical script and follow it.

**Reference:** `.claude/references/design-clarifying-script.md` — the canonical question script + routing matrix. Both `/start` and `/plan-feature` use this single source of truth.

## Process

1. **Detect project state** (parallel):
   - Fresh project (no `*.tsx` / `*.jsx` / `*.vue` / `*.svelte` and no `package.json`) → route directly to `/brand-extract` Direction Advisor; do NOT run this phase.
   - In-dev project (has UI files) → continue.

2. **Decide whether to ask** by checking "When the script runs":
   - **Skip** when intent is unambiguous: explicit `mockup`/`prototype`/`deck`/`slide`/`infographic`/`pitch`/`motion graphic` → design; explicit `bug fix`/`typo`/`endpoint`/`migration` or specific code-only issue → production.
   - **Run the script** otherwise.

3. **Run the 3-question script** verbatim. Send all three questions in one message; wait for all answers.

4. **Apply the routing matrix** to deterministically map answers → plan branch.

5. **Write the plan with frontmatter:**

   ```yaml
   ---
   branch: design-artifact   # or production-code, or hybrid
   q1: b                      # answers (omit if script was skipped)
   q2: a
   q3: a
   brand_spec: bootstrap     # or use-as-is, skip, or n/a
   ---
   ```

## Per-branch plan shapes

- **`production-code`** → continue to Phase 2.
- **`design-artifact`** → single-task plan dispatching huashu-design. Pre-step: verify `.design-system/brand-spec.md` per chosen `brand_spec` mode (bootstrap = `/brand-extract` as Task 0; use-as-is = `/brand-extract --mode=codify-as-is`; skip = inline constraints only). Validation: `/validate` Phase 2.5 (5D Visual Critique). Skip the "tests before implementation" requirement — replace with tester-agent VERIFY screenshot + antislop checklist + 5D Critique.
- **`hybrid`** → emit two plans: (1) design-artifact first, (2) production-code consuming the handoff bundle. The `bundle.json` is the contract.

**Anti-pattern guard:** if you reach for a keyword list to decide, you're in script territory — ask. The script exists because keyword classifiers misroute "build a settings panel mockup that turns into a real component."
