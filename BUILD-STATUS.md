# Zoebar Website — Build Status & Handoff

**Last updated:** 21 August 2026
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

**Next task: Phase 6 — build `/journal`, `/guides`, `/about`, `/about/founder`, `/contact`, `/quality`.**
These are currently linked from the navigation and footer but 404. See *Next steps* at the bottom.

---

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 1 — Audit | Repo + source documents | **Done** |
| 2 — Design system | Tokens, primitives, motion | **Done** |
| 3 — Homepage | 11-chapter narrative scroll | **Done** |
| 4 — Story pages | `/amaro` `/process` `/traceability` `/farmers` | **Done** |
| 5 — Commercial | `/coffee` `/lots/[slug]` `/request-quote` `/thank-you` | **Done** |
| 6 — Knowledge | `/journal` `/guides` `/about` `/about/founder` `/contact` `/quality` | **Not started** |
| 7 — SEO/GEO | metadata, schema, sitemap, robots, llms.txt | **Mostly done** — extend per page |
| 8 — Performance | Lighthouse, CWV, a11y audit | **Not started** |
| 9 — Motion polish | Only after static is excellent | **Not started** |

### Routes live now

`/` · `/coffee` · `/amaro` · `/process` · `/traceability` · `/farmers` · `/request-quote` · `/thank-you` (noindex) · `/lots/[slug]` (template, 0 pages)

All prerender as static HTML. `/thank-you` is dynamic (reads `searchParams`).

### Routes still 404 (linked in nav/footer)

`/quality` · `/journal` · `/guides` · `/about` · `/about/founder` · `/contact`

The sitemap correctly excludes them — every route carries a `built` flag in `src/lib/site.ts`, and only `built: true` routes are submitted. **Flip the flag when you build the page, not before.**

---

## Decisions already made (do not relitigate)

| Decision | Resolution | Source |
|---|---|---|
| Colour hierarchy conflict | **Two-density split.** Alabaster `#FFFAF4` is the site base; story surfaces (`/`, `/amaro`, `/farmers`) go deep emerald `#011F1B`. Reconciles the directive (60% Alabaster) with the brand guideline (60% Emerald) and matches Strategy 3.1. | Client, 21 Aug 2026 |
| Canela Deck licence | **Use Canela; licence obtained after the client confirms the design.** Family is named first in `--font-display`; Fraunces renders until the files land. | Client, 21 Aug 2026 |
| "Royal Crimson" `#F0E2CB` | The hex is a warm sand, not a crimson. Name is a label; the hex governs. | Observed |
| Framework | Next.js App Router, statically generated, Vercel-targeted. | Inferred from Strategy 8 (Vercel) |
| Logo | **Not redrawn.** No brand asset files were supplied. `Logo.tsx` renders the wordmark typographically with "Business Group" intact. Drop the official SVG at `public/brand/` and swap the branch. | Brand Guideline |

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
    amaro|process|traceability|farmers|coffee|request-quote|thank-you/
    lots/[slug]/            Lot passport template (0 pages until data exists)
    sitemap.ts              Generated from ROUTES, filtered on `built`
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
                            Pending, SpecTable, Figure, Answer, FaqList
    motion/ScrollReveal     One global IntersectionObserver for all [data-animate]
    home/                   Hero + the 10 homepage sections
    forms/EnquiryForm       Primary conversion form
  content/
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

---

## Verification harness (rebuild after restart)

The Playwright tooling lived in the session scratchpad and **is gone after a restart.** Recreate it — visual and overflow bugs are not catchable by `npm run build` alone:

```bash
mkdir -p /tmp/zoebar-qa && cd /tmp/zoebar-qa
npm init -y && npm install playwright
npx playwright install chromium
```

Then check, with `npm run dev` running:

- **Screenshot** a page at 1440×900 and actually look at it.
- **Overflow** at 360 / 390 / 430 / 768 / 1024 / 1280 / 1440 / 1920 — `document.documentElement.scrollWidth` must equal `clientWidth` on every page.
- **Console errors** must be zero (catch `console` + `pageerror`).
- **Per page:** status 200, exactly one `<h1>`, JSON-LD parses, no `null`/`undefined`/`NaN` in `body.innerText`.

**Current state: all 7 live pages pass all of the above.**

To test enquiry delivery end-to-end, run a webhook receiver and start the built app with `ENQUIRY_WEBHOOK_URL=http://localhost:4101`. Both paths are verified working: unconfigured shows "This enquiry was not sent" without a false redirect; configured redirects to `/thank-you?kind=quote` and posts the full payload.

---

## Blocked on the client

From Strategy §11 (Open Items). These are why so much renders as "Being verified":

| # | Item | Blocks |
|---|---|---|
| 4 | Coffee specifications — grades, screens, cupping bands, MOQ, packing, lead times, Incoterms, port | `/coffee` (13 of 20 fields), `/process`, `/lots` |
| 8 | Farm & washing-station photography — **hard blocker** | Every story surface. All `Figure` placeholders name the exact shot required. |
| 9 | Farmer names, photos, documented permissions | `/farmers` (0 profiles published) |
| 10 | Legal entity details, TRN, addresses | Footer legal block, full Organization schema |
| 11 | CRM / email platform choice | **Enquiry delivery — the primary conversion cannot deliver.** One env var: `ENQUIRY_WEBHOOK_URL` |
| 6 | Traceability depth | `/traceability` status column, lot pages |
| 3 | Canela web licence | Resolved for now — proceed on Canela, licence to follow |
| 2 | Crawler policy sign-off | `public/robots.txt` (written, awaiting approval) |

Also missing: brand asset files (logo SVG, watermarks — the guideline references a "CPE brand assets folder" not in this repo), and a verified WhatsApp number (`WHATSAPP_NUMBER` is `null`, so the WhatsApp action is withheld rather than pointed at a placeholder).

---

## Next steps

**Phase 6 — knowledge & company pages.** For each: build the page, then set `built: true` in `src/lib/site.ts`, and `darkHeader: true` if it opens on a deep surface.

- `/quality` — spec density. Grading, cupping, inspection. Article + FAQPage.
- `/journal` + `/journal/[slug]` — editorial index, **not** a blog card grid. Article schema with real `datePublished`/`dateModified` and a named author. Seed from the LinkedIn archive (Open Item #12) — invent nothing.
- `/guides` + `/guides/[slug]` — the four pillar guides from Strategy 4.2 (grading system; harvest & shipping calendar; importer's documentation checklist; Incoterms). 1,200–2,000 words each, answer-first, cross-linked to `/coffee` and `/amaro` in the first three paragraphs.
- `/about` + `/about/founder` — Organization + BreadcrumbList. Founder story is Open Item #7.
- `/contact` — Organization + ContactPoint. Blocked on Open Item #10 for real details.

**Then Phase 7** (extend `llms.txt` with the new pages; internal-linking pass per Strategy 4.4), **Phase 8** (Lighthouse, CWV against LCP < 2.5s / INP < 200ms / CLS < 0.1, accessibility audit), **Phase 9** (motion polish).

**Also outstanding:** the WhatsApp floating action (Directive 25) — logic exists in `site.ts` (`whatsappMessageFor` handles page-aware prefills including `/lots/[id]`), but no UI ships until a number is verified.
