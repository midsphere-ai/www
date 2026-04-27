# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Production marketing website for **midsphere.ai** — an autonomous AI agent platform. Built with Astro 5, TypeScript, and Tailwind CSS v4. Includes a Markdown-based blog optimized for SEO and GEO (Generative Engine Optimization).

Stack-wide conventions (perf budget, DRY, accessibility, SEO/GEO) live in `docs/CODING_STANDARDS.md` — read it before non-trivial work. This file is the project-specific layer on top.

## Commands

```bash
npm run dev       # Start dev server (localhost:4321)
npm run build     # Production build → dist/ (also the type check; no separate `tsc`)
npm run preview   # Preview production build locally
```

No test runner or linter is configured. `npm run build` is the gate — it fails on Astro/TS errors.

## Architecture

**Astro 5.x server-rendered site** (output: `static`, mode: `server`, adapter: `@astrojs/node`). Zero client-side JS by default — interactivity uses `is:inline` scripts in BaseLayout for theme toggle, scroll-triggered animations, and an IntersectionObserver.

### Layout Chain

```
Page (e.g. index.astro)
  → BaseLayout (adds <html>, SEOHead, global.css)
       — Navbar/Footer rendered inside the page, not by a wrapper layout

PageLayout exists for content pages and adds Navbar/skip-to-content/Footer.
Blog posts use BlogLayout which wraps BaseLayout directly.
```

The homepage (`src/pages/index.astro`) calls `BaseLayout` directly and renders `<Navbar />` + sections + `<Footer />` itself.

### Landing Page Section Order

Defined in `src/pages/index.astro`. Each section is its own component in `src/components/sections/`:

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

**Section-divider rhythm.** Borders bracket conceptual chapters, not every section:
- Hero · Premise · BringYourOwn  → intro (no internal borders)
- Range  → gallery (border-t)
- Scale · Pricing  → technical + cost (Scale border-t, Pricing border-b)
- DayInLife · ClosingCTA  → payoff (no internal borders)

When you remove a section, move its `border-t` onto the next chapter opener so chapters stay bracketed — don't leave the rhythm broken.

### Adding a `/compare/*` page

- Use `src/pages/compare/cloud-providers.astro` as the structural template (hero → "what each is" cards → fit columns → scenarios → closing CTA).
- Add a corresponding link in `Footer.astro`'s `footerColumns` compare column. Shipping the page without the footer link strands it.
- Slug is kebab-case under `/compare/<slug>`.

### Content Collections (Blog)

- Schema: `src/content.config.ts` using Astro 5 `glob()` loader pattern
- Posts: `src/content/blog/*.{md,mdx}`
- Routes: `src/pages/blog/[...id].astro` (uses `id`, not `slug`)
- Draft posts excluded in production (`import.meta.env.PROD`)
- Frontmatter: `title`, `description`, `pubDate`, `updatedDate?`, `author`, `image?`, `tags`, `draft`

### SEO / JSON-LD

`src/utils/seo.ts` exports schema generators: `organizationSchema`, `blogPostingSchema`, `breadcrumbSchema`, `faqSchema`. Consumed by `SEOHead.astro` which renders them as `<script type="application/ld+json">`.

## Design System

### Tailwind CSS v4

Uses `@tailwindcss/vite` plugin (**not** `@astrojs/tailwind`). All design tokens live in `src/styles/global.css` inside `@theme { ... }`. CSS custom properties on `:root` are the single source of truth — Tailwind maps them via `--color-*`, `--font-*` tokens.

### Surfaces & color tokens

| Token | Hex | Use |
|---|---|---|
| `--ms-bg-canvas` | `#FFFFFF` | Default page surface |
| `--ms-bg-sunken` | `#F4F4F4` | Quiet card / contained recipe blocks |
| `--ms-bg-inverse` | `#0B0B0B` | Dark CTA panel, footer, single feature tile |
| `--ms-fg-1` | `#111111` | Primary text |
| `--ms-fg-2` | `#555555` | Secondary text — body prose passes WCAG AA |
| `--ms-fg-3` | `#8A8A8A` | Tertiary — labels only, **fails AA on canvas as body text** |
| `--ms-fg-on-inverse-1` | `#FFFFFF` | Primary text on dark |
| `--ms-fg-on-inverse-2` | `#B5B5B5` | Secondary text on dark |
| `--ms-accent` (lime) | `#D7F25C` | The only accent — sparing use |
| `--ms-accent-soft` | `#ECF7B3` | Softer highlighter |
| `--ms-accent-ink` | `#2E3A0A` | Dark text on lime tiles |

**Contrast caution.** `text-fg-3` on canvas is 3.48:1 — passes for small decorative labels (eyebrows, time stamps) but fails AA for body prose. Use `text-fg-2` for any paragraph text. `text-fg-3` on inverse passes (5.49:1).

