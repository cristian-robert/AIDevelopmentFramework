---
name: brand-extract
description: Extracts brand assets (logo, product imagery, UI screenshots, color/typography tokens) from a project's codebase plus official brand channels, then freezes them into `.design-system/brand-spec.md` so design-artifact skills (huashu-design, frontend-design, etc.) read the same canonical spec on every run instead of asking the user from scratch. Triggers on requests to set up the brand system, capture brand assets, prepare brand-spec.md, onboard a project for design work, or run before huashu-design when no brand-spec exists. Implements huashu-design's Core Asset Protocol (5 steps × 6 asset types × 5-10-2-8 quality gate).
---

# /brand-extract — Project Brand Asset Extraction

Writes the canonical `.design-system/brand-spec.md` for a project so downstream design skills (huashu-design, frontend-design, frontend-aesthetics) reuse it instead of re-asking the user. Implements the **Core Asset Protocol** from huashu-design.

The skill's contract: **assets > spec.** A project's brand recognizability ranks logo > product render > UI screenshot > color > font > vibe-keyword. We capture all six, in that priority order.

## When to Use

- Before any design-artifact work where `.design-system/brand-spec.md` is missing
- When the user explicitly asks to "set up the brand system" or "extract brand assets"
- As Task 0 of a `/plan-feature` design-artifact plan (auto-invoked by `/execute`)
- When the user says the project's existing brand-spec is stale and needs a refresh

## When NOT to Use

- The deliverable is generic (no specific brand named) — skip; let the design skill use its built-in design-direction advisor
- The change is to existing app code that already follows project conventions — `/brand-extract` is for kicking off design artifacts, not auditing production CSS

## Process

### Phase 0: Fact Verification (Principle #0)

Before anything else, if the user named a specific product/version/release, verify it exists. Borrowed from huashu-design's Principle #0:

1. Run `WebSearch` (or `firecrawl search`) for `<product> 2026 latest release specs`
2. Read 1–3 authoritative results
3. Confirm: existence, release status, current version, key specs
4. Write findings to `.design-system/product-facts.md`

**Banned phrases until you've searched:**
- "I think X is at version N"
- "X probably hasn't shipped yet"
- "X likely doesn't exist"

A 10-second search prevents the hour-of-rework "DJI Pocket 4 unreleased" failure mode.

### Phase 1: Check Existing State

```bash
ls -la .design-system/ 2>/dev/null
```

- If `.design-system/brand-spec.md` exists → read it, ask whether to **refresh** (re-run extraction, keep human edits) or **append** (add new asset categories, leave existing alone). Do not overwrite silently.
- If absent → bootstrap the directory:
  ```bash
  mkdir -p .design-system/assets .design-system/refs
  ```

### Phase 2: Codebase Discovery (parallel)

Dispatch parallel sub-agents OR run greps directly. Three independent searches:

**a. Token sources**
- `tailwind.config.{ts,js,mjs}`
- `app/globals.css`, `src/styles/*.css`, `theme.css`
- `components.json` (shadcn) → walk `components/ui/*`
- CSS custom properties in `:root { --... }`

**b. Existing brand assets in repo**
- `public/logo*`, `public/brand/*`, `public/images/logo*`
- `.svg` files referenced from layout/header components
- `og-image*`, social share graphics

**c. Project metadata**
- `package.json` → name, description, homepage
- `README.md` → identify the brand voice/tone signal
- Existing marketing pages (e.g., `app/(marketing)/page.tsx`) → screenshot for vibe extraction

Write findings to `.design-system/_extraction-log.md` (gitignored if you prefer; or commit for traceability).

### Phase 3: Ask the 6-Asset Checklist (one batch)

Per huashu-design's "ask the asset checklist all at once" rule. Don't dribble questions — send the full list, wait for all answers.

```
For brand <name>, which of these do you have? I'll list them in priority order:

1. Logo (SVG or high-res PNG) — REQUIRED for any brand
2. Product photography / official renders — REQUIRED for physical products
3. UI screenshots / interface assets — REQUIRED for digital products
4. Color palette (HEX / RGB / brand swatches)
5. Typography (display / body fonts)
6. Brand guidelines PDF / Figma design system / brand site URL

For each: send what you have, or say "search for it" and I'll go find it.
```

If the user says "I don't know, you decide" → proceed to Phase 4 with `<brand>` defaulted to the project name from `package.json`.

### Phase 4: Search Official Channels (asset-by-asset)

For every missing asset, three fallback paths in order. Use `firecrawl scrape`, `curl`, or `playwright-cli`.

| Asset | Search paths (in priority order) |
|---|---|
| **Logo** | `<brand>.com/brand` → `<brand>.com/press` → inline SVG from `<brand>.com` HTML → official social avatar (GitHub/Twitter/LinkedIn, usually 400×400+) |
| **Product render** | `<brand>.com/<product>` hero image → `<brand>.com/press` press kit → official YouTube launch-film frames (`yt-dlp` + `ffmpeg`) → Wikimedia Commons → AI-generated using a real product photo as reference (never CSS silhouette) |
| **UI screenshot** | App Store / Google Play screenshots → official site `screenshots/` section → product demo video frames → official social posts at version-launch dates |
| **Color palette** | inline CSS on official site → Tailwind config in their public repos → brand guidelines PDF |
| **Typography** | `<link>` tags on official site → tracked Google Fonts requests → brand guidelines |
| **Vibe keywords** | descriptive phrases from official press copy + tagline + hero headline |

