# Guides

The reference articles at `/guides` — what they are, the rules that govern what
they may say, and how to edit or add one. **7 guides** live: the four pillars
fixed by Strategy 4.2, plus three buyer-mechanics guides added 2026-08-27.

**Last updated:** 27 August 2026
**Source of truth:** Strategy §4.2 (the four pillars), §5.2 (answer-first),
§4.3 (real tables, not markdown). Editorial standard header in
`src/content/guides.ts`. Decisions in `BUILD-STATUS.md`.

---

## What this is

**Maintained trade-reference documents**, not a blog and not marketing. They
exist because the questions they answer are searched constantly and answered
badly. Ordered in `GUIDES` as a **reading sequence**, not alphabetically: the
buying process first as orientation, then the four Strategy 4.2 pillars, then
the payment and container detail guides.

| Order | Slug (`navTitle`) | Title | Answer-first question | Sections | FAQs | Authored |
|---|---|---|---|---|---|---|
| 1 | `buying-green-coffee-process` (The buying process) | Buying green coffee, step by step. | "What is the process for buying green coffee from Zoebar?" | 7 | 3 | 2026-08-27 |
| 2 | `ethiopian-coffee-grading` (Ethiopian coffee grading) | Ethiopian coffee grading, explained. | "How is Ethiopian coffee graded?" | 6 | 3 | 2026-08-22 |
| 3 | `harvest-and-shipping-calendar` (Harvest & shipping calendar) | The Ethiopian harvest and shipping calendar. | "When is Ethiopian coffee harvested, and when does it arrive?" | 5 | 3 | 2026-08-22 |
| 4 | `import-documentation-checklist` (Importer's documentation checklist) | The importer's documentation checklist. | "What documents do I need to import Ethiopian green coffee?" | 7 | 3 | 2026-08-22 |
| 5 | `incoterms-green-coffee` (Incoterms for green coffee) | Incoterms 2020 for green coffee buyers. | "Which Incoterms rule should a green coffee buyer use?" | 7 | 3 | 2026-08-22 |
| 6 | `green-coffee-payment-terms` (Payment terms & trade finance) | Payment terms and trade finance for green coffee. | "What payment terms are standard in green coffee trade?" | 6 | 3 | 2026-08-27 |
| 7 | `green-coffee-container-loading` (Container loading & capacity) | Container loading and shipping specifications for green coffee. | "How much green coffee fits in a shipping container?" | 6 | 3 | 2026-08-27 |

Reading time: pillars ~1,700 words (8 min), the three new guides ~1,300 words
(6 min) — leaner because they cross-link the pillars rather than re-explain
them. Two authoring dates: `AUTHORED` (2026-08-22), `AUTHORED_2` (2026-08-27).

---

## The two-standard rule — do not confuse these

Stated at the top of `src/content/guides.ts` and enforced by editorial
discipline. Breaking it is a correctness bug.

1. **General trade information is explained in full.** Grading structures,
   Incoterms rules, documentation sets are public reference material. Set out
   with the reasoning, not summarised into a sales point.

2. **Figures that move are never frozen.** Defect allowances, tariff rates,
   EUDR application dates vary by regulator / contract / revision. The guide
   says so and names where the authoritative version lives, rather than quoting
   a number that goes stale. (Trap 10 in `BUILD-STATUS.md`: two guide sentences
   once used the word "undefined" in its ordinary sense and failed the QA
   placeholder scan — the fix was to rephrase, never to loosen the check.)

3. **Anything about Zoebar's own coffee obeys the trust rule with no
   exception.** It comes from `org.ts` or it renders as a `pending` block. A
   guide is **not** a loophole for publishing an unconfirmed specification.

### The `pending` blocks

Seven spots where a guide reaches Zoebar-specific territory and defers:

| Guide | Section | `pending` label |
|---|---|---|
| Buying process | `where-zoebar-sits` | "Zoebar sample policy, minimum order and lead times" |
| Grading | `grade-versus-cup-score` | "Zoebar grade and cupping band" |
| Calendar | `post-harvest` | "Stage durations and lead times" |
| Documentation | `eudr` | "Zoebar traceability depth and certifications" |
| Incoterms | `choosing-a-rule` | "Zoebar Incoterms and port of loading" |
| Payment terms | `payment-and-incoterms` | "Zoebar accepted payment terms" |
| Container loading | `what-to-specify` | "Zoebar packing and container specification" |

Each flips to real content only when Open Item #4 / #6 lands — the same trigger
as `/coffee` and `/quality`.

---

## Routes

| Route | File | Rendering |
|---|---|---|
| `/guides` | `src/app/guides/page.tsx` | Static. Contents-page list of the guides + an "editorial standard" section. |
| `/guides/[slug]` | `src/app/guides/[slug]/page.tsx` | SSG via `generateStaticParams()` over `GUIDES`; `dynamicParams = false` so any other slug hard-404s. 7 pages. |

**Guide page anatomy** (in order): `PageHeader` (reading time, published date,
last-revised date, author) → **the answer, first** (`<Answer>` — the question
as an H2, the 40–60-word self-contained answer beneath, quotable alone) +
a no-JS anchor contents list → the body (`section.heading` sticky in the left
column, `<Blocks>` in the right) → "Questions, answered" (`<FaqList>`) →
"The rest of the set" (every other guide).

`scroll-mt-28` on each body `<section>` clears the fixed nav when an anchor
lands.

---

## Content model

`src/content/guides.ts` + `src/content/blocks.ts`. Content is **data, not MDX**
(Strategy 4.3) — one renderer, type-checked content, and spec tables guaranteed
to be real `<table>` elements.

```ts
interface Guide {
  slug: string;
  title: string;        // H1
  navTitle: string;     // indexes, breadcrumbs, cross-links
  description: string;  // meta description + index summary
  question: string;     // the answer-first H2
  answer: string;       // 40–60 words, self-contained, quotable
  meta: Array<{ term: string; detail: string }>;  // verified strip under the lede
  sections: Section[];
  faqs: QA[];
  datePublished: string;  // real — see Dates below
  dateModified: string;
}

interface Section { id: string; heading: string; blocks: Block[]; }

type Block =
  | { kind: "p";  text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "table"; caption: string; head: string[]; rows: string[][] }
  | { kind: "note"; text: string }                   // "verify this yourself" caveat
  | { kind: "pending"; label: string; text: string };  // renders the Pending marker
```

### Inline links

`[label](/path)` only — parsed by `RichText` in
`src/components/primitives/Prose.tsx`. Internal paths → `next/link`; anything
starting with `http` → external `<a rel="noopener">`. **No other markdown, no
HTML passthrough**, so there is nothing to sanitise.

### Cross-linking requirement (Strategy 4.4)

Every guide cross-links **`/coffee` and `/amaro` within its first three
paragraphs** — check this when editing the opening of any guide.

### Derived, never asserted

`guideWordCount()` / `guideReadingTime()` count the rendered prose (sections +
answer + FAQ Q&A) at 220 wpm, floored at 1 min. The "X min read" on the index
and page is computed, not a number someone typed.

---

## Dates policy (do not relitigate)

`datePublished` / `dateModified` are **real** — the date the guide was written
and last revised (`AUTHORED` today). Recorded in `BUILD-STATUS.md`:

- Not backdated to look established.
- Not refreshed to look current.
- A substantive rewrite gets a **new** `dateModified`, not a bumped one.
- `sitemap.ts` reads `dateModified` for `lastModified` — **not** the build
  timestamp.
- The guide page prints both dates in the header (`formatDate`, fixed to
  `en-GB` UTC for locale stability).

---

## Structured data

Per guide (`/guides/[slug]`), one `@graph`:

- **`articleSchema()`** — `headline` (trailing period stripped), `description`,
  real `datePublished` + `dateModified`, `author` = `ORG.name` ("Zoebar
  Business Group").
- **`faqSchema(guide.faqs)`** — FAQPage from the 3 FAQ entries.
- **`breadcrumbSchema(trail)`** — Home → Guides → {navTitle}.

On the index (`/guides`):

- **`collectionSchema()`** — CollectionPage + ItemList over all guides.
- **`breadcrumbSchema()`**.

---

## Where guides surface

| Surface | Detail |
|---|---|
| Primary nav | **No.** `/guides` has no `inNav` flag in `ROUTES` (`site.ts`). |
| Footer | Yes — under "Origin" (`/traceability`, `/farmers`, `/journal`, `/guides`). |
| Sitemap | All `/guides/[slug]` + `/guides`, with `lastModified` = each guide's real `dateModified`. |
| `llms.txt` | A "## Guides" section listing every guide with one-line summaries (hand-maintained). |
| WhatsApp prefill | `whatsappMessageFor()` handles `/guides/*` → "I have a question about buying Ethiopian green coffee." |
| Cross-links in | Several `content/guides.ts` bodies link `/coffee` and `/amaro`; `/contact` links the Incoterms and documentation guides. |

---

## Editing / adding a guide

**Edit:** change the `Guide` object in `guides.ts`. If the change is
substantive, set `dateModified` to today's date (`YYYY-MM-DD`). Keep the
`answer` 40–60 words and self-contained. Keep `/coffee` + `/amaro` links in the
first three paragraphs. Run `npm run build` + `npx tsc --noEmit` + the QA text
scan (`qa/qa.mjs` — it fails on literal "null"/"undefined"/"NaN" in body text).

**Add a fifth guide** (strategy decision first):
1. Append a `const NEWGUIDE: Guide = { … }` and add it to the `GUIDES` array.
2. `generateStaticParams`, `guidePaths`, the sitemap, and `collectionSchema`
   all read `GUIDES` — they pick it up automatically.
3. Add it to `public/llms.txt` by hand (not generated).
4. New `id`s on every `Section` — they're the anchor list and must be unique
   within the guide.

**Never:**
- Put a real Zoebar spec (grade, MOQ, Incoterms, port, lead time) in prose —
  use a `pending` block.
- Quote a jurisdiction-specific figure as fixed — use a `note` block pointing
  at the authority.
- Introduce markdown beyond `[label](/path)`.

---

## Owed / watch

- The seven `pending` blocks are live and will stay until Open Items #4 and #6
  land.
- Guides were written 2026-08-22; if trade facts shift (EUDR dates, Incoterms
  revision, Ethiopian grading authority changes) the affected guide needs a
  real edit and a new `dateModified`.
- `/guides` is indexable now (no `noindex`), unlike `/journal`.
