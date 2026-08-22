# Zoebar Website — Build Status & Handoff

**Last updated:** 22 August 2026
**Stack:** Next.js 16.3.2 (App Router, Turbopack) · React 19.2.8 · Tailwind CSS 4.3.3 · TypeScript
**Source of truth:** `docs/Zoebar_Strategy_CoffeeFirst.pdf`, `docs/Zoebar_Company_Foundation_Creative_Direction_Brief.docx`, `docs/Zoebar branding guideline.pdf`

---

## Resume in 30 seconds

```bash
cd ~/Documents/Zoebar-website
npm run dev            # http://localhost:3000
npm run build          # must stay clean
npx tsc --noEmit       # must stay clean
npm run lint           # must stay clean
```

Then, against a **production** build (never `next dev`):

```bash
npx next start -p 3215
node qa/qa.mjs http://localhost:3215      # see qa/README.md for the one-off install
node qa/a11y.mjs http://localhost:3215
```

**All nine build phases are complete.** Every remaining item is blocked on the
client, not on the build. See *Next steps* at the bottom.

---

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 1 — Audit | Repo + source documents | **Done** |
| 2 — Design system | Tokens, primitives, motion | **Done** |
| 3 — Homepage | 11-chapter narrative scroll | **Done** |
| 4 — Story pages | `/amaro` `/process` `/traceability` `/farmers` | **Done** |
| 5 — Commercial | `/coffee` `/lots/[slug]` `/request-quote` `/thank-you` | **Done** |
| 6 — Knowledge | `/journal` `/guides` `/about` `/about/founder` `/contact` `/quality` | **Done** |
| 7 — SEO/GEO | metadata, schema, sitemap, robots, llms.txt, social card | **Done** — revisit as content lands |
| 8 — Performance | CWV, page weight, accessibility audit | **Done** — 0 axe violations, LCP 260ms worst, CLS 0 |
| 9 — Motion polish | Only after static is excellent | **Done** — audited, one hardening; the system was already sound |

### Phase 8 result

Measured on a production build at 1440×900. Full numbers regenerate from
`qa/`; these are the figures the phase closed on.

| Metric | Budget | Worst measured |
|---|---|---|
| LCP | < 2.5s | **260ms** (`/guides/incoterms-green-coffee`) |
| CLS | < 0.1 | **0.0000** on all 18 routes |
| axe violations (WCAG 2.0/2.1/2.2 A+AA) | 0 | **0** on all 18 routes |
| Horizontal overflow, 8 widths 360→1920 | none | **none** |
| Console errors | 0 | **0** |
| Page weight | — | 357KB → **288KB** |

LCP and TTFB are localhost figures and will rise over a real network; the
structure behind them (static HTML, no render-blocking JS, a CSS-driven hero
that does not wait for hydration) is what makes them defensible.

Accessibility went from **399 axe violations to 0**. Every one of the 399 was
`color-contrast`, and effectively all of them traced to a single hardcoded
grey, `#7b8079`, used 73 times.

### Routes live now

`/` · `/coffee` · `/amaro` · `/process` · `/quality` · `/traceability` · `/farmers` · `/guides` · `/guides/[slug]` (4 pages) · `/journal` (noindex, 0 entries) · `/about` · `/about/founder` (noindex) · `/contact` · `/request-quote` · `/thank-you` (noindex) · `/lots/[slug]` (template, 0 pages)

Plus `/opengraph-image` — the 1200×630 social card, generated once at build
time by `next/og` and served as a static PNG. The root layout had declared
`summary_large_image` and a full openGraph block with no image behind it, so
every share rendered a large card with an empty image well.

23 routes prerender as static HTML. `/thank-you` is the only dynamic route (reads `searchParams`).

`public/` no longer carries the Create Next App boilerplate (`next.svg`,
`vercel.svg`, `file.svg`, `globe.svg`, `window.svg`). Nothing referenced them,
and they meant the client's own domain was serving the Next.js and Vercel
logos.

### Routes that 404