Cache assets under `.design-system/assets/<brand>/`.

### Phase 5: 5-10-2-8 Quality Gate (mandatory for non-logo assets)

Per huashu-design: stability of stability is the moat. Garbage assets pollute every downstream design.

- **5 search rounds** across distinct sources (not page 1 of one search engine)
- **10 candidates** collected before filtering
- **2 finals** chosen
- **Each ≥ 8/10** across:
  1. Resolution — ≥ 2000px (≥ 3000px for print/big-screen scenarios)
  2. License clarity — official > public-domain > free-stock; suspected pirated = score 0
  3. Brand-vibe match — agrees with the project's vibe keywords
  4. Light/composition consistency with the other final
  5. Independent narrative role — earns its place, not decoration

**If a candidate scores 7 or below: reject.** Use a labeled gray-block placeholder or AI-generate using a real reference, but **never** substitute a hand-drawn SVG silhouette.

**Logo exception:** logos are not graded on 5-10-2-8 — they're a recognizability root. Use the official logo even if it's a 6/10 file.

Record scores in `.design-system/_quality-log.md`.

### Phase 6: Write `brand-spec.md`

Use this exact schema (consumed by huashu-design and by frontend-* skills via the gate in `.claude/rules/frontend.md`):

```markdown
# Brand Spec — <project name>

> Generated: <ISO date> by /brand-extract
> Re-run /brand-extract to refresh

## Identity

- **Name:** <project / brand name>
- **Tagline:** <one sentence>
- **Vibe keywords:** <3–6 words: "warm-natural", "premium-restrained", "engineering-confident", etc.>
- **Voice / tone:** <2 sentences extracted from README + marketing copy>
- **Audience:** <who reads / uses this>

## Assets (priority order)

### Logo (REQUIRED)
- Primary SVG: `.design-system/assets/<brand>/logo.svg`
- Inverted (for dark bg): `.design-system/assets/<brand>/logo-white.svg`
- Notes: <usage rules — clear-space, min-size, color variants>

### Product imagery
- Hero render: `.design-system/assets/<brand>/product-hero.png` — score: N/10
- Secondary: `.design-system/assets/<brand>/product-detail.png` — score: N/10
- Source: <URL>
- Notes: <when to use which>

### UI screenshots (digital products)
- Primary screen: `.design-system/assets/<brand>/ui-primary.png` — score: N/10
- Secondary: `.design-system/assets/<brand>/ui-secondary.png` — score: N/10
- Source: <URL or "user-supplied">

## Tokens (OKLCH preferred)

```css
:root {
  --brand-primary: oklch(...);
  --brand-accent: oklch(...);
  --neutral-fg: oklch(...);
  --neutral-bg: oklch(...);
  /* ...full scale */
}
```

### Typography
- Display: `<font-family>` — license: <Google Fonts / commercial / system>
- Body: `<font-family>`
- Mono (only where functional): `<font-family>`
- Pairing rationale: <one sentence — why this combo, not Inter/Inter>

### Spacing scale
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (or project-specific)

### Radii
<role → value mapping; vary by role, don't ship a single global radius>

## Anti-fingerprints (project-specific)

What this project must NOT look like. Auto-extracted from the existing codebase + the catalogue in `.claude/references/frontend-antislop-patterns.md`:

- <e.g. "existing marketing site uses indigo→violet gradient — new work must NOT reproduce">
- <e.g. "competitor X uses bento-grid hero — avoid">
- <e.g. "no CSS-silhouette stand-ins — see brand-spec product imagery for the real renders">

## Sources

- Logo: <URL + access date>
- Product hero: <URL + access date>
- UI screenshots: <URL or "user-supplied" + date>
- Color extraction: <URL or commit ref>
- Typography: <URL>

## Quality log

See `_quality-log.md` for per-asset 5-10-2-8 scores.

## Refresh policy

This spec is canonical until /brand-extract is re-run. Manual edits are preserved on `--mode=append` and may be overridden on `--mode=refresh`.
```

### Phase 7: Index + commit

1. Append a one-liner to `.gitignore` if `_extraction-log.md` shouldn't be committed (default: commit it for traceability).
2. Stage and commit:

```bash
git add .design-system/
git commit -m "feat(brand): extract brand spec for <name>

- Logo, product imagery, UI screenshots captured per Core Asset Protocol
- Tokens expressed in OKLCH
- Anti-fingerprints listed for downstream design skills
- 5-10-2-8 quality scores logged"
```

3. If KB is configured for the project, run `/kb ingest .design-system/brand-spec.md` to make the spec searchable from `/prime` and `/execute`.

## Output

Tell the user:

```
Brand spec written to .design-system/brand-spec.md
- Logo: ✓ / ✗
- Product imagery: N/2 finals at ≥8/10
- UI screenshots: N/2 finals at ≥8/10
- Tokens: OKLCH + type scale + spacing
- Anti-fingerprints: N project-specific rules

Downstream skills (huashu-design, /frontend-design, /frontend-aesthetics) will now
auto-load this spec instead of asking from scratch.
```

## References

Load only when the rule triggers:

- `.claude/references/frontend-antislop-patterns.md` — Brand Asset Anti-Patterns section, 5-10-2-8 details, sources
- `.claude/rules/frontend-antislop.md` — checklist used in pre-write lint
- `.claude/rules/frontend.md` — the design-skill gate that consumes this spec