**Focus ring.** `.btn` and `.input` use a 2px solid `var(--ms-fg-1)` (black) inner outline + 4px `var(--ms-accent)` (lime) `box-shadow` halo. The black inner carries the 3:1 contrast on every surface; the lime halo carries the brand. On dark surfaces (`btn-ghost-on-dark`, `btn-inverse`), the inner outline flips to `var(--ms-fg-on-inverse-1)` (white). Lime alone fails 3:1 on canvas — never use it as the sole focus indicator.

**Analytics persistence.** PostHog runs with `persistence: 'memory'` on this surface — nothing in cookies, nothing in localStorage. Removes the cookie-consent-banner requirement at the cost of cross-visit dedupe. If a product surface lands here later it must add a real consent banner before upgrading persistence.

### Typography

- **Sans (body + headings)**: Google Sans Flex (variable, 400–700) — the workhorse, applied via `--ms-font-sans`. Released SIL OFL by Google in late 2025; this is the public open-source version of the brand sans, not the older proprietary "Google Sans"
- **Display (highlighter spans only)**: Fuzzy Bubbles (single weight, 400) — applied via `--ms-font-display`, scoped to `.hl` and `.hl-soft` so the hand-drawn letterforms only appear on the single phrase per paragraph that already carries the lime accent. Echoes the site's doodle voice; don't use it elsewhere — the whole point is that it lands as a moment, not a voice. The `.hl` rules also drop size to `0.9em` and tighten tracking to keep its taller, rounder metrics from breaking the host line's rhythm
- All sans woff2 files are self-hosted in `public/fonts/` (Latin subset, ~30–45KB each) and preloaded in `BaseLayout.astro`
- **Mono (eyebrows, code, mono tags)**: JetBrains Mono, 400–500
- **Hand-drawn flourishes inside SVGs**: `font-family: serif; font-style: italic;` (kept inline — the convention for "vs." separators and similar)

### Component utilities (in `@layer components` of `global.css`)

Heading + display:
- `.h-section` — h2 sizing: `clamp(28px, 3vw, 40px)`, weight 500, letter-spacing -0.025em
- `.h-display` — hero h1: `clamp(40px, 5.4vw, 72px)`
- `.h-display-lg` — closing CTA h2: `clamp(36px, 4.2vw, 56px)`

Eyebrows (mono lowercase 12px):
- `.eyebrow` — fg-3 on light surfaces
- `.eyebrow-on-dark` — fg-on-inverse-2 on dark surfaces
- `.eyebrow-on-accent` — accent-ink with 0.65 opacity on lime tiles

Highlights (lime gradient under text):
- `.hl` — strong lime highlighter (the accent moments)
- `.hl-soft` — softer lime, secondary emphasis

Surfaces:
- `.card` — bordered canvas tile with subtle border
- `.codeblock` / `.codeblock-on-dark` — mono code block, two variants
- `.mono-tag` / `.mono-tag-on-dark` — small inline mono tag

Buttons (`.btn` + variants): `btn-primary`, `btn-secondary`, `btn-accent`, `btn-ghost`, `btn-ghost-on-dark`. All pill-shaped (`--r-pill`).

Layout: `.container-x` (max-width 1200px, padded), `.section` (vertical padding 96px).

### Shared UI components

- `src/components/ui/Button.astro` — anchor or button, variant prop
- `src/components/ui/Card.astro` — semantic wrapper, optional hover lift
- `src/components/ui/CodeBlock.astro` — `code` + `variant: 'light' | 'on-dark'`
- `src/components/ui/PencilDoodle.astro` — hero pencil, `variant` + `width` props
- `src/components/ui/LightningDoodle.astro` — closing-CTA lightning bolt, `variant` + `width` props
- `src/components/ui/RangeDoodle.astro` — six product doodles via `kind` prop
- `src/components/ui/YoursPillarDoodle.astro` — Tools/Skills/Knowledge doodles via `kind` prop
- `src/components/ui/BlogDoodle.astro` — blog-page doodles (`journal`, `pencil`, `closed-book`, `paper-stack`) via `kind` prop

When a hand-drawn doodle is reused (or grows past ~12 SVG lines inline), extract it as a UI component with a `kind`/`variant` prop — the `Doodle` family above is the pattern.

## Hand-drawn personality

The site is a sketchbook with a serious thesis. The visual identity carries playfulness on three surfaces:

1. **Doodles** — line-art illustrations that explain concepts (pencil, lightning bolt, key ring, runbook, stack of papers). Conventions below.
2. **Marker-pen typography** — Fuzzy Bubbles on `.hl` / `.hl-soft` only. The highlighted phrase reads as if it were circled with a sharpie. One sharpie moment per paragraph at most.
3. **Editorial annotations** — hand-drawn arrows, asterisks, and margin notes attached to key phrases. Treat them like a copyeditor's pen, not decoration.

