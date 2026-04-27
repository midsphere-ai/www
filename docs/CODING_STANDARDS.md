# Midsphere — Coding Standards

These rules apply to any code written against the Midsphere brand — the marketing site, the product UI, internal tools, and prototypes shipped through this design system. They're loaded by `SKILL.md` so an agent working in Claude Code follows them automatically.

---

## 1. Maximum performance

Performance is a default, not an optimization pass.

- **Bundle size.** Keep shipped JS small. Audit before merging — no library lands in the bundle without justification. Prefer the platform (`fetch`, `URL`, `Intl`, native `<dialog>`) over a dependency. Tree-shake aggressively; import named exports, never the whole package (`import { x } from 'pkg'`, never `import * as pkg`).
- **Algorithms.** Mind Big-O. No O(n²) where O(n) works. No nested `.find()` inside a `.map()`. Hash-map lookups beat repeated array scans. Profile before assuming.
- **Network.** Batch and dedupe. Cache aggressively at the edge. Stream where the payload supports it. No request waterfalls — fan out in parallel. Compress (br/gzip) and prefer JSON over heavier formats.
- **Memory.** Release references. Avoid leaking listeners, intervals, observers — every `addEventListener` needs a matching teardown. Don't hold large objects in module-level state.
- **Rendering.** No layout thrash. Use `transform` / `opacity` for motion, not `top` / `width`. Memoize expensive renders. Virtualize long lists (>200 rows).
- **Budget.** Soft target: ≤150KB JS gzipped on the marketing site, ≤300KB on the product app shell. LCP <1.5s, INP <200ms.

## 2. Maximize shared components

DRY at the component level. If a pattern appears twice, factor it on the second use.

- **One source of truth per UI element.** Buttons, inputs, cards, status dots — defined once in a shared kit, imported everywhere. No inline reimplementations.
- **No copy-paste components.** If you find yourself duplicating, stop and extract. A two-line wrapper is fine; a 40-line near-duplicate is a bug.
- **Props over forks.** New variant? Add a prop or a variant key, don't fork the file.
- **Cross-surface reuse.** A `<Button>` works on marketing and in the app. Its appearance is governed by tokens from `colors_and_type.css`, not by where it lives.

## 3. Components stay small with clear separation

- **One concern per component.** Presentational vs. container vs. data-fetching are separate files. A component that fetches, transforms, and renders is three components in a trench coat — split it.
- **Size cap.** Soft limit ~150 lines per component file. If you're over, factor.
- **Props are flat and named.** No god-objects. No `config` props that hide a dozen knobs. Required props first, optional last, sensible defaults.
- **No prop drilling past two levels.** Lift to context or colocate state.
- **Side effects live in hooks.** UI components stay declarative.
- **Naming.** `PascalCase` for components, `camelCase` for functions and props, `SCREAMING_SNAKE` for constants. Files match component name.

## 4. Sentry + PostHog out of the box

Every app built with this system wires both before shipping a single feature.

- **Sentry** for errors and performance.
  - Initialize once at the app entry. Use environment-aware DSNs.
  - Capture unhandled rejections and React error boundaries automatically.
  - Tag releases with the build SHA. Source maps uploaded on every deploy.
  - Strip PII before send (`beforeSend` hook). No emails, tokens, or request bodies in breadcrumbs.
  - Sample rates: `tracesSampleRate: 0.1` in prod, `1.0` in dev. Adjust per surface.
- **PostHog** for product analytics.
  - Initialize once. Identify after auth, never before — anonymous IDs persist.
  - Event names are `verb_object` snake_case (`agent_run_started`, `code_block_copied`).
  - Properties are flat, primitive-typed. No nested objects.
  - Autocapture stays on for marketing; opt-in only for the product app.
  - Feature flags read from PostHog at boot, fall through to a safe default if the SDK is offline.
- **Both are non-blocking.** A failure in either must not break the page. Wrap init in try/catch. Lazy-load on idle.
- **Privacy.** Honor Do-Not-Track. Respect cookie consent before either SDK fires. The marketing site uses PostHog `persistence: 'memory'` so neither cookies nor localStorage are touched, which removes the consent-banner requirement for that surface; product apps with auth must add a real banner before upgrading persistence.

## 5. Accessibility, SEO, and GEO from day one

Not a polish pass — wired in from the first commit.

### Accessibility

- **Semantic HTML first.** `<button>` for actions, `<a>` for navigation, `<nav>` / `<main>` / `<section>` / `<article>` where they fit. ARIA is the patch when semantics fall short, never the default.
- **ARIA labels on every non-text affordance.** Icon-only buttons carry `aria-label`. Inputs pair with `<label>` (visible) or `aria-labelledby` (when visually omitted).
- **State announced.** `aria-expanded`, `aria-selected`, `aria-current`, `aria-busy` reflect real state. Live regions (`aria-live="polite"`) for async results — agent output, toasts, validation errors.
- **Keyboard parity.** Every action reachable by keyboard. Focus visible — Midsphere's `:focus-visible` treatment is a 2px solid `var(--ms-fg-1)` (black) inner outline plus a 4px `var(--ms-accent)` (lime) halo via `box-shadow`; the inner ring carries the WCAG 3:1 contrast on every surface, the halo carries the brand. Focus trapped inside modals; restored on close. No keyboard traps elsewhere. Skip-to-content link at the top of every page.
- **Contrast.** Body text ≥ 4.5:1 against its surface, large text ≥ 3:1. The system's `--fg2` on `--bg` is the floor — don't go lighter.
- **Motion.** Honor `prefers-reduced-motion`. The 150/200ms transitions collapse to 0ms when the user opts out.
- **Forms.** Errors associated via `aria-describedby`. Required fields marked semantically, not just visually.
- **Standard.** WCAG 2.2 AA is the bar. Audit with axe-core in CI; fail the build on new violations.