None. Every path linked from the navigation or footer resolves.

### Shipping vs indexing — a Phase 6 refinement

These are now **two separate decisions**, both carried in `src/lib/site.ts`:

- `built: true` means the route ships. Anything linked from the nav or footer **must** be built, or the link 404s.
- `noindex: true` keeps a shipped route out of the sitemap and sets `robots: { index: false, follow: true }` on the page.

Two routes are currently `built: true` **and** `noindex: true`, because they exist but have no verified content to index:

| Route | Why noindex | Flip it when |
|---|---|---|
| `/journal` | `ENTRIES` is empty; an index with no entries is thin content | The first real entry is published |
| `/about/founder` | Open Item #7 — the founder's account is not written | The founder's own words land |

Flipping means: remove `noindex` in `site.ts` **and** the `robots` block in the page file. Both are commented at the point of change.

---

## Decisions already made (do not relitigate)

| Decision | Resolution | Source |
|---|---|---|
| Colour hierarchy conflict | **Two-density split.** Alabaster `#FFFAF4` is the site base; story surfaces (`/`, `/amaro`, `/farmers`) go deep emerald `#011F1B`. Reconciles the directive (60% Alabaster) with the brand guideline (60% Emerald) and matches Strategy 3.1. | Client, 21 Aug 2026 |
| Canela Deck licence | **Use Canela; licence obtained after the client confirms the design.** Family is named first in `--font-display`; Fraunces renders until the files land. | Client, 21 Aug 2026 |
| "Royal Crimson" `#F0E2CB` | The hex is a warm sand, not a crimson. Name is a label; the hex governs. | Observed |
| Framework | Next.js App Router, statically generated, Vercel-targeted. | Inferred from Strategy 8 (Vercel) |
| Logo | **Not redrawn.** No brand asset files were supplied. `Logo.tsx` renders the wordmark typographically with "Business Group" intact. Drop the official SVG at `public/brand/` and swap the branch. | Brand Guideline |
| Guide authorship standard | **Two standards, never merged.** General trade information (grading structures, Incoterms rules, documentation sets) is public reference material and is explained in full. Figures that vary by regulator, contract or revision — defect allowances, tariff rates, EUDR application dates — are identified as variable and the reader is pointed at the authoritative source, rather than frozen into a table that quietly goes stale. Anything about **Zoebar's own** coffee obeys the trust rule with no exception. Stated at the top of `src/content/guides.ts` and on `/guides`. | Phase 6, 22 Aug 2026 |
| Guide publication dates | **The authoring date is real and is used.** `datePublished` / `dateModified` on a guide are the dates it was written and last revised (`AUTHORED` in `guides.ts`). Not backdated to look established, not refreshed to look current. `sitemap.ts` reads `dateModified` for `lastModified` rather than the build timestamp. | Phase 6, 22 Aug 2026 |
| FAQ admissibility | **Refined.** "The value is being verified" is a non-answer and stays out of `faqs.ts`. "Zoebar publishes this figure only once it is confirmed, and says so until then" is a *stated policy*, which is a real answer to a question buyers ask — and it is the differentiator. Policy questions are admissible; missing values are not. Recorded in the header comment of `src/content/faqs.ts`. | Phase 6, 22 Aug 2026 |
| Long-form content format | **Data, not MDX.** Guides and journal entries are typed `Block[]` (`src/content/blocks.ts`) rendered by `components/primitives/Prose`. One renderer, type-checked content, and specification tables that are guaranteed to be real `<table>` elements rather than whatever a markdown pipeline emits. Inline links use `[label](/path)` and nothing else — a link parser, not a markdown engine, so there is no HTML passthrough to sanitise. | Phase 6, 22 Aug 2026 |

---

## Non-negotiable rules

These come from the client's own documents. Breaking one is a correctness bug, not a style choice.

