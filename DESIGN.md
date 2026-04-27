# Midsphere Design System

The visual + voice spec for **midsphere.ai** — a marketing site for an autonomous AI agent platform.

The system is a **sketchbook with a serious thesis**. A precise sans serif (Google Sans Flex) carries the body. Hand-drawn line art, marker-pen highlights, and editorial annotations carry the personality. The two surfaces are deliberately mismatched — the typography keeps the prose credible, and the doodles keep the brand from reading as another monochrome enterprise template.

This document is the single source of truth for the visual system. The runtime tokens live in `src/styles/global.css`; the rules below describe how to use them. Stack-wide conventions (perf budget, DRY, accessibility, SEO/GEO) live in `docs/CODING_STANDARDS.md`.

---

## Table of contents

1. [Philosophy](#philosophy)
2. [Color tokens](#color-tokens)
3. [Typography](#typography)
4. [Spacing, radii, shadows, motion](#spacing-radii-shadows-motion)
5. [Component utilities (CSS)](#component-utilities-css)
6. [Shared Astro components](#shared-astro-components)
7. [Hand-drawn personality](#hand-drawn-personality)
8. [Doodle conventions](#doodle-conventions)
9. [Voice & copy](#voice--copy)
10. [Page patterns](#page-patterns)
11. [Comparison pages](#comparison-pages)
12. [Accessibility](#accessibility)
13. [GEO / SEO](#geo--seo)
14. [Personal preferences (Affan)](#personal-preferences-affan)

---

## Philosophy

The site sits between a whitepaper and a children's book — much closer to the whitepaper end. Three rules govern that placement:

1. **The visuals carry the warmth, the words don't.** Marker font on a phrase, a doodle in the margin, a hand-drawn arrow — these earn the right to set the prose in a flat, technical voice. If the words also try to be playful ("yay", "ooh", emoji, mascots), both surfaces lose their punch.
2. **Restraint is the move.** The first instinct is "more sketchy stuff." Resist it. The marker font feels good *because* the rest of the page is set in a precise sans. Stack two casual surfaces and both fail.
3. **One playful element per moment.** A doodle next to a marker highlight next to a hand-drawn arrow is three things competing for the same attention. Pick the one doing the most work; demote the others.

The playfulness is *anti-corporate*, not *cute*. No mascots, no characters with names, no faces with personalities. Stick figures and abstract shapes are fine.

---

## Color tokens

All tokens live on `:root` in `global.css` and are mapped into Tailwind v4 via `@theme`. Use the Tailwind class (`bg-canvas`, `text-fg-2`) in markup; only reach for `var(--ms-*)` inside CSS rules.

### Surfaces

| Token | Hex | Use |
|---|---|---|
| `--ms-bg-canvas` | `#FFFFFF` | Default page surface |
| `--ms-bg-surface` | `#FFFFFF` | Cards on canvas |
| `--ms-bg-sunken` | `#F4F4F4` | Quiet card / contained recipe blocks |
| `--ms-bg-inverse` | `#0B0B0B` | Dark CTA panel, footer, single feature tile |

### Foreground

| Token | Hex | Use |
|---|---|---|
| `--ms-fg-1` | `#111111` | Primary text |
| `--ms-fg-2` | `#555555` | Secondary text — body prose passes WCAG AA on canvas |
| `--ms-fg-3` | `#8A8A8A` | Tertiary — labels only |
| `--ms-fg-on-inverse-1` | `#FFFFFF` | Primary text on dark |
| `--ms-fg-on-inverse-2` | `#B5B5B5` | Secondary text on dark |

**Contrast caution.** `text-fg-3` on canvas is **3.48:1** — passes for small decorative labels (eyebrows, time stamps) but **fails AA for body prose**. Use `text-fg-2` for any paragraph text. `text-fg-3` on inverse passes (5.49:1).

### Borders

| Token | Value | Use |
|---|---|---|
| `--ms-border-subtle` | `rgba(0,0,0,0.08)` | Default card border |
| `--ms-border-default` | `rgba(0,0,0,0.14)` | Inputs, secondary buttons |
| `--ms-border-strong` | `rgba(0,0,0,0.28)` | Focused input |
| `--ms-border-on-inverse` | `rgba(255,255,255,0.12)` | Borders on dark surfaces |

### Accent (the only color)

| Token | Hex | Use |
|---|---|---|
| `--ms-accent` | `#D7F25C` | Lime highlighter — sparing use |
| `--ms-accent-soft` | `#ECF7B3` | Softer highlighter |
| `--ms-accent-ink` | `#2E3A0A` | Dark text on lime tiles |

Lime is the **single accent**. There is no secondary accent, no brand blue, no warm/cool mode. Restraint is the rule — one lime moment per paragraph at most.

### Semantic (in-product status only — not for marketing)

`--ms-ok #3F7A4B`, `--ms-warn #B8862B`, `--ms-err #B23A2C`, each with a `*-soft` companion for backgrounds. Reserved for status chips in product UI; do not use for emphasis on marketing pages.

---

## Typography

### Font families

| Family | Weights | Role | Token |
|---|---|---|---|
| **Google Sans Flex** | 400–700 var | Body + headings | `--ms-font-sans` |
| **Fuzzy Bubbles** | 400 | `.hl` / `.hl-soft` highlighter spans only | `--ms-font-display` |
| **JetBrains Mono** | 400–500 | Eyebrows, code, mono tags | `--ms-font-mono` |

Google Sans Flex was released SIL OFL by Google in late 2025 — the public open-source release of the brand sans, not the older proprietary "Google Sans". Fuzzy Bubbles is hand-drawn marker-style; it is **scoped to `.hl` and `.hl-soft`** only, so the playful letterforms appear only on the single phrase per paragraph that already carries the lime accent. Used elsewhere it cheapens fast.

All sans woff2 files are self-hosted in `public/fonts/` (Latin subset, ~30–45KB each) and preloaded in `BaseLayout.astro`. `font-display: swap` to avoid FOIT.

Hand-drawn flourishes inside SVGs (the "vs." separator, etc.) use `font-family: serif; font-style: italic;` inline — kept as a one-off convention, not promoted to a token.

### Display sizing

Three classes cover every heading on the site:

| Class | Size | Use |
|---|---|---|
| `.h-display` | `clamp(40px, 5.4vw, 72px)` | Hero h1 |
| `.h-display-lg` | `clamp(36px, 4.2vw, 56px)` | Closing CTA h2 |
| `.h-section` | `clamp(28px, 3vw, 40px)` | All other section h2 |

All three are `font-weight: 500`, `letter-spacing: -0.025em`, `text-wrap: balance`, line-height 1.05–1.18.

### Eyebrows (mono lowercase 12px)

- `.eyebrow` — `fg-3` on light surfaces
- `.eyebrow-on-dark` — `fg-on-inverse-2` on dark surfaces
- `.eyebrow-on-accent` — `accent-ink` at 0.65 opacity on lime tiles

### Highlighter spans (the marker phrase)

- `.hl` — strong lime gradient (the accent moment)
- `.hl-soft` — softer lime, secondary emphasis

Both apply Fuzzy Bubbles, drop size to `0.9em`, tighten tracking to `-0.01em`, and lay a horizontal lime gradient under the text (`linear-gradient(transparent 58%, var(--ms-accent) 58%)`). The smaller size + tracker-tighten exists because Fuzzy Bubbles runs taller and rounder than Google Sans Flex; without the adjustments the highlighter pill breaks the host line's rhythm.

**One per paragraph.** On every-other phrase the lime stops reading as emphasis.

---

## Spacing, radii, shadows, motion

### Spacing scale (4px base)

`--space-1 4px` · `--space-2 8px` · `--space-3 12px` · `--space-4 16px` · `--space-5 24px` · `--space-6 32px` · `--space-7 48px` · `--space-8 64px` · `--space-9 96px` · `--space-10 128px`

Standard section padding is `var(--space-9)` (96px) via `.section`. Tight sections use `.section-tight` (48px).

### Radii

`--r-xs 4px` · `--r-sm 8px` · `--r-md 12px` · `--r-lg 18px` · `--r-xl 28px` · `--r-pill 9999px`

Buttons are always pill (`--r-pill`); cards default to `--r-md`; feature cards (`.card-feature`) bump to `--r-lg`.

### Shadows

Three levels, all neutral gray (`rgba(14,14,12, *)`) — never pure black, which reads as a stamp on white.

- `--shadow-1` — flat tile, hairline lift
- `--shadow-2` — card hover
- `--shadow-3` — modal / pop

### Motion

- `--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1)` — single curve for everything
- `--t-color: 150ms` — color/border transitions
- `--t-transform: 200ms` — translate/scale transitions

Two named animations:
- `.page-fade` — opacity-only entry, 200ms (no slide, no blur — the entire entry vocabulary)
- `.doodle-float` — 4.5s tiny y-axis float on hand-drawn doodles (never bouncy)

All animations respect `@media (prefers-reduced-motion: reduce)`.

### Layout

`.container-x` — `max-width: 1200px`, `margin-inline: auto`, padding 32px (24px tablet, 20px mobile).

---

## Component utilities (CSS)

These live in `@layer components` of `global.css`. Use the class directly in markup; do not rebuild them with Tailwind utilities.

### Buttons (`.btn` + variant)

All pill-shaped, 14px font, `font-weight: 500`, `padding: 10px 18px`. Variants:

| Class | Background / color |
|---|---|
| `.btn-primary` | Black on white text — default page CTA |
| `.btn-secondary` | White, bordered |
| `.btn-accent` | Lime, dark ink |
| `.btn-inverse` | White on dark surfaces |
| `.btn-ghost` | Transparent on light |
| `.btn-ghost-on-dark` | Transparent on dark |

**Focus ring** (every variant): 2px solid black inner outline + 4px lime `box-shadow` halo. The black inner carries the 3:1 contrast on every surface; the lime halo carries the brand. On dark variants the inner outline flips to white (`btn-ghost-on-dark`, `btn-inverse`). **Lime alone fails 3:1 on canvas** — never use it as the sole focus indicator.

### Cards

- `.card` — bordered canvas tile, `padding: 24px`, `border-radius: 12px`
- `.card-feature` — bumps padding to 32px, radius to 18px
- `.card-hover` — adds 2px lift + `--shadow-2` on hover (disabled under `prefers-reduced-motion`)

### Code blocks

- `.codeblock` — mono 13px, sunken background, subtle border, scroll-x for overflow
- `.codeblock-on-dark` — translucent white background + on-inverse border for dark surfaces

Use the `<CodeBlock>` Astro component rather than the raw class — it handles the `<pre><code>` wrapper.

### Mono tags / chips

- `.mono-tag` / `.mono-tag-on-dark` — small bordered mono pill (e.g. `$ midsphere deploy`)
- `.chip` — small status pill, `chip-accent` / `chip-soft` / `chip-ok` / `chip-warn` variants

### Inputs

`.input` — 14px, 10px×14px padding, 8px radius, default border, `--shadow-1`. Focus state matches buttons (black inner + lime halo + strong border).

### Skip link

`.skip-link` — accessibility skip-to-content, hidden until focused. Mounted in `BaseLayout` via `PageLayout`.

### Hero rotator

`.hero-line`, `.hero-line-rotator`, `.rotating-phrase`, `.rotating-ghost`, `.rotating-stack`, `.rotating-item` — used by the Hero rotating-headline effect. Ghost reserves layout width for the longest variant (kept canonical in CSS via `::before` so the h1's text content stays canonical for SEO).

---

## Shared Astro components

### UI primitives (`src/components/ui/`)

- `Button.astro` — anchor or button, variant prop matches `.btn-*`
- `Card.astro` — semantic wrapper, optional hover lift
- `CodeBlock.astro` — `code` + `variant: 'light' | 'on-dark'`
- `Checkmark.astro` — small inline check
- `MarginAnnotation.astro` — hand-drawn margin note
- `ScrollDownArrow.astro` — hero scroll-cue arrow
- `PricingTier.astro` — pricing tile
- `FitFramework.astro`, `ScenarioCard.astro`, `StopDoingCard.astro` — building blocks for compare pages
- `ClosingPanel.astro` — dark inverse panel for closing CTA on subpages

### Doodle family

Hand-drawn doodles are **first-class components**, not inline SVG. When a doodle is reused or grows past ~12 SVG lines inline, extract it as a UI component with a `kind`/`variant` prop:

- `PencilDoodle.astro` — hero pencil
- `LightningDoodle.astro` — closing-CTA lightning bolt
- `RangeDoodle.astro` — six product doodles (`kind` prop)
- `YoursPillarDoodle.astro` — Tools/Skills/Knowledge doodles (`kind` prop)
- `BlogDoodle.astro` — blog-page doodles (`journal`, `pencil`, `closed-book`, `paper-stack`)
- `CloudProviderDoodle.astro`, `CloudProviderPageDoodle.astro` — compare/cloud-providers
- `AgentFrameworkPageDoodle.astro`, `ManagedAgentPageDoodle.astro`, `FrameworkWorkDoodle.astro` — other compare pages

### Sections (`src/components/sections/`)

The landing-page section components: `Hero`, `Premise`, `BringYourOwn`, `Range`, `Scale`, `Pricing`, `DayInLife`, `ClosingCTA`. Plus `Receipt` (cost-breakdown sidebar) and `ScaleSliderDoodle` (Scale-section interactive doodle).

### Global (`src/components/global/`)

`Navbar.astro`, `Footer.astro`, `SEOHead.astro`. Page-level chrome lives here.

---

## Hand-drawn personality

The personality lives on three surfaces, in this order of frequency:

1. **Doodles** — line-art illustrations that *explain* concepts (pencil, lightning bolt, key ring, runbook, stack of papers). Conventions in the next section.
2. **Marker-pen typography** — Fuzzy Bubbles on `.hl` / `.hl-soft` only. The highlighted phrase reads as if someone circled it with a sharpie.
3. **Editorial annotations** — hand-drawn arrows, asterisks, and margin notes attached to key phrases. Treat them like a copyeditor's pen, not decoration. `MarginAnnotation.astro` is the component.

Stacking two of these on the same beat dilutes both. The marker phrase is loud; let it be the only loud thing in its paragraph.

---

## Doodle conventions

The site's visual personality is hand-drawn line art, not iconography. Iconography signals "enterprise software"; line art signals "a person made this."

### Stroke

- `stroke="#111"` (or `currentColor` on dark surfaces)
- `stroke-width="1.6"` — thin enough to read as ink, thick enough to survive scaling
- `stroke-linecap="round"`, `stroke-linejoin="round"`
- `fill="none"` — these are line drawings, not silhouettes
- Slight asymmetry / jitter in paths so they read hand-drawn, not vector-perfect. A perfectly even circle reads as a logo; a circle that closes 5° past start reads as drawn.

### Sizing

- 80–120px for inline icons in cards
- 140–220px for hero/anchor doodles
- 60–80px for marginal flourishes (arrows, checks)

### Semantics

- All decorative SVGs: `aria-hidden="true"`. The doodle does not narrate the section; the heading and prose do.
- **Doodles should explain the concept, not decorate it.** Tools = a key ring (you hand the agent the keys). Skills = a runbook with folded corner. Knowledge = a stack of papers / homework. Choose the metaphor that grounds the copy.
- Character doodles (chatbot face / agent stick figure) > abstract diagrams (loops, lines, Venn) for landing personality. The audience remembers a sketched stick figure better than a Venn diagram.

### Text inside SVGs — almost never

**Never use `<text>` inside an SVG for content the user might read in flow.** Document text-order includes SVG text nodes, so a stray `?` or `"on it."` inside an illustration appears as an orphan fragment when the page is read top-to-bottom or extracted by SEO crawlers. Replace with paths (curve a `?` glyph) or shapes (3 short lines = "speech bubble has writing").

The single exception is the inline italic-serif "vs." in compare-page doodles, which is short, decorative, and intentional.

---

## Voice & copy

### Banned vocabulary

These words must not appear anywhere in marketing copy:

`powerful · revolutionary · seamless · cutting-edge · leverage · empower · unlock · transform · magical · robust · scalable · innovative · intelligent`

`transform` is OK as a CSS property; the ban is on the marketing usage. Verify with grep before claiming a section is clean:

```bash
grep -niE "powerful|revolutionary|seamless|cutting-edge|leverage|empower|unlock|magical|robust|scalable|innovative|intelligent" src/path/to/file.astro
```

### No mechanics talk on marketing surfaces

The marketing surface never describes how the agent works internally:

`planner · executor · orchestration · sandbox · retry policy · recovery · knowledge manager · context management`

These are real concepts in the framework but they belong in `/docs`, not in copy aimed at builders. Marketing copy talks about **outcomes** and the **developer's experience**.

### Tone

- **Direct, second-person, conversational.** "You" as much as possible. Short sentences. Asides and parentheticals for texture.
- **Specific moments beat abstract claims.** "Sunday morning" lands harder than "weekly." "Eight hours" lands harder than "long-running."
- **Avoid AI tells.** Triplet rhythms ("X. Y. Z. — clean parallel") read AI-written if used too often. Vary sentence length. Asymmetric clauses feel human.
- **Sketchbook voice, grown-up content.** The site has hand-drawn doodles, marker-pen highlights, and pull-quote asides — but the prose underneath stays direct and technical. The personality lives in the *visuals* and in *which* sentence gets emphasis, not in childish word choice. Playful captions like "Polite. Limited. Sleeps between turns." land because they're matter-of-fact descriptions made into a rhythm. "An agent that does the thing" with an emoji does not.
- **No exclamation points. No emoji. No mascot characters.** The typography is allowed to feel like a sketchbook; the words are not.
- **Code samples appear in Hero only.** Other landing sections explain via prose, doodles, and labeled visuals. Code in every section reads as documentation, not marketing.

### Reader-flow rules

- **Read the section as plain text** before shipping. Strip the visuals and trace sentence-to-sentence — the narrative should flow without the doodles. If a heading appears as a non-sequitur after the previous paragraph, add a connecting word ("Because…", "Why…").
- **Bridge headings**, don't drop in textbook definitions. "An agent isn't a chatbot." landed as a non-sequitur after a paragraph about feature backlog. "Because an agent isn't a chatbot." answers the implicit "why".
- **One narrative job per section.** When pain and definition compete in the same section, demote one (smaller heading, lower contrast) so the reader knows which is the lead.
- **Scan for cross-section repetition before shipping.** On long marketing pages the same idea ("frameworks build it, we built one") tends to land in the hero, the intro, the comparison, and the CTA. Each restatement bleeds engagement. **One canonical landing per idea**, then move forward.

---

## Page patterns

### Layout chain

```
Page (e.g. index.astro)
  → BaseLayout (adds <html>, SEOHead, global.css)
       — Navbar/Footer rendered inside the page, not by a wrapper layout

PageLayout exists for content pages and adds Navbar / skip-to-content / Footer.
Blog posts use BlogLayout which wraps BaseLayout directly.
```

The homepage (`src/pages/index.astro`) calls `BaseLayout` directly and renders `<Navbar />` + sections + `<Footer />` itself.

### Landing-page section order

Defined in `src/pages/index.astro`:

```
Navbar
 → Hero            (hook + 3-line code sample)
 → Premise         (pain → "because an agent isn't a chatbot" → comparison)
 → BringYourOwn    (Tools / Skills / Knowledge → flow card)
 → Range           (six product examples climbing in ambition)
 → Scale           (build for one, ship for everyone + policy guard rails)
 → Pricing         (free credits / usage / caps / volume tiles)
 → DayInLife       (timestamped steps + payoff paragraphs)
 → ClosingCTA      (dark inverse panel + lightning doodle)
Footer
```

### Section-divider rhythm

Borders bracket conceptual chapters, not every section:

- **Intro chapter** (Hero · Premise · BringYourOwn) — no internal borders
- **Gallery chapter** (Range) — `border-t`
- **Technical + cost chapter** (Scale · Pricing) — Scale `border-t`, Pricing `border-b`
- **Payoff chapter** (DayInLife · ClosingCTA) — no internal borders

When you remove a section, **move its `border-t` onto the next chapter opener** so chapters stay bracketed — don't leave the rhythm broken.

### Astro / runtime

- **Astro 5.x**, `output: server`, adapter `@astrojs/node`. Server-rendered, zero client-side JS by default.
- Interactivity uses `is:inline` scripts in BaseLayout for theme toggle, scroll-triggered animations, and an IntersectionObserver.
- Tailwind v4 via `@tailwindcss/vite` (**not** `@astrojs/tailwind`). All design tokens live in `global.css` inside `@theme { ... }`.
- `npm run build` is the gate — it fails on Astro/TS errors. There is no separate `tsc` step, no test runner, no linter.

---

## Comparison pages

Routes live under `/compare/<competitor>` and are linked from the Footer's `compare` column. Shipping the page without the footer link strands it.

These are **fit-assessment** pages, not feature comparisons. If the reader is the competitor's right buyer, the page should send them there.

### Structural pattern

Hero (one-line thesis + competitor named neutrally)
 → competitor's honest pitch
 → single concept doodle (e.g. yours-vs-ours horizon)
 → "what you stop doing" cards (~6, each with a per-card doodle)
 → fit framework (two columns, ~3 distinct bullets each)
 → two scenarios (one wins for them, one wins for us)
 → closing CTA

Use `src/pages/compare/cloud-providers.astro` as the structural template.

### Voice rules specific to compare pages

- **Outcome-first, not architecture-first.** Frame in terms of work the developer does or doesn't do. The architecture is a means, not the pitch.
- **No mechanics talk on compare pages.** The general ban applies double here — `planner`, `executor`, `knowledge manager`, `Firecracker` belong on `/under-the-hood`, never in a compare page.
- **One scenario must genuinely win for the competitor.** If both scenarios end "Midsphere is the right call" the page reads as dishonest. Concede where the alternative is the right answer.
- **Acknowledge the alternative's legitimacy.** "That's a real product. It's just a different one." Never frame the competitor as outdated, slow, or bureaucratic.

### De-duplication pass (always last)

The thesis lands exactly three times: hero h1, concept-doodle heading, closing h2. Middle sections add beats, not restate. Concrete patterns to grep for on review:

- Hero p2 rephrasing p1
- Competitor's-pitch section listing items the "stop doing" cards already cover
- Figcaptions paraphrasing the heading directly above them
- Fit-framework bullets that overlap (control + control, platform + platform)
- Closing body re-listing items the cards already covered
- The triplet AI-tell ("X is hard. Y is hard. Z is hard. We did. We keep. You don't.") — kill on sight

---

## Accessibility

- **Focus**: black inner outline + lime halo on every interactive element. Lime alone fails 3:1 on canvas; the black inner is what carries the contrast.
- **Body prose contrast**: use `text-fg-2` (8.6:1 on canvas), never `text-fg-3` (3.48:1, fails AA at body size). `text-fg-3` is for small decorative labels only.
- **Skip link**: `.skip-link` is mounted in PageLayout and surfaces on Tab.
- **Headings**: one `<h1>` per page; no skipped levels.
- **Decorative SVGs**: `aria-hidden="true"`. Doodles don't narrate.
- **Reduced motion**: `.page-fade`, `.doodle-float`, and `.card-hover` all degrade under `prefers-reduced-motion: reduce`.
- **Analytics persistence**: PostHog runs with `persistence: 'memory'` — nothing in cookies, nothing in localStorage. Removes the cookie-banner requirement at the cost of cross-visit dedupe. If a product surface lands on this domain it must add a real consent banner before upgrading persistence.

---

## GEO / SEO

For both blog and marketing pages:

- Every `<h1>` / `<h2>` / `<h3>` gets a unique `id` so LLMs can deep-link
- Server-render primary content (Astro default — no client-side fetch for headlines, captions, code samples)
- Use concrete, citable facts ("three lines of code", "ten seconds or eight hours", real product names)
- One `<h1>` per page; no skipped heading levels
- Schema.org JSON-LD via `SEOHead.astro` on every page

`src/utils/seo.ts` exports schema generators: `organizationSchema`, `blogPostingSchema`, `breadcrumbSchema`, `faqSchema`. `SEOHead.astro` renders them as `<script type="application/ld+json">`.

Per `docs/CODING_STANDARDS.md` §5: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` allowed in `robots.txt`. Track LLM-referrer traffic in PostHog as a real channel.

---

## Personal preferences (Affan)

- **Compact > spacious.** Tighten margins between blocks within a section before adding visual containers. The section feels disconnected when blocks float in cosmic-void whitespace; tight `mt-8` / `mt-10` solves what `bg-sunken` wrappers can't.
- **`bg-sunken` containers can feel weird** wrapping editorial comparisons — the grey rectangle competes with the doodles for visual weight. Prefer cohesion through tight spacing on canvas.
- **Iterates on copy multiple times.** Expect ~5 passes per significant section. Each pass typically targets one specific thing: rhythm, duplicate messaging, AI-feel, narrative bridge.
- **Likes editorial moves**: pull-quotes for closing lines, hand-drawn arrow annotations, lime highlighter on the single phrase that matters in a paragraph (not on every nice phrase). The Fuzzy Bubbles marker treatment on `.hl` belongs to that same family — a typographic version of circling a sentence with a sharpie.
- **Doodles should explain, not decorate.** When asked to add personality, the answer is usually "draw a thing that conveys the meaning," not "add an icon."
- **Playful but not cute.** The visuals carry the warmth so the prose doesn't have to. When in doubt, write the sentence flat and let the visual treatment add the personality.
- **Cost estimates round up.** On marketing surfaces, overshoot in the page copy so real bills come in under, never over.