### SEO

- **Meta on every page.** Unique `<title>` (≤60 chars), `<meta name="description">` (≤160 chars). No template duplicates.
- **Canonical URLs.** Always set `<link rel="canonical">`. One URL per piece of content.
- **Open Graph + Twitter cards.** `og:title`, `og:description`, `og:image` (1200×630), `twitter:card="summary_large_image"`. Test before shipping.
- **Structured data.** JSON-LD for `Organization`, `Product`, `Article`, `BreadcrumbList` where applicable. Validate against schema.org.
- **Sitemap + robots.** `sitemap.xml` auto-generated on build, referenced from `robots.txt`. Robots allows what's public, blocks staging.
- **Performance is SEO.** Core Web Vitals are ranking signals — the perf budget in §1 keeps us in the green.
- **Semantic heading order.** One `<h1>` per page. No skipping levels.
- **Image alt text.** Real, descriptive alt on every meaningful image. `alt=""` only when truly decorative.
- **Internal linking.** Descriptive anchor text — never "click here" or "learn more" alone.

### GEO (Generative Engine Optimization)

LLM-driven discovery is a first-class channel. Optimize for AI surfaces alongside Google.

- **Crawlable by AI.** Allow `GPTBot`, `PerplexityBot`, `ClaudeBot`, `Google-Extended` in `robots.txt` unless legal says otherwise. Don't gate marketing content behind JS-only renders.
- **Server-rendered marketing.** Hero copy, use-case copy, trust line, code samples — all in the initial HTML. No client-side fetch for primary content.
- **Answer-shaped content.** Use cases and docs lead with the answer in plain prose. One claim per sentence. LLMs cite sentences, not vibes.
- **Citable facts.** Concrete numbers ("12 lines of code", "200ms p99"), real product names (Exo, Midsphere), real compliance statements (SOC 2 in progress, GDPR). Avoid vague claims that won't survive a citation pass.
- **FAQ + structured data.** A real FAQ section per product page, marked up with `FAQPage` JSON-LD. Question wording matches how users phrase prompts.
- **Stable URLs and IDs.** LLMs cache. Don't churn slugs. `id` attributes on every heading so models can deep-link.
- **`llms.txt`.** Ship `/llms.txt` summarizing the site's purpose, key URLs, and what's authoritative.
- **Brand mentions over backlinks.** Optimize for being named in answers — clear positioning, distinct vocabulary (the verbs from the voice guide: spawn, plan, execute, recover).
- **Measure.** Track referrals from `chat.openai.com`, `perplexity.ai`, `claude.ai`, `gemini.google.com` in PostHog. Treat as a real channel.

## 6. Don't reinvent the wheel

Lean on the ecosystem when something is genuinely solved. Writing your own date parser, virtual list, or fuzzy matcher is a tax, not a feature.

- **Reach for proven libraries** when the problem is hard, well-defined, and not differentiating: dates (`date-fns`), virtualization (`@tanstack/virtual`), forms (`react-hook-form`), validation (`zod`), state (`zustand` / `jotai`), data-fetching (`@tanstack/query` / `swr`), tables (`@tanstack/table`), markdown (`marked` / `mdx`), code highlighting (`shiki` — server-side, zero runtime). Pick the lightest option that solves the actual problem.
- **Vetting checklist before adopting.** Active maintenance (commits in the last 6 months). Reasonable bundle cost — check on [bundlephobia](https://bundlephobia.com) before installing. Tree-shakeable ESM. TypeScript types first-party or `@types/*`. No nested dependency bombs (`npm ls` should not horrify you). License compatible (MIT/Apache/BSD).
- **Tension with §1.** Performance still wins. A 200KB date library to format three timestamps is wrong — use `Intl.DateTimeFormat`. Justify every dep against the budget.
- **Do not depend on tiny utilities.** Don't pull in `is-odd`, `left-pad`, or single-function packages. Write the four lines.
- **Wrap third-party UI.** Never import a third-party component directly into a feature. Wrap it in a project component (e.g. `<Select>` wraps `react-select`) so swapping the underlying library is a one-file change.
- **Pin and audit.** Lockfile committed. `npm audit` / `pnpm audit` clean before merge. Renovate or Dependabot enabled.

---

## Stack defaults

When building inside this system:

- **TypeScript** strict mode. No `any` without a comment explaining why.
- **React 18+.** Functional components, hooks. No class components.
- **Styling.** CSS variables from `colors_and_type.css` are the source of truth. Use CSS modules or vanilla CSS — no runtime CSS-in-JS that ships parser overhead.
- **Icons.** Lucide only. Tree-shaken named imports (`import { ArrowRight } from 'lucide-react'`).
- **Fonts.** Geist Sans / Geist Mono via `next/font` or self-hosted `.woff2`. No FOUT, no FOIT.
- **Accessibility.** Keyboard-navigable by default. Visible focus rings (the `:focus-visible` 2px `#0070F3` outline from the system). Semantic HTML before ARIA.
- **Testing.** Unit tests for logic, smoke tests for rendering. Don't snapshot whole components.
- **Lint + format.** ESLint + Prettier on save. Pre-commit hook blocks unformatted code.