The playfulness is specifically *anti-corporate*, not *cute*. A sketchbook sits between a whitepaper and a children's book, and the site lives much closer to the whitepaper end. Specifically:

- **One playful element per moment.** A doodle near a marker highlight near a hand-drawn arrow is three things competing for the same attention — pick the one doing the most work, demote the others.
- **The body voice stays direct.** Hand-drawn type does not give license to hand-drawn copy. No "ooh", no "yay", no exclamation points, no kawaii captions. The marker phrase says the *same* thing it would in Google Sans Flex — the typography just makes it the loudest sentence on the page.
- **No mascots, no characters with names, no faces with personalities.** Stick figures and abstract shapes are fine. A wide-eyed agent character with a name on a t-shirt is not.
- **Restraint is the move.** The first instinct is "more sketchy stuff" — resist it. The marker font feels good *because* the rest of the page is set in a precise sans. Stack two casual surfaces and both lose their punch.

## Doodle conventions

The site's visual personality is hand-drawn line art, not iconography.

- Stroke `#111` (or `currentColor` on dark surfaces), `stroke-width="1.6"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"`
- Slight asymmetry / jitter in paths so they read hand-drawn, not vector-perfect
- All decorative SVGs: `aria-hidden="true"`
- Doodles should **explain** the concept, not decorate. Tools = a key ring (you hand the agent the keys). Skills = a runbook with folded corner. Knowledge = a stack of papers / homework. Choose the metaphor that grounds the copy.
- **Never use `<text>` inside an SVG for content the user might read in flow.** Document text-order includes SVG text nodes, so a stray `?` or `"on it."` inside an illustration appears as an orphan fragment when the page is read top-to-bottom or extracted by SEO crawlers. Replace with paths (curve a `?` glyph) or shapes (3 short lines = "speech bubble has writing").
- Sizing: 80–120px for inline icons in cards, 140–220px for hero/anchor doodles, 60–80px for marginal flourishes (arrows, checks).
- Character doodles (chatbot face / agent figure) > abstract diagrams (loops/lines) for landing personality. The audience remembers a sketched stick figure better than a Venn diagram.

## Voice & copy

### Banned vocabulary

These words must not appear anywhere in marketing copy:

`powerful · revolutionary · seamless · cutting-edge · leverage · empower · unlock · transform · magical · robust · scalable · innovative · intelligent`

(`transform` is OK as a CSS property; the ban is on marketing usage. Verify with grep before claiming a section is clean.)

```bash
grep -niE "powerful|revolutionary|seamless|cutting-edge|leverage|empower|unlock|magical|robust|scalable|innovative|intelligent" src/path/to/file.astro
```

### No mechanics talk

The marketing surface never describes how the agent works internally:

`planner · executor · orchestration · sandbox · retry policy · recovery · knowledge manager · context management`

These are real concepts in the framework but they belong in `/docs`, not in copy aimed at builders. Marketing copy talks about outcomes and the developer's experience.

### Tone

- **Direct, second-person, conversational.** "You" as much as possible. Short sentences. Asides and parentheticals for texture.
- **Specific moments beat abstract claims.** "Sunday morning" lands harder than "weekly." "Eight hours" lands harder than "long-running."
- **Avoid AI-tells.** Triplet rhythms ("X. Y. Z. — clean parallel") read AI-written if used too often. Vary sentence length. Asymmetric clauses feel human.
- **Sketchbook voice, grown-up content.** The site has hand-drawn doodles, marker-pen highlights, and pull-quote asides — but the prose underneath stays direct and technical. The personality lives in the *visuals* and in *which* sentence gets emphasis, not in childish word choice. Playful captions like "Polite. Limited. Sleeps between turns." land because they're matter-of-fact descriptions made into a rhythm. "An agent that does the thing 🚀" does not.
- **No exclamation points. No emoji. No mascot characters.** The typography is allowed to feel like a sketchbook; the words are not.
- **Code samples appear in Hero only.** Other sections explain via prose, doodles, and labeled visuals. Code in every section reads as documentation, not marketing.

### Reader-flow rules

- **Read the section as plain text** before shipping. Strip the visuals and trace sentence-to-sentence — the narrative should flow without the doodles. If a heading appears as a non-sequitur after the previous paragraph, add a connecting word ("Because…", "Why…").
- **Bridge headings**, don't drop in textbook definitions. "An agent isn't a chatbot." landed as a non-sequitur after a paragraph about feature backlog. "Because an agent isn't a chatbot." answers the implicit "why" the previous paragraph raised.
- **One narrative job per section.** When pain and definition compete in the same section, demote one (smaller heading, lower contrast) so reader knows which is the lead.
- **Scan for cross-section repetition before shipping.** On long marketing pages the same idea ("frameworks build it, we built one") tends to land in the hero, the intro, the comparison, and the CTA. Each restatement bleeds engagement. One canonical landing per idea — then move forward.

