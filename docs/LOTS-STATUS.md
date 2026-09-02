# `/lots` feature — status report

**Date:** 27 August 2026
**Scope:** what exists in the codebase today. No code was changed to produce this.
**Related:** `BUILD-STATUS.md` (Phase 5, Open Items #4 and #6), `CLAUDE.md` rule 4
("No invented records").

---

## TL;DR

| Piece | State |
|---|---|
| `/lots` index page | **Does not exist** → bare `/lots` 404s |
| `/lots/[slug]` dynamic route | **Fully built template**, 0 pages generated |
| `Lot` type + accessors | **Exists** (`src/content/lots.ts`), `LOTS = []` |
| Lot data | **None.** Empty array, no stub, no CMS, no JSON |
| `/traceability` → lot links | **No links.** Describes the structure only |
| Slug convention | **Documented in comments**, not enforced anywhere |
| QR generation | **Nothing in the repo.** Assumed external |

---

## 1. `/lots` index page

**Does not exist.** `src/app/lots/` contains only `[slug]/page.tsx` — there is
no `src/app/lots/page.tsx`. There is also no custom `not-found.tsx` anywhere in
`src/app`, so `/lots` falls through to Next's default `/_not-found` (which the
last build prerendered).

The "lots index" role is currently played by **sections on other pages**, all
showing a `Pending` ("Being verified") chip instead of a list:

- `/coffee` — a "Lots / Available lots" section (`src/app/coffee/page.tsx:237`),
  copy: *"Each lot gets its own page carrying origin, process, harvest, quality
  and the producers who grew it. Lot pages are the destination for QR codes
  printed on sacks and sample bags. They publish once per-lot specifications are
  confirmed."* — with a "Published lots · [Pending]" indicator. CTA goes to
  `/traceability`, **not** to `/lots`.
- Homepage traceability section (`src/components/home/sections.tsx:461`) —
  "Published lots · [Pending]".
- `/traceability` PageHeader meta — "Published lots: [Pending]".

Nothing links to `/lots` or `/lots/anything` from nav, footer, or body copy.
The only reference to the path outside the route folder is `src/lib/site.ts:111`,
which builds a WhatsApp prefill message for `/lots/*` visitors.

---

## 2. `/lots/[slug]/page.tsx` dynamic route

**Exists and is complete** — `src/app/lots/[slug]/page.tsx` (231 lines). A
finished "lot passport" template:

- `generateStaticParams()` maps over `publishedLots()` → returns `[]` today.
- `export const dynamicParams = false` → any `/lots/*` URL not in the (empty)
  param list **hard 404s**. No runtime rendering of arbitrary slugs.
- `generateMetadata()` builds title/description/canonical/OG from the lot.
- Renders: deep-surface `PageHeader`; a 3-column `SpecTable` block (Identity /
  Quality / Commercial); a "Who grew this lot" producers section (falls back to
  "Awaiting permissions" `Pending` when none); a closing "Enquire about {lotId}"
  CTA linking `/request-quote?lot={slug}` and `/request-quote#sample`.
- Emits `Product` + `BreadcrumbList` JSON-LD via `productSchema()`
  (`src/lib/schema.ts:160`) — only confirmed (non-null) fields become
  `additionalProperty` entries; no `Offer` node by design.

**Fields it expects** (from the `Lot` interface it imports):

| Field | Type | Notes |
|---|---|---|
| `slug` | `string` | URL slug + printed reference |
| `lotId` | `string` | display, e.g. "Lot 042" |
| `harvestYear` | `number` | |
| `process` | `string` | "Washed" / "Natural" |
| `origin`, `zone`, `country` | `string` | |
| `altitudeMin`, `altitudeMax` | `number \| null` | rendered as "Being verified" when null |
| `grade`, `screenSize`, `cuppingScore`, `moistureContent` | `string \| null` | |
| `packing`, `quantity` | `string \| null` | |
| `producerSlugs` | `string[]` | resolved via `producerBySlug()` from `farmers.ts` |
| `available` | `boolean` | toggles "Available" / "Contracted" |

Note: the page reads `lot.producerSlugs`, but the `Producer` type in `farmers.ts`
has the reverse link named `lots: string[]`. Both sides are typed; neither has
data.

Also note: the CTA links to `/request-quote?lot={slug}`, but neither
`request-quote/page.tsx` nor `EnquiryForm.tsx` reads a `lot` query param — it is
currently silently dropped.

---

## 3. Lot data anywhere in the codebase

**One file, one type, zero data.** `src/content/lots.ts` (48 lines):

```ts
export interface Lot { … }              // the shape in section 2
export const LOTS: readonly Lot[] = []; // empty
export function publishedLots(): Lot[]  // returns [...LOTS]
export function lotBySlug(slug): Lot | undefined
```