1. **The trust rule.** *"We would rather say 'we are verifying that information' than provide an unsupported claim."* Unverified facts are `null` in `src/lib/org.ts` and `src/content/*`. `prune()` in `src/lib/schema.ts` strips nulls recursively, so an invented value **cannot** reach a page or structured data. Never replace a `null` with a plausible number.
2. **Amaro / Sidama accuracy.** Amaro is an administrative zone (Koore Zone) and is **not** part of the Sidama Region, but its coffee is commonly traded within the broader Sidama category. **Both halves always appear together.** Single source: `ORIGIN.categoryNote`. This is the site's sharpest ranking asset (Strategy 4.1).
3. **Producer dignity.** Farmers are skilled producers. Never charity, poverty or rescue framing. A profile cannot publish without documented permission — enforced by `publishedProducers()` in `src/content/farmers.ts`, the only accessor pages may use.
4. **No invented records.** No lot IDs, no producer names, no cupping scores, no legal details. A fabricated lot page with a QR code pointing at it is a false record about physical coffee.
5. **Specifications are real HTML tables.** Never images, never div grids (Strategy 4.3).
6. **"Business Group" is never dropped** from the wordmark (Brand Guideline).
7. **Removed architecture:** `/produce`, `/produce/cold-chain`, `/hospitality` and all three-division framing. Do not reintroduce.

---

## Where things live

```
src/
  app/
    layout.tsx              Fonts, metadata, hreflang scaffolding, Org+WebSite JSON-LD
    globals.css             ALL design tokens + motion system
    page.tsx                Homepage (11 chapters)
    amaro|process|quality|traceability|farmers|coffee|request-quote|thank-you/
    about/ about/founder/   Company + founder (founder noindex until written)
    guides/  guides/[slug]/ Four pillar reference guides
    journal/ journal/[slug] Editorial index (noindex, 0 entries) + entry template
    contact/                Enquiry routes + the enquiry form
    lots/[slug]/            Lot passport template (0 pages until data exists)
    sitemap.ts              ROUTES filtered on `built && !noindex`, plus guide
                            and journal slugs from their content modules
  lib/
    org.ts                  CANONICAL ENTITY. All company/origin facts. Single source.
    schema.ts               Schema builders + prune() + citableSummary()
    site.ts                 Routes, nav, density, built/darkHeader flags, WhatsApp
    enquiry.ts              Enquiry delivery + server-side validation (server-only)
    enquiry-state.ts        Form state shape (kept OUT of the "use server" module)
    clsx.ts
  components/
    layout/                 Navigation, Footer, PageHeader, Breadcrumbs, Logo
    primitives/             Section, Container, Eyebrow, Rule, Button, Stat,
                            Pending, SpecTable, Figure, Answer, FaqList,
                            Prose (RichText + Blocks — the long-form renderer)
    motion/ScrollReveal     One global IntersectionObserver for all [data-animate]
    home/                   Hero + the 10 homepage sections
    forms/EnquiryForm       Primary conversion form (reused on /contact)
  content/
    blocks.ts               Shared long-form Block model + word count helpers
    guides.ts               The four pillar guides, as data
    journal.ts              Journal entry model + editorial standard (0 entries)
    faqs.ts  coffee.ts  farmers.ts  lots.ts
public/  robots.txt (commented, dated rationale)  llms.txt
docs/    TYPEFACE.md (substitution record) + the three client documents
```

---

## Traps already hit — do not reintroduce

Each of these was a real bug found in the browser, not theory.