## Comparison pages

Routes live under `/compare/<competitor>` (see `src/pages/compare/`). Linked from the footer's `compare` column.

These are **fit-assessment** pages, not feature comparisons. If the reader is the competitor's right buyer, the page should send them there.

### Structural pattern

Hero (one-line thesis + competitor named neutrally) → competitor's honest pitch → single concept doodle (e.g. yours-vs-ours horizon) → "what you stop doing" cards (~6, each with a per-card doodle) → fit framework (two columns, ~3 distinct bullets each) → two scenarios (one wins for them, one wins for us) → closing CTA.

### Voice rules specific to compare pages

- **Outcome-first, not architecture-first.** Frame in terms of work the developer does or doesn't do. The architecture is a means, not the pitch — leading with it ("we have a planner / executor / sandbox") is the failure mode.
- **No mechanics talk on compare pages.** The general ban (see Voice & copy) applies double here — `planner`, `executor`, `knowledge manager`, `Firecracker` belong on `/under-the-hood`, never in a compare page.
- **One scenario must genuinely win for the competitor.** If both scenarios end "Midsphere is the right call" the page reads as dishonest and the reader feels it. Concede where the alternative is the right answer.
- **Acknowledge the alternative's legitimacy.** "That's a real product. It's just a different one." Never frame the competitor as outdated, slow, or bureaucratic.

### De-duplication pass (always do this last)

The thesis lands exactly three times: hero h1, concept-doodle heading, closing h2. Middle sections add beats, not restate. Concrete patterns to grep for on review:

- Hero p2 rephrasing p1
- Competitor's-pitch section listing items the "stop doing" cards already cover
- Figcaptions paraphrasing the heading directly above them
- Fit-framework bullets that overlap (control + control, platform + platform)
- Closing body re-listing items the cards already covered
- The triplet AI-tell ("X is hard. Y is hard. Z is hard. We did. We keep. You don't.") — kill on sight

## Personal preferences (Affan)

- **Compact > spacious.** Tighten margins between blocks within a section before adding visual containers. The section feels disconnected when blocks float in cosmic-void whitespace; tight `mt-8`/`mt-10` solves what `bg-sunken` wrappers can't.
- **`bg-sunken` containers can feel weird** wrapping editorial comparisons — the grey rectangle competes with the doodles for visual weight. Prefer cohesion through tight spacing on canvas.
- **Iterates on copy multiple times.** Expect ~5 passes per significant section. Each pass typically targets one specific thing: rhythm, duplicate messaging, AI-feel, narrative bridge.
- **Likes editorial moves**: pull-quotes for closing lines, hand-drawn arrow annotations, lime highlighter on the single phrase that matters in a paragraph (not on every nice phrase). The Fuzzy Bubbles marker treatment on `.hl` belongs to that same family — a typographic version of circling a sentence with a sharpie. One per paragraph; on every-other phrase it stops reading as emphasis.
- **Doodles should explain, not decorate.** When asked to add personality, the answer is usually "draw a thing that conveys the meaning," not "add an icon."
- **Playful but not cute.** Affan keeps reaching for hand-drawn surfaces (doodles, marker font, sketched arrows) and then *holding back* on the prose — the typography does the warmth so the words don't have to. When in doubt, write the sentence flat and let the visual treatment add the personality.

## GEO (Generative Engine Optimization)

For both blog and marketing pages:
- Every `<h1>`/`<h2>`/`<h3>` gets a unique `id` so LLMs can deep-link
- Server-render primary content (Astro default — no client-side fetch for headlines, captions, code samples)
- Use concrete, citable facts ("three lines of code", "ten seconds or eight hours", real product names like Exo / Midsphere)
- One `<h1>` per page; no skipped heading levels
- Schema.org JSON-LD via `SEOHead.astro` on every page

Per `docs/CODING_STANDARDS.md` §5: `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` allowed in `robots.txt`. Track LLM-referrer traffic in PostHog as a real channel.

## Key content

- **Site URL**: `https://midsphere.ai`
- **Platform URL**: `https://platform.midsphere.ai` (primary CTA destination)
- **Docs URL**: `/docs` (secondary CTA — placeholder route)
- **OSS framework on GitHub**: Exo at `github.com/exo-agi`
- **Discord**: `discord.gg/midsphere`
- **Footer tagline**: "Built by people who got tired of agent infrastructure."
- **Pricing tiers**: Free ($0), Lite ($9/mo), Pro ($19/mo) — defined on `/pricing`. Homepage `Pricing` section is a teaser linking to that page.
