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

**Next task: Phase 8 — performance, Core Web Vitals and the accessibility audit.**
No route 404s any more. See *Next steps* at the bottom.

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
| 7 — SEO/GEO | metadata, schema, sitemap, robots, llms.txt | **Done for every built route** — revisit as content lands |
| 8 — Performance | Lighthouse, CWV, a11y audit | **Not started** |
| 9 — Motion polish | Only after static is excellent | **Not started** |

### Routes live now

`/` · `/coffee` · `/amaro` · `/process` · `/quality` · `/traceability` · `/farmers` · `/guides` · `/guides/[slug]` (4 pages) · `/journal` (noindex, 0 entries) · `/about` · `/about/founder` (noindex) · `/contact` · `/request-quote` · `/thank-you` (noindex) · `/lots/[slug]` (template, 0 pages)

22 pages prerender as static HTML. `/thank-you` is the only dynamic route (reads `searchParams`).

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
13. **A full-page screenshot does not fire the scroll-reveal.** `[data-animate]` elements below the initial viewport photograph as blank panels in a `fullPage` capture, which looks exactly like a rendering bug. Scroll the section into view and re-check computed `opacity` before treating it as one.

---

## Verification harness (rebuild after restart)

The Playwright tooling lived in the session scratchpad and **is gone after a restart.** Recreate it — visual and overflow bugs are not catchable by `npm run build` alone:

```bash
mkdir -p /tmp/zoebar-qa && cd /tmp/zoebar-qa
npm init -y && npm install playwright
npx playwright install chromium
```

Then check, against `npm run build && npm start` (the production output, not `next dev`):

- **Screenshot** a page at 1440×900 and actually look at it — but see trap 13: a `fullPage` capture leaves `[data-animate]` sections blank.
- **Overflow** at 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 — `document.documentElement.scrollWidth` must equal `clientWidth` on every page.
- **Console errors** must be zero (catch `console` + `pageerror`).
- **Per page:** status 200, exactly one `<h1>`, JSON-LD parses, no `null`/`undefined`/`NaN` in `body.innerText`.
- **`meta[name="robots"]`** — assert it matches the route table. `/journal` and `/about/founder` must report `noindex, follow`; every other built route must report `index, follow`.

**Current state: all 17 live pages pass all of the above** (22 prerendered routes; `/thank-you`, `/lots/[slug]` and `/journal/[slug]` are excluded from the sweep — the first is dynamic, the other two generate no pages).

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

## Next steps

**Phase 8 — performance and accessibility.** Lighthouse and CWV against LCP < 2.5s / INP < 200ms / CLS < 0.1; full accessibility audit. The four guide pages are the longest documents on the site and are the natural stress test.

**Then Phase 9** (motion polish, only after static is excellent).

**Content work that unblocks indexing**, in order of value:

1. **Open Item #4** — coffee specifications. Fills `/coffee`, `/quality`, `/process`, the pending blocks in three guides, and the lot template.
2. **Open Item #12** — the LinkedIn archive. First real journal entry, then flip `/journal` to indexable.
3. **Open Item #7** — the founder's account. Then flip `/about/founder`.
4. **Open Item #10** — legal details, telephone, email. Fills the footer, `/about`, `/contact` and the Organization schema simultaneously, because all four read from `org.ts`.

**Also outstanding:** the WhatsApp floating action (Directive 25) — logic exists in `site.ts` (`whatsappMessageFor` now handles `/guides/*` as well as `/lots/[id]`), but no UI ships until a number is verified.
