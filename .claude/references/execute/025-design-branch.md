# /execute — Step 2.5: Design-Artifact Branch

**Load condition:** plan frontmatter `branch: design-artifact` or `branch: hybrid`. Skip entirely on `production-code`.

If frontmatter is missing or malformed → blocker. Ask user to re-run `/plan-feature` so the routing decision is recorded. Do NOT silently keyword-classify here — that's `/plan-feature`'s job.

## 2.5a — License acknowledgement (first dispatch per repo)

huashu-design is **non-commercial-by-default**. Personal/research/learning use is free; commercial / client-deliverable / enterprise / paid-service use requires authorization from the author (see `https://github.com/alchaincyf/huashu-design#license--usage-rights`).

1. Check `.design-system/.huashu-license-ack`. If present → skip to 2.5b.
2. If absent, print verbatim:

   ```
   This step will dispatch the huashu-design skill (alchaincyf/huashu-design).

   License — personal use is free; commercial/client/enterprise use requires
   authorization from the author. Full terms:
   https://github.com/alchaincyf/huashu-design#license--usage-rights

   Confirm one of:
     - "personal" — personal/research/learning use; no commercial intent
     - "commercial-acked" — commercial use; you have obtained or will obtain authorization
     - "skip" — abort this run
   ```

3. On `personal` or `commercial-acked` → write the ack file:

   ```bash
   mkdir -p .design-system
   printf 'mode: %s\nacked_at: %s\nfirst_dispatch_commit: %s\n' \
     "<user-response>" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$(git rev-parse HEAD 2>/dev/null || echo 'no-commit')" \
     > .design-system/.huashu-license-ack
   ```

4. On `skip` → abort 2.5; ask the user how to proceed. Do not auto-fall-through.
5. Stage the ack file so it commits with the design output.

## 2.5b — Pre-flight + dispatch

1. **Skill check:** `ls ~/.claude/skills/huashu-design/SKILL.md`. Missing → blocker: "Run `npx skills add alchaincyf/huashu-design`."
2. **Version-pin check:** read `.claude/.versions.json` → `external_skills.huashu-design.skill_md_sha256`. If non-empty, hash the installed `SKILL.md` and compare. Mismatch → warn that the skill drifted; brand-spec.md schema may have changed; ask whether to proceed.
3. **Brand-spec check** (driven by plan's `brand_spec` frontmatter):
   - `bootstrap` → if `.design-system/brand-spec.md` missing, dispatch `/brand-extract` as Task 0.
   - `use-as-is` → dispatch `/brand-extract --mode=codify-as-is` as Task 0.
   - `skip` → no spec written; pass plan's inline constraints to huashu-design directly.
   - `n/a` → existing spec already current per staleness check; reuse.
4. **Staleness check** (when reusing):
   - Spec's `Generated:` ISO date older than 90 days → warn, don't block.
   - `git log --since=<spec-date> -- 'tailwind.config.*' 'app/globals.css' 'src/styles/**' 'components/ui/**'` returns commits → warn that brand-relevant files changed; suggest refresh.
5. **Write design marker:**

   ```bash
   .claude/hooks/spec-reviewer-marker.sh write design
   ```

6. **Dispatch huashu-design** as the single implementation task, passing:
   - The prompt from the plan
   - Path to `.design-system/brand-spec.md` (or inline constraints if `skip`)
   - Output dir: `design/<feature-slug>/`
   - Directive: follow huashu-design's Junior Designer Workflow (placeholders + reasoning early; three iterations: real content → variations → tweaks)

7. After dispatch returns, hand off to `/validate` Phase 2.5 (5D Visual Critique). **Do not** clear the design marker yet — Step 5 (Completion) clears it on full `/execute` success. If aborted mid-flight, run `.claude/hooks/spec-reviewer-marker.sh clear` manually before re-running.

## 2.5c — Hybrid handoff (only on `branch: hybrid`)

Artifact is now under `design/<feature-slug>/`; `bundle.json` exists per huashu-design's handoff format.

1. **Clear design marker:**

   ```bash
   .claude/hooks/spec-reviewer-marker.sh clear
   ```

2. Read the bundle as the spec for the second plan section. Single-file plan → locate `## Code Tasks`. Two-file plan (per `/plan-feature` hybrid output) → pause and tell the user to invoke `/execute` on the second file when ready.
3. Fall through to **Step 3** for code-phase tasks. Marker is clear, so the standard implementer→reviewer pairing applies.
