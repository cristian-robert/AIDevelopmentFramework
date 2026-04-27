# Mimicking Claude Design with Claude Code skills (no AI-slop)

Research date: 2026-04-27
Crawled with `npx firecrawl` → `.firecrawl/`

---

## 1. What Claude Design actually is (canonical)

Released **2026-04-17** at `claude.ai/design`. Powered by **Claude Opus 4.7** vision. Available to Pro/Max/Team/Enterprise (off by default for Enterprise). It is a two-pane web app — chat left, canvas right — for prototypes, mockups, slide decks, microsites, marketing collateral.

### The pipeline (the part worth mimicking)

| Step | What happens |
|---|---|
| **0. Org design system** | A designer points Claude at a codebase, Figma file, slide deck, or brand assets. Claude extracts a reusable **design system** (palette, type scale, spacing grid, components, layout patterns). Published once → every project in that org auto-uses it. Multiple systems per org allowed. Setup is gated by **custom roles**. |
| **1. New project** | Inherits org design system. Add context: screenshots/images, DOCX/PPTX/XLSX, codebase link/zip, web-capture from a public URL. |
| **2. Prompt → first draft** | Plain English prompt with goal, layout, content, audience. Claude renders to canvas. |
| **3. Iterate** | Three modes: **chat** for conceptual/multi-element changes, **inline comments** on a selected element, **direct text edit + sliders** for micro-adjustments. "Apply across the design" propagates a single tweak. |
| **4. Versioning** | "Save what we have and try a different approach" — Claude branches the project. |
| **5. Share** | Org-scoped link: view / comment / edit. Multi-user live edit (multiple cursors, group chat with Claude). No public links. |
| **6. Export** | Zip (raw), PDF, PPTX (real editable slides), Canva (OAuth, layers preserved), standalone HTML. |
| **7. Handoff to Claude Code** | Packages **component tree + applied design-system tokens + assets + spec** into a bundle. User runs `claude "Implement the handoff bundle at <path>"`. Claude Code unpacks, matches the target framework (React, Next.js, SwiftUI, Flutter, Vue), maps tokens to existing variables, opens a diff. Two delivery modes: "send to local coding agent" or "send to Claude Code Web". |

### Stated limitations (Anthropic's own words)

- Not pixel-precise; Figma still wins for production UI.
- Comment persistence is flaky — fall back to chat.
- Codebase ingest works best on token-driven systems (Tailwind config / CSS vars / shadcn). Ad-hoc CSS produces a palette that needs manual review.
- Linking very large repos lags — link a subdirectory, not the monorepo.
- 500 MB zip cap on codebase upload during research preview.
- No audit logs / data residency yet.

### The single load-bearing insight

The whole product hinges on **the design system being extracted before anyone uses the canvas**. The admin guide explicitly says:
> "Turning on Claude Design without a design system in place means your team will get functional but generic output."

That sentence is the entire anti-slop strategy in one line. Generic output ≡ slop. The cure is constraints extracted from a real codebase.

---

## 2. The mimic — three skills, not one

You don't have a canvas. You have something better for engineers: file-based artifacts a coding agent already understands. Build three skills, each maps to one phase of Claude Design's pipeline.

### Skill A — `/design-system-extract`

**Maps to:** Org-onboarding step 0.
**Inputs:** target repo path (default: cwd), optional brand-asset paths (logo SVG, screenshots, an existing site URL).
**Outputs (commit these to the repo):**

```
.design-system/
├── tokens.json        # OKLCH palette, type scale, spacing scale, radii, shadows, motion
├── components.md      # catalog of existing shadcn/Tailwind components + variants found in repo
├── brand.md           # voice, tone, do/don't copy patterns (extracted from existing marketing pages)
└── anti-fingerprints.md  # what THIS project must NOT look like (project-specific slop tells)
```