1. **Tailwind v4 token collision.** `@theme { --container-full: 96rem }` **silently redefines the built-in `w-full`** from `width:100%` to a fixed 96rem, overflowing the whole site (scrollWidth 2535 in a 1440 viewport). Token is now `--container-page`. **Never name a `--container-*` / `--color-*` token after a Tailwind built-in.**
2. **CSS comment termination.** A comment containing `*/` (e.g. writing `w-*/max-w-*`) closes the comment early and breaks the stylesheet. Don't put `*/` inside comment prose.
3. **`"use server"` exports.** Every export from a server-action module must be an async function. Exporting a plain object compiles but arrives `undefined` at runtime and crashes prerendering. Hence `enquiry-state.ts`.
4. **CSS Grid `min-width: auto`.** A grid item containing a table expands its track past the viewport even with `overflow-x-auto` on the wrapper. **Add `min-w-0` to any grid item hosting a table.**
5. **Narrow grid tracks + nowrap chips.** A 12-column grid with `gap-8` leaves ~30px tracks at 768px — too narrow for the 129px `Pending` chip. Use intrinsic tracks (`grid-cols-[auto_minmax(0,1fr)_auto]`) where a fixed-width child sits in a column.
6. **Pre-hydration DOM mutation.** An inline script adding a class to `<html>` trips a React hydration mismatch. The scroll-reveal hidden state is gated on `@media (scripting: enabled)` instead — pure CSS, no script, and content stays visible without JS.
7. **Nav contrast.** The inverted navigation is driven by `darkHeader` in the route table, **not** by `pathname === "/"`. A new page opening on a deep surface must set `darkHeader: true` or the wordmark renders dark-on-dark.
8. **Hero margin devices.** The altitude rail lives on the **right** edge, bounded to the upper band. On the left it collided with the display type.
9. **Turbopack rejects a linked `node_modules`.** In a git worktree, junctioning or symlinking `node_modules` to the main checkout makes `next build` panic: *"Symlink [project]/node_modules is invalid, it points out of the filesystem root"*. `tsc` follows the link happily, so this only surfaces at build. **Run a real `npm install` inside the worktree.**
10. **Literal "null" / "undefined" in prose trips the QA text check.** Two guide sentences used the word "undefined" in its ordinary English sense and failed the placeholder scan. The guard is worth more than the phrasing — **rephrase the prose, do not loosen the check.**
11. **`Eyebrow` takes no `id`.** Its props are `children`, `className`, `index`, `as`. Labelling a region with `aria-labelledby` needs a plain element with an `id`, not an `Eyebrow`.
12. **Sentence-merging a fact lowercases its proper nouns.** The footer ran `OPERATIONS.ethiopiaStatus.toLowerCase()` to drop a sentence-cased fact mid-sentence, rendering "addis ababa". Fixed with `sentenceMerge()` in `Footer.tsx`, which lowercases only the leading character. Any new mid-sentence reuse of an `org.ts` string must do the same.
13. **A full-page screenshot does not fire the scroll-reveal.** `[data-animate]` elements below the initial viewport photograph as blank panels in a `fullPage` capture, which looks exactly like a rendering bug. Scroll the section into view and re-check computed `opacity` before treating it as one. The same trap has a timing half: after scripting a fast scroll, a stagger of 45–135ms on top of a 750ms transition needs **~2s** to settle. Measuring sooner reports revealed content as still hidden.
14. **The text hierarchy has a floor, and it is 4.5:1.** The palette expressed five tiers of quiet by getting progressively lighter, and the bottom two — `#7b8079` and `#a8a294` — could not meet AA on any light surface. All 399 axe violations were these. Below `--color-text-muted` the tiers now separate by **size, weight and tracking**, not by washing out contrast. Never add a grey without measuring it against **both** alabaster `#fffaf4` and bone `#efe9de`; bone is darker and fails first.
15. **Opacity is not a hierarchy device on text.** `Eyebrow` used `opacity-70` on the index and `opacity-40` on the em-dash so it would adapt to any inherited colour. Measured, those were 2.39:1 and 1.60:1. The minimum opacity that still clears 4.5:1 across every surface this site uses is **0.95** — indistinguishable from 1. Opacity on text is only affordable where the base has real headroom (the hero's `·` separators sit on sand-over-emerald at 13.56:1, so `opacity-70` there is fine at 7.15:1).
16. **Deep-surface colours must be measured against the gradient, not the base.** `.story-atmosphere` is emerald plus two radial washes, and it lifts to `#143833` at its lightest. A `meta-inverse` chosen against flat `#011f1b` measured 5.41:1 there and only **4.00:1** on the wash. `qa/gradient.mjs` renders the gradient in isolation to find that ceiling and keeps `#879389` in its list as a regression guard. Re-run it if the wash is ever edited.
17. **A component that colours itself must learn the surface from CSS, not a prop.** `Pending` took an `onDark` prop, and `/farmers` and `/about/founder` both passed a `<Pending />` into a `surface="deep"` `PageHeader` without it — muted-on-emerald at 3.88:1. Deep surfaces now redeclare `--pending-fg`/`--pending-border`/`--pending-dot`, so the chip adapts on its own. This is the same failure family as the `darkHeader` trap (#7): **anything a caller must remember, a caller will eventually forget.**
18. **Duplicate DOM ids on a repeated form.** `/request-quote` renders `EnquiryForm` twice (quote, and sample at `#sample`) and every input id was hardcoded, so each label in the second form pointed at the **first** form's input. `useId()` now scopes the ids. The `name` attributes are untouched on purpose — the server action reads those from `FormData`.
19. **Declared axes and weights are downloaded whether or not they are used.** `next/font` ships the weight axis alone by default. Fraunces was requesting `SOFT` and `WONK` purely so a comment could describe them as "set to 0" — nothing ever set `font-variation-settings`, and 0 is each axis's default. That cost **118KB of a 357KB page**. Poppins declared four weights when only 400 and 500 appear anywhere. Removing both took the page to 288KB with identical rendering.
20. **Lint ignored `.next` only at the repo root.** `globalIgnores([".next/**"])` does not match a nested checkout, so a git worktree under `.claude/worktrees/` put its own build output in scope and `npm run lint` reported **3,952 problems in generated Turbopack bundles**. Patterns are now anchored with `**/`. If lint output suddenly explodes, check whether it is linting code nobody wrote.
21. **Stopping the shell does not always free the port.** Killing the task that ran `next start` can leave the node process holding the port; the next `next start` dies with `EADDRINUSE` while the stale server keeps answering. One audit run against that half-dead server reported **385 phantom `target-size` violations** because pages were being served without CSS, so every link measured 17px tall. Kill by port, and distrust any result that looks structurally impossible.

    The same trap has a second form: **`npm run build` while `next start` is running** invalidates the chunk hashes underneath it, so the already-served HTML asks for JS files that no longer exist and every route reports console errors. That looks exactly like a site-wide regression and is not one. Always **stop the server, build, then start again** — in that order.
22. **Do not hand-roll contrast measurement.** Three attempts, three distinct classes of false positive: walking ancestors for a background resolved the fixed nav over the hero as alabaster-on-alabaster (1:1); compositing `elementsFromPoint` could not see through `backdrop-filter` or ancestor opacity; sampling rendered pixels picked up Chrome's subpixel-antialiasing fringes and reported orange and blue foregrounds for grey text. **axe-core owns contrast.** It resolves stacking correctly and returns `incomplete` rather than guessing.

---

## Verification harness — now in the repo at `qa/`

**It no longer has to be rebuilt after a restart.** The scripts are committed;
only the dependencies are on demand, because Playwright pulls a browser binary
that has no business in the install path of a static marketing site. Full
instructions and the per-script breakdown are in **`qa/README.md`**.

```bash
npm i --no-save playwright @axe-core/playwright axe-core pngjs
npx playwright install chromium

npm run build && npx next start -p 3215
node qa/qa.mjs    http://localhost:3215   # 272 assertions across 18 routes
node qa/a11y.mjs  http://localhost:3215   # axe-core, WCAG 2.0/2.1/2.2 A+AA
node qa/motion.mjs http://localhost:3215  # reveal integrity
node qa/weight.mjs http://localhost:3215  # payload breakdown
```

`qa.mjs` covers status, one `<h1>`, `lang`, title, description, canonical,
JSON-LD parsing, no `null`/`undefined`/`NaN` in `body.innerText`, structural
a11y, console errors, LCP/CLS, horizontal overflow at 8 widths from 360 to
1920, the skip link being the first tab stop, reduced motion, and a no-JS
render. It deliberately does **not** check contrast — see trap 22.

Still worth doing by hand, because no script judges it: **screenshot a page at
1440×900 and actually look at it.** Mind trap 13 in both halves.

Not yet automated, and still worth asserting when the route table changes:
`meta[name="robots"]` should match `site.ts` — `/journal` and `/about/founder`
report `noindex, follow`, every other built route reports `index, follow`.

**Current state: 272 passed / 0 failed, and 0 axe violations, on all 18 routes**
(23 prerendered routes; `/thank-you` is covered with a query string, while
`/lots/[slug]` and `/journal/[slug]` generate no pages yet).

The ~192 axe `incomplete` results are not failures and not ignorable: axe will
not guess a background behind a gradient. They were verified by hand with
`qa/gradient.mjs` — see trap 16.

To test enquiry delivery end-to-end, run a webhook receiver and start the built app with `ENQUIRY_WEBHOOK_URL=http://localhost:4101`. Both paths are verified working: unconfigured shows "This enquiry was not sent" without a false redirect; configured redirects to `/thank-you?kind=quote` and posts the full payload.

---

## Blocked on the client

From Strategy §11 (Open Items). These are why so much renders as "Being verified":

| # | Item | Blocks |
|---|---|---|
| 4 | Coffee specifications — grades, screens, cupping bands, MOQ, packing, lead times, Incoterms, port | `/coffee` (13 of 20 fields), `/process`, `/quality`, `/lots`, and the pending blocks in three of the four guides |
| 8 | Farm & washing-station photography — **hard blocker** | Every story surface. All `Figure` placeholders name the exact shot required. |
| 9 | Farmer names, photos, documented permissions | `/farmers` (0 profiles published) |
| 10 | Legal entity details, TRN, addresses, telephone, email | Footer legal block, full Organization schema, `/about` company table, **and `/contact` — every direct channel except the form** |
| 7 | Founder story | `/about/founder` (noindex until it lands) |
| 12 | LinkedIn archive to seed the journal | `/journal` (noindex, 0 entries) |
| 11 | CRM / email platform choice | **Enquiry delivery — the primary conversion cannot deliver.** One env var: `ENQUIRY_WEBHOOK_URL` |
| 6 | Traceability depth | `/traceability` status column, lot pages |
| 3 | Canela web licence | Resolved for now — proceed on Canela, licence to follow |
| 2 | Crawler policy sign-off | `public/robots.txt` (written, awaiting approval) |

Also missing: brand asset files (logo SVG, watermarks — the guideline references a "CPE brand assets folder" not in this repo), and a verified WhatsApp number (`WHATSAPP_NUMBER` is `null`, so the WhatsApp action is withheld rather than pointed at a placeholder).

---

## What Phase 6 shipped

- **`/quality`** — the raw and cup assessments, the seven quality control points and who owns each, the (empty) quality specification, and the position on why the gaps are visible. Article + FAQPage + BreadcrumbList.
- **`/guides` + four guides** — `ethiopian-coffee-grading`, `harvest-and-shipping-calendar`, `import-documentation-checklist`, `incoterms-green-coffee`. Roughly 1,400–1,900 words each, answer-first, each cross-linking `/coffee` and `/amaro` inside the first three paragraphs. Article (with real dates and a named author) + FAQPage + BreadcrumbList per guide; CollectionPage + ItemList on the index.
- **`/journal` + `/journal/[slug]`** — the editorial index with the publishing standard stated up front, an honest empty state, and a complete entry template generating zero pages. Noindex until an entry lands.
- **`/about`** — the company, the promise in order, the structure table (with legal details pending), and who Zoebar works with. AboutPage + FAQPage + BreadcrumbList, all referencing the one Organization node.
- **`/about/founder`** — pending, and explicit about why a founder's account cannot be written for them. Noindex.
- **`/contact`** — the channel table with each direct channel's real status, the enquiry form (the same server action as `/request-quote`), and what to include in a first message. ContactPage + FAQPage + BreadcrumbList. `contactPageSchema()` emits no `ContactPoint` at all while telephone and email are null, rather than an empty one.

New schema builders in `lib/schema.ts`: `collectionSchema()`, `contactPageSchema()`, `aboutPageSchema()`. `llms.txt` now lists every built page, the four guides, and an explicit "not yet published" section so an engine does not infer content that is absent.

---

## What Phases 7–9 changed

Nothing in this pass altered a single word of published copy, a fact, or a
schema value. The trust rule and the Amaro/Sidama rule were not touched.

**Accessibility — 399 axe violations to 0.**
- `#7b8079` (73 uses) → `--color-meta` `#5f645d`; `#a8a294` (27) → `--color-faint` `#6b6659`; `#6f7a72` (4) → `--color-meta-inverse` `#96a299`. Named tokens now, not arbitrary hexes, each carrying its measured ratio in a comment.
- `Eyebrow` lost `opacity-70` / `opacity-40`; the index reads as secondary through tabular figures and the em-dash instead (trap 15).
- Deep surfaces declare `--pending-*`, so a `Pending` chip adapts to its surface without a prop. Fixes the untagged chips on `/farmers` and `/about/founder` (trap 17).
- `EnquiryForm` scopes its ids with `useId()`. `/request-quote` renders it twice, and every label in the second form had been pointing at the first form's input (trap 18).

**Performance — 357KB to 288KB, with identical rendering.**
- Fraunces dropped the `SOFT` and `WONK` axes, which nothing ever set: 118KB → 66KB.
- Poppins dropped weights 300 and 600, which appear nowhere: 4 files → 2.

**SEO — `/opengraph-image`.** Typographic, brand-coloured, built from `ORG`/`ORIGIN` only. It uses the renderer's default sans on purpose: Canela is unlicensed and Fraunces is a stand-in, and neither belongs baked into a cached social card.

**Motion — audited, essentially unchanged.** The system was already right: the hero animates from CSS keyframes so the LCP element never waits on hydration, the hidden state is gated on `@media (scripting: enabled)` so it cannot strand content, and reduced motion is honoured. One hardening: `ScrollReveal` now observes `[data-reveal-line]` as well as `[data-animate]`, so a reveal-line can no longer be stranded by being placed outside an animated ancestor.

**Tooling.** `qa/` is committed (trap 20 fixed `eslint.config.mjs` along the way — it was linting a nested worktree's build output and reporting 3,952 phantom problems).

---

## Next steps

**Every build phase is done. Nothing further is blocked on engineering.**
What remains is content, and one env var.

Two things a future session should *not* mistake for outstanding work:

- **INP was not measured.** It needs real interaction, and the only meaningful
  interaction on the site is the enquiry form, which cannot complete a
  submission until Open Item #11 lands. Long tasks are 0–2 per page and the
  client bundle is one `IntersectionObserver`, so there is no reason to expect
  a problem — but it is unmeasured, not passed. Measure it with the form live.
- **Lighthouse was not run.** The checks in `qa/` cover its Performance,
  Accessibility and Best-Practices signals directly and with better precision
  (axe-core is what Lighthouse uses for accessibility). Run Lighthouse against
  the deployed Vercel URL if a headline score is wanted for the client; do not
  run it against localhost and quote the number.

**Content work that unblocks indexing**, in order of value:

1. **Open Item #4** — coffee specifications. Fills `/coffee`, `/quality`, `/process`, the pending blocks in three guides, and the lot template.
2. **Open Item #12** — the LinkedIn archive. First real journal entry, then flip `/journal` to indexable.
3. **Open Item #7** — the founder's account. Then flip `/about/founder`.
4. **Open Item #10** — legal details, telephone, email. Fills the footer, `/about`, `/contact` and the Organization schema simultaneously, because all four read from `org.ts`.

**Also outstanding:** the WhatsApp floating action (Directive 25) — logic exists in `site.ts` (`whatsappMessageFor` now handles `/guides/*` as well as `/lots/[id]`), but no UI ships until a number is verified.