Header comment: *"An invented lot is therefore not a placeholder — it is a false
record. None are seeded. `LOTS` fills as the client confirms traceability depth
(Open Item #6) and per-lot specifications (Open Item #4)."*

There is **no** CMS, no content collection, no MDX, no JSON fixture, no
seed/sample lot, not even a commented-out example. `publishedLots()` currently
returns the whole array unfiltered — there is no draft/published flag on `Lot`
beyond `available`, which is a commercial state, not a publish gate (unlike
`farmers.ts`, which gates on `permissionGranted`).

`grep` for `Lot`/`lots` across `src` otherwise only hits: prose copy on
`/coffee`, `/amaro`, `/process`, `/farmers`, the traceability chain labels,
`farmers.ts` (`Producer.lots`), and `sitemap.ts`.

---

## 4. `/traceability` — does it link to `/lots`?

**No links to `/lots` or any lot page.** `src/app/traceability/page.tsx`
documents the *structure* of a lot record without naming one (per its own header
comment and Directive 15 — "No lot ID is invented here").

What it actually contains:

- PageHeader meta: `{ term: "QR destination", detail: "Lot page" }` and
  `{ term: "Published lots", detail: <Pending /> }`.
- A "Lot record fields" table (8 rows: Lot identifier, Origin, Washing station,
  Processing method, Harvest period, Quality assessment, Producers, Shipment)
  with a Status column showing "Confirmed" / "Per lot" / "[Pending]".
- A "QR programme" section built from `TRACEABILITY_FAQS`.
- CTAs at the bottom go to `/request-quote` and `/farmers` — not `/lots`.

### Exact QR / lot-page copy (verbatim)

`/traceability`, "Lot identifier" row — what it holds:

> "The reference printed on the sack and used on all documentation."

`TRACEABILITY_FAQS[1]` (`src/content/faqs.ts:66`), rendered in the QR section:

> **Q: Where do the QR codes on Zoebar sacks lead?**
> A: "QR codes printed on Zoebar sacks and sample bags resolve to that lot's
> page on zoebarbusinessgroup.com. The page carries the lot's origin in Amaro,
> Ethiopia, its processing method, harvest period and quality record, so a buyer
> can check the physical coffee against the published record."

`TRACEABILITY_FAQS[0]`:

> **Q: What information does a Zoebar lot record carry?**
> A: "A Zoebar lot record carries its origin in Amaro (Koore Zone), Ethiopia, the
> processing method applied at an affiliated washing station with Zoebar's direct
> operational oversight, the harvest period, the quality assessment, and the
> producers connected to the lot where they have given documented permission to
> be named."

<!-- Quote paraphrased from an earlier version of TRACEABILITY_FAQS[0]; the live
answer in src/content/faqs.ts has since been reworded (per-lot grade/screen/
moisture/cupping note added, producer clause dropped). Only the washing-station
ownership phrasing is corrected here. -->

Homepage (`src/components/home/sections.tsx:429`):

> "Every lot page is a record: where the coffee grew, who grew it, how it was
> processed and what the quality assessment found. Lot pages are the destination
> for QR codes printed on sacks and sample bags."

`/coffee` (`src/app/coffee/page.tsx:258`):

> "Lot pages are the destination for QR codes printed on sacks and sample bags.
> They publish once per-lot specifications are confirmed."

So the standing promise is: **QR on sack/sample bag →
`zoebarbusinessgroup.com/lots/{that lot}` → a checkable record.** Nothing yet
fulfils it.

---

## 5. Slug format / naming convention for lots

**Referenced in comments only — not enforced, not validated, no helper.** Three
slightly different example formats appear:

| Location | Example given |
|---|---|
| `src/content/lots.ts:15` (`Lot.slug` doc) | `amaro-2026-042` |
| `src/content/lots.ts:15` (`Lot.lotId` doc) | `Lot 042` (separate display field) |
| This report's prompt | `amaro-washed-2026-01` |

`lotBySlug()` does a plain `LOTS.find(l => l.slug === slug)` string match — any
string works. There is no slugify function, no regex guard, no format test in
`qa/`. The `lotId` ("Lot 042") is a separate free-text display field with no
derivation rule linking it to the slug.

`site.ts:111` assumes the slug segment can be uppercased into a lot reference for
the WhatsApp message (`Lot ${id}` where `id = pathname.split("/")[2]?.toUpperCase()`)
— which only reads well for a short slug like `042`, not `amaro-washed-2026-01`.

---

## 6. QR code generation

**Nothing in the repo.** No `qrcode` / `qr-image` / `node-qrcode` dependency in
`package.json`, no `qrserver` / `api.qrserver` URL, no SVG QR component, no build
script, no `/qr` route, no `opengraph-image`-style generator for lot codes.
`grep -rni "qr"` across `src` + `package.json` returns only prose about "QR
codes" and the "QR programme" / "QR destination" labels.

The implicit model in the copy and comments: **someone generates the QR image
outside the codebase** (pointing at `https://zoebarbusinessgroup.com/lots/{slug}`)
and hands it to the printer. The codebase's only responsibility is that the
destination URL resolves — which today it does not, because `LOTS` is empty.

---

## What that leaves to decide (before building)

- **The index page** is the actual gap behind the "404" — `/lots/[slug]` is
  done. An index also means deciding whether it enters the nav / `ROUTES` table
  and how it behaves with zero lots (honest empty state, matching `/journal` and
  `/farmers`).
- **Data shape is already frozen** in `Lot`. If real records need fields it
  lacks (lot-level GPS for EUDR, milling date, shipment/vessel, certifications,
  tasting notes), the interface changes and `productSchema`'s property list with
  it.
- **Slug convention** should be pinned down and ideally enforced (a helper + a
  `qa/` check) before any lot is printed on a physical sack — the URL becomes
  permanent the moment it is on a bag.
- **QR generation** — decide whether it stays external or becomes a repo
  capability (e.g. a per-lot downloadable SVG on the lot page, or an admin
  script).
- **`publishedLots()` has no publish gate** beyond existing in the array;
  `/farmers` and `/journal` both have an explicit one. Consider whether lots
  need a `published` / `draft` flag.
- **`/request-quote?lot=` is a dangling link** from the lot CTA — nothing
  consumes the param.