**Behavior:**
1. Read `tailwind.config.{ts,js}`, CSS variables, `app/globals.css`, `theme.css`.
2. If shadcn detected, parse `components.json` and walk `components/ui/*`.
3. Produce **OKLCH** tokens, not HSL/RGB. Use `culori` or a one-shot conversion in the script. (Reason: stays perceptually stable across light/dark — directly addressed in [impeccable](https://impeccable.style/).)
4. Lint the extracted palette against `.claude/references/frontend-antislop-patterns.md`. If purple→blue gradient defaults are present, flag them in `anti-fingerprints.md` ("we found this pattern; new components must replace it").
5. If no design system exists in the repo, **stop and bootstrap one** with the user — do not invent tokens silently.

**Why this skill matters most:** if extraction is mediocre, every later prototype is generic. This is the equivalent of Anthropic's "do not roll out Claude Design without a design system."

### Skill B — `/design-prototype`

**Maps to:** Steps 1–3 (project + prompt + iterate).
**Inputs:** prompt, optional refs (image/PDF/DOCX/PPTX/URL), `.design-system/` (auto-loaded if present).
**Outputs:**

```
design/<slug>/
├── preview.html       # standalone, self-contained, runs by double-clicking
├── spec.md            # component tree, copy, states, responsive notes, a11y notes
├── refs/              # ingested reference assets
└── iterations/        # numbered snapshots — replaces "save & try a different approach"
```

**Behavior:**
1. **Auto-loads three context layers** (this is the anti-slop spine):
   - `.design-system/tokens.json` (project constraints)
   - `impeccable` skill vocabulary (typography, OKLCH color, spatial, motion, interaction, responsive, UX writing)
   - `.claude/references/frontend-antislop-patterns.md` (negative constraints)
2. Resolves refs: PDFs/PPTX via `pandoc`, URLs via `playwright-cli` or `firecrawl scrape` to grab computed styles + DOM, images via vision pass.
3. Produces a single `preview.html` with **inlined CSS using the project's tokens**. No build step. No Tailwind CDN. Tokens become CSS custom properties.
4. **Pre-write lint**, before saving: grep the generated HTML for `from-purple`, `to-blue`, `from-indigo`, `bg-gradient-to`, `Inter`, `🚀`, `✨`, `AI-powered`, default shadcn class strings copied verbatim. If hits → regenerate with the offending pattern named in the system prompt as forbidden.
5. **Element-scoped iteration:** subsequent invocations accept `--element <selector>` and only regenerate that fragment of the HTML. Replaces the canvas comment workflow with file-based fragment edits.

### Skill C — `/design-handoff`

**Maps to:** Step 7 (handoff to Claude Code).
**Inputs:** `design/<slug>/`.
**Outputs:**

```
design/<slug>/bundle.json
design/<slug>/HANDOFF.md   # human-readable spec for review
```

**`bundle.json` schema (commit this; it's the contract):**

```json
{
  "version": 1,
  "framework": "next-app-router",
  "stylingSystem": { "kind": "tailwind+shadcn", "tokensFile": "src/styles/tokens.css" },
  "tokens": "./.design-system/tokens.json",
  "components": [
    {
      "name": "Hero",
      "targetFile": "app/(marketing)/page.tsx",
      "tree": "<section data-slot='hero'>…</section>",
      "props": [],
      "states": ["default"],
      "a11y": { "landmarks": ["main"], "minContrast": "AA" }
    }
  ],
  "assets": ["./refs/logo.svg"],
  "conventions": {
    "imports": "named-only",
    "naming": "kebab-file, pascal-component",
    "noClientByDefault": true
  },
  "antiFingerprints": "./.design-system/anti-fingerprints.md"
}
```

**Closing the loop:** `/design-handoff` doesn't do the implementation. It hands `bundle.json` to your existing `/execute` (or directly to a subagent), then chains into `/validate` (Phase 5 = code review) and `impeccable`'s `/audit` + `/critique` for visual quality. Two review layers, deterministic.

---

## 3. Anti-AI-slop strategy — three layers, not one prompt

This is the part that determines whether the mimic produces Linear-quality work or "every AI website looks the same." A single anti-slop prompt is not enough; you need it baked into three places.

### Layer 1 — Vocabulary injection (positive constraint)

`impeccable` is already loaded in your environment. It is precisely a vocabulary layer: 7 reference files (typography, OKLCH color, spatial, motion, interaction, responsive, UX writing) + 17 slash commands. **Tessl benchmarks: 1.59× over baseline, OKLCH usage 0/12 → 12/12.** The capability gap was never the model — it was the prompt vocabulary. `/design-prototype` should auto-load it.

### Layer 2 — Negative constraints (anti-fingerprints)

Already documented in your repo at `.claude/references/frontend-antislop-patterns.md`. The catalogue is research-backed: Inter-everywhere, purple→blue gradients, glassmorphism in pastel voids, "Cardocalypse," 0.1-opacity shadows, marquee logos, scroll-fade-on-everything, emoji-in-CTAs, "AI-powered" copy. **Grep these in pre-write lint.** Negative constraints break the default trajectory; the Bakaus essay's claim is that this is what counteracts training-data bias more than positive guidance.

### Layer 3 — Project-specific anti-fingerprints

Generic anti-slop is necessary but not sufficient — every project has a *specific* version of generic. `/design-system-extract` writes `.design-system/anti-fingerprints.md` from what it actually finds: "this project already has Inter + indigo gradients in marketing — new work must NOT reproduce them; instead use the OKLCH neutrals defined in tokens.json." That converts "don't be slop" from an abstraction to a project-grounded checklist.

### Verification at end-of-task

- `tester-agent VERIFY` against the antislop checklist (already wired in `frontend-antislop.md` rule).
- `impeccable /audit` for accessibility/performance issues (Bakaus reports it caught 18 issues on his own blog in one pass).
- `impeccable /critique` for design-quality scoring.

---

## 4. What you can't replicate (and what to do instead)

| Claude Design feature | Why it doesn't map | Replacement |
|---|---|---|
| Two-pane live canvas | Terminal-first | `preview.html` opened in browser; iterations as numbered files |
| Sliders for live tweaks | No GUI | Named adjustments in chat ("tighten card padding to the 8px grid"). Everything Claude Design's "apply across the deck" does is just a regenerate prompt. |
| Canva export | OAuth product integration | Skip; Canva isn't an engineer's target |
| PPTX with editable slides | Heavy pandoc + template | Use Reveal.js export or Marp for slide-shaped output; PPTX only if a stakeholder demands it |
| PDF | Doable | Headless Chrome over `preview.html` |
| Org-scoped sharing + multi-cursor | No multiplayer | Git branches + PR preview deploys |
| Web capture tool | Doable | `firecrawl scrape` or `playwright-cli` already in your stack |
| Inline comment-on-element | No DOM picker | `/design-prototype --element <selector>` regenerates that fragment only |

The honest assessment from Sagnik's deep-dive applies here too: the value of Claude Design is **compressing blank-page-to-first-draft from hours to minutes**. That value comes 80% from the design-system extraction and the handoff bundle, not the canvas. Both are file-based and fully replicable in Claude Code.

---

## 5. Build sequence

1. **Week 1** — `/design-system-extract` against this repo. If it reads your existing tokens (or correctly says "you don't have a design system yet, let's bootstrap"), it works. This is the load-bearing skill; if it's mediocre everything downstream is slop.
2. **Week 2** — `/design-prototype` with auto-load of `impeccable` + `anti-fingerprints.md` + pre-write lint. Validate by generating a marketing page for this framework itself and grepping for the slop-fingerprint terms.
3. **Week 3** — `/design-handoff` schema + `bundle.json`. Wire it into `/execute` so a single command produces a real PR.
4. **Polish** — Reveal.js / Marp for slide output, PDF via headless Chrome, `playwright-cli` web-capture wrapper.

The framework you've built (PIV+E, /prime, /execute, /validate, /ship, KB, anti-slop rules) already has all the connective tissue. These three skills slot in cleanly without re-architecting anything.

---

## Sources (full content cached in `.firecrawl/`)

### Canonical / Anthropic
- [Introducing Claude Design by Anthropic Labs](https://www.anthropic.com/news/claude-design-anthropic-labs) — official launch (2026-04-17)
- [Get started with Claude Design — Help Center](https://support.claude.com/en/articles/14604416-get-started-with-claude-design) — flow, prompts, iteration modes, exports, known limitations
- [Set up your design system in Claude Design — Help Center](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design) — extraction inputs, outputs, publication
- [Claude Design admin guide — Help Center](https://support.claude.com/en/articles/14604406-claude-design-admin-guide-for-team-and-enterprise-plans) — rollout phases, RBAC, "design system first" rule

### Deep-dive third party
- [How to Use Claude Design (Sagnik Bhattacharya, 2026-04-21)](https://sagnikbhattacharya.com/blog/claude-design) — most technical walkthrough; canvas zones, three editing modes, troubleshooting, prompt patterns, vs Figma/Canva, exact handoff command syntax

### Anti-AI-slop methodology
- [Impeccable: The Design Vocabulary AI Was Missing (paddo.dev, 2026-03-13)](https://paddo.dev/blog/impeccable-design-vocabulary/) — vocabulary-layer thesis, Tessl benchmarks (+0.35, 1.59×), anti-patterns rationale
- [pbakaus/impeccable on GitHub](https://github.com/pbakaus/impeccable) — 7 reference files + 17 commands. **Already loaded in your skills as `impeccable`.**
- This repo: `.claude/references/frontend-antislop-patterns.md` — research-backed catalogue with 11 sources, plus pre-ship grep patterns
