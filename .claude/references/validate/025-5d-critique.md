# /validate — Phase 2.5: 5D Visual Critique

**Load condition:** changeset includes files under `design/<slug>/` (preview.html, motion MP4/GIF, slide decks, infographics, mockups). Skip entirely for production-code-only changes.

Backported from huashu-design's expert-critique pattern, with **blocking vs. advisory** split.

| Dimension | What to score | Status |
|---|---|---|
| **2. Visual hierarchy** | Can you tell what's primary, secondary, tertiary in 2 seconds? Slop hallmark: every element shouts at the same volume. | **BLOCKING (≥7/10)** |
| **4. Functionality** | Does it solve the actual brief? Discoverable goals? Does the click flow work end-to-end? | **BLOCKING (≥7/10)** |
| **1. Philosophical coherence** | Single, identifiable point of view? Or mash-up of references? | Advisory |
| **3. Execution craft** | Spacing rhythm consistent? Typography intentional? Borders/shadows/radii varied by component role? | Advisory |
| **5. Innovation** | At least one moment that doesn't look like training-data median? | Advisory |

**Why split:** the same model that produced the artifact also scores it; numeric LLM judgments are self-correlated. Hierarchy + Functionality have operationalizable definitions. Philosophy/Execution/Innovation are taste calls — useful as feedback, dangerous as ship gates.

## Process

1. Dispatch a critique subagent with `MODE=visual-critique` (**model: `opus`** — Tier 5, never downgrade reviewers), passing:
   - Artifact path(s) under `design/<slug>/`
   - `.design-system/brand-spec.md` (if present)
   - `.claude/references/frontend-antislop-patterns.md`
   - Deliverable type from plan frontmatter (`internal-tool` / `external-marketing` / `pitch-deck`)

2. Subagent screenshots each artifact at desktop + mobile, scores each dimension.

3. Subagent returns radar-shaped report:

   ```
   === 5D Visual Critique ===

   [BLOCKING]
   Visual hierarchy:         N/10  — [rationale]
   Functionality:            N/10  — [rationale]

   [ADVISORY]
   Philosophical coherence:  N/10  — [rationale]
   Execution craft:          N/10  — [rationale]
   Innovation:               N/10  — [rationale]

   Keep:        [what works — preserve in revisions]
   Fix:         [what's blocking — must address before ship]
   Quick wins:  [high-leverage tweaks]

   Verdict: PASS (Hierarchy ≥7 AND Functionality ≥7) / FAIL — [which axis]
   ```

4. **Verdict handling:**
   - **PASS** → record advisory scores in `design/<slug>/_critique.md`; proceed.
   - **FAIL** on a blocking axis → do not proceed. Iterate (re-dispatch huashu-design with the fix list) or accept with explicit user override.
   - Advisory scores **never block**, but if any advisory axis is ≤4, surface it loudly.

**Override:** `/validate --skip-visual-critique` or user says `override: ship anyway` → log in `_critique.md` with timestamp + reason; proceed.
