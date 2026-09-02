# "Being verified" fields hidden from the public site — consolidated tracker

**Filename retained** (`LOT-DEPENDENT-FIELDS.md`) so existing code comments and
doc links do not break. **Scope is now the whole site**, not just lot-dependent
quality fields: every unconfirmed-field marker (`<Pending />` / "Being verified"
/ `kind: "pending"` block) that was visible on a public page has been commented
out — not deleted — unless hiding it would break layout, in which case it is
listed under *Flagged, left visible* below for a case-by-case decision.

**Dates:** first pass (lot-dependent quality fields) 31 Aug 2026 · site-wide
sweep 2 Sep 2026.
**Related:** `BUILD-STATUS.md` (Open Items #4, #6, #9, #10, #12), `CLAUDE.md`
rule 1 (trust rule), `docs/LOTS-STATUS.md`, `docs/FORMS-AND-CONTACT.md`,
branch `feature/eden-review-and-ownership-wording`.

---

## Why

On the individual `/lots/[slug]` template a null field genuinely means "not
confirmed for this lot" and rendering "Being verified" there is honest. On the
origin / marketing / reference pages the same marker was noise: it advertised
an absence rather than telling the buyer anything. Current decision: **show
nothing on the public pages until the real value exists**, code commented so it
re-enables cleanly.

**Not affected:** `/lots/[slug]` and `/lots/[slug]` sub-views still render these
fields (value, or "Being verified" when a specific lot's value is null). The
`perLot` mechanism in `SpecTable` / `Prose` / `blocks.ts` / `coffee.ts` stays in
place, currently unused (dead but valid) — see *Infrastructure retained* below.

---

## Re-enable label / wording — **OPEN DECISION, do not pre-decide**

How (or whether) any of these reappear on the public pages once data lands is
**unresolved** and must be chosen with the client. Candidates raised, none
picked:

- `"Confirmed per lot"` / `"Recorded per lot"` / `"Per lot"` chip
- No label on origin pages — link to a representative lot record instead
- A real value or range once enough lots are published
- Keep hidden on public pages permanently; per-lot only

Every commented block below says "pick a label/approach then". Update this file
with the decision when it is made.

---

## Hidden this pass (commented out — do not delete)

Each site marked in code with a `PENDING FIELD(S)` / `PENDING BLOCK` comment
pointing back here. Line numbers drift as files change — search the comment text.

### Homepage — `src/components/home/sections.tsx`

| # | Section | Marker (approx line) | What it was | Why unconfirmed |
|---|---|---|---|---|
| 1 | §03 Amaro | ~163 | "Varieties" label + `<Pending onDark />` chip beside the "Explore Amaro" button | `ORIGIN.varieties` null — Foundation Brief lists varieties as "incorporate when verified rather than assumed" (Open Item #4) |
| 2 | §04 Washing station | ~251 | `<dl>` row `{ term: "Recorded timings", detail: null }` | Stage timings unconfirmed (Open Item #4) |
| 3 | §05 Cherry to container | ~317 | "Stage timings" `<Pending />` chip in the section header | Stage timings unconfirmed (Open Item #4) |
| 4 | §07 Traceability | ~484 | "Published lots" `<Pending onDark />` chip beside "How traceability works" | No lots published yet (Open Item #6) |

### `/amaro` — `src/app/amaro/page.tsx`

| # | Section | Marker | What it was | Why unconfirmed |
|---|---|---|---|---|
| 5 | §02 Altitude | ~163 | Inline chip pair: "Varieties" + "Coordinates", each `<Pending onDark />` | `ORIGIN.varieties` and `ORIGIN.geo` both null (Open Item #4; coordinates also block Place-schema geo) |
| 6 | §03 Harvest and processing | ~229 | `SpecTable` "Origin reference" row `{ label: "Varieties", value: null }` | as above |

`Pending` import removed from this file (was only used by the above).

### `/process` — `src/app/process/page.tsx`

| # | Section | Marker | What it was | Why unconfirmed |
|---|---|---|---|---|
| 7 | "Seven stages" header | ~132 | "Stage timings" `<Pending />` chip | Real stage timings are Open Item #4; a plausible "18–36 hours" would be a fabricated operational record (file header comment) |
| 8 | Stage list | ~165 | Per-stage duration column — `{s.duration ?? <Pending />}`, all 7 rows | as above. `duration: null` kept on every `STAGES` entry; the grid keeps its empty third `auto` track so re-enable is one line |
| 9 | "Export reference" table | ~251 | `SpecTable` rows: Lead time, Incoterms, Port of loading, Packing, Inspection | Confirmed per contract, not yet published (Open Item #4). Table now renders 3 rows (Origin, Harvest, Processing) — see *Flagged* note |

`Pending` import removed from this file.

### `/coffee` — `src/app/coffee/page.tsx`

| # | Section | Marker | What it was | Why unconfirmed |
|---|---|---|---|---|
| 10 | §03 Lots | ~257 | "Published lots" `<Pending />` chip in the section header | No lots published yet (Open Item #6) |
| 10a | "Specification state" section (top of page) | ~99 | The whole `<Section aria-labelledby="state">` — "Specification status" heading + "*N of 16 fields are confirmed. The remaining M are being verified…*" + the `N/16` numeral | Commented out on request (later pass). The `confirmedCount` / `pendingCount` consts are commented with it; `confirmedSpecs()` is still called inline for the Product schema |

`Pending` import removed from this file. Re-enable 10a by uncommenting the
section block and the two consts above `return`.

### `/contact` — `src/app/contact/page.tsx`

| # | Section | Marker | What it was | Why unconfirmed |
|---|---|---|---|---|
| 11 | "Contact channels" table | ~145 | Rows `{ label: "Registered address", value: null }` and `{ label: "TRN", value: ORG.trn }` | TRN not supplied (Open Item #10). **Note:** the address row was hardcoded `null` here even though `ORG.legalAddress` is populated and `/about` renders it — see *Flagged* |

Table still renders Enquiry form / Email / Telephone / WhatsApp — no gap.

### `/about` — `src/app/about/page.tsx`

| # | Section | Marker | What it was | Why unconfirmed |
|---|---|---|---|---|
| 12 | §02 Structure — "Company record" table | ~253 | Rows `{ label: "TRN", value: ORG.trn }` and `{ label: "Founded", value: ORG.foundingDate }` | TRN and founding date were not supplied (Open Item #10). "Registered address" row kept — `formatAddress()` returns a real value |

### `/request-quote` — `src/app/request-quote/page.tsx`

| # | Section | Marker | What it was | Why unconfirmed |
|---|---|---|---|---|
| 13 | Sample section | ~183 | "Sample policy" `<Pending onDark />` chip | Sample policy / MOQ / lead times unconfirmed (Open Item #4) |

`Pending` import kept — still used by the conditional "Not connected" delivery
notice.

### Guides — `src/content/guides.ts` (`kind: "pending"` blocks)

All six sit at the end of a guide section, after full general-reference prose;
removing one just ends the section earlier. Same treatment as the already-hidden
grading-guide block (first pass).

| # | Guide (`slug`) | Section | Block label | Why unconfirmed |
|---|---|---|---|---|
| 14 | `harvest-and-shipping-calendar` | From cherry to exportable green | "Stage durations and lead times" | Open Item #4 |
| 15 | `import-documentation-checklist` | (traceability/compliance section) | "Zoebar traceability depth and certifications" | Open Item #6 |
| 16 | `incoterms-green-coffee` | (Zoebar terms section) | "Zoebar Incoterms and port of loading" | Open Item #4 |
| 17 | `buying-green-coffee-process` | (sample / MOQ section) | "Zoebar sample policy, minimum order and lead times" | Open Item #4 |
| 18 | `green-coffee-payment-terms` | (payment section) | "Zoebar accepted payment terms" | Open Item #4 |
| 19 | `green-coffee-container-loading` | (packing section) | "Zoebar packing and container specification" | Open Item #4 |

Already hidden (first pass): `ethiopian-coffee-grading` — "Zoebar grade and
cupping band".

`blocks.ts` `countWords` and `Prose.tsx` still handle `kind: "pending"` — dead
but valid. Guide word counts drop ~40–60 words each; counts are derived, never
asserted.

### Already hidden in the first pass — untouched

`src/content/coffee.ts` `QUALITY_SPEC` (Grade / Screen size / Cupping score /
Moisture) · `src/components/home/sections.tsx` §06 Quality table (same four) ·
`src/app/quality/page.tsx` "Quality figures" chip · `src/content/guides.ts`
grading-guide pending block · `src/app/traceability/page.tsx` `RECORD_FIELDS`
"Quality assessment" and "Shipment" rows.

---

## Condition for re-enabling

Per field group:

- **Grade / screen size / cupping / moisture / varieties / defect count / stage
  timings / lead times / Incoterms / port / packing / MOQ / sample policy /
  payment terms** — Open Item #4. Re-enable when the client confirms the figure
  (for lot-recorded fields: when published `lot` documents in Sanity carry the
  value and at least one such lot is live).
- **Published lots** (`/coffee`, homepage, `/traceability`, `/lots`,
  `/farmers`) — Open Item #6. Re-enable when the first lot is published; the
  counts (`lots.length || …`, `producers.length || …`) then show a real number.
- **Coordinates** — Open Item #4. Re-enable when `ORIGIN.geo` is set (also
  unblocks Place-schema geo/elevation).
- **Registered address / TRN / founded** — Open Item #10. TRN and founding date
  were never supplied; address IS in `org.ts`.

At re-enable, pick per *Re-enable label* above — do not assume the pre-change
chip.

---

## Flagged, left visible — decide case by case

Not hidden, because hiding would empty a table, leave a header-grid gap, or the
marker is a genuine status rather than an unconfirmed fact.

### A. `/coffee` and `/quality` "Quality specification" table — would go empty

`src/content/coffee.ts` `QUALITY_SPEC` still has two rendering rows:
`{ label: "Defect count", value: null }` and `{ label: "Varieties", value: null }`,
both showing "Being verified". They feed the "Quality specification" table on
**both** `/coffee` (beside "Commercial terms") and `/quality`.

- Hiding both leaves a captioned table with **zero rows** on two pages — a
  visibly broken element.
- `/quality` has an entire section ("An empty field is a statement", the "why
  the gaps are visible" position) built around *showing* these. Removing the
  table there would undercut a documented editorial stance
  (`BUILD-STATUS.md` — quality page rationale).
- **Recommendation:** leave as-is, or if they must go, remove the whole table
  (and adjust the `/coffee` "Quality and terms" two-column grid), not just the
  rows. **Your call.**

### B. `/coffee` "Commercial terms" table — would go empty

`src/content/coffee.ts` `COMMERCIAL_SPEC` — all 7 rows null (Packing, MOQ, Lead
time, Incoterms, Port of loading, Inspection, Certifications), all "Being
verified". Hiding them empties the table (right column of the `/coffee` "Quality
and terms" section). Same decision as A — remove the table/section or keep.

### C. `/process` "Export reference" section — now thin

After hiding item 9, the table renders 3 confirmed rows (Origin, Harvest,
Processing) that largely repeat the page header. The section heading is "Terms
and timing" and the left-column prose is about terms confirmed per contract.
Not broken, but review whether the section still earns its place or should be
hidden wholesale.

### D. PageHeader meta chips — removing leaves a 3-in-4 grid gap

The header meta strip is `sm:grid-cols-4`; dropping one item leaves a visible
empty cell.

| Page | Meta item | Renders |
|---|---|---|
| `/traceability` | "Published lots" | `<Pending />` |
| `/farmers` | "Published profiles" | `producers.length \|\| <Pending />` (currently Pending) |
| `/lots` | "Published lots" | `lots.length \|\| <Pending />` (currently Pending; page is noindex) |
| `/about/founder` | "Status" | `<Pending>In preparation</Pending>` (page is noindex) |

Options: drop and accept a 3-wide strip, swap in another confirmed fact (a
decision, not an invention), or keep. **Your call.**

### E. Labelled status chips — a state, not an unconfirmed fact

| Page | Chip | Rationale |
|---|---|---|
| `/farmers` | `<Pending>Awaiting permissions</Pending>` | Open Item #9. Part of a deliberate honest-empty-state section with its own full explanation |
| `/about/founder` | `<Pending />` "Founder account" chip + Status chip (D) | Open Item #7. The whole (noindex) page is *about* the pending state |
| Homepage §10 | `<Pending>Seeding from archive</Pending>` | Open Item #12. Journal seeding status |
| `/lots` | `<Pending>None published yet</Pending>` | Open Item #6. Empty-state label on a noindex page |
| `/request-quote` | `<Pending>Not connected</Pending>` | Conditional on `RESEND_API_KEY` being unset — a build-time notice, not shown once configured in prod |

### F. Stale supporting copy — now partly inaccurate, needs rewording

Not markers, but they reference hidden/confirmed content and read wrong now:

- `src/app/about/page.tsx` ~221–225 — "Registered address and TRN are being
  verified and appear here…". The registered address **is** confirmed and
  rendered in the table above. Reword to TRN (and/or founding date) only, or
  drop.
- `src/app/contact/page.tsx` ~91–96 — "Direct telephone, email and the
  registered address are being verified." Telephone and email **are** confirmed
  and shown in the channel table right beside this sentence (this was already
  inaccurate before this pass — email/phone confirmed 28 Aug). Reword.
- `src/app/contact/page.tsx` — the channel table hardcodes
  `{ label: "Registered address", value: null }` rather than reading
  `ORG.legalAddress`. Consider wiring it to `formatAddress()` (as `/about` does)
  instead of hiding the row.

### G. Policy-statement prose — admissible, left as-is (low-priority review)

Sentences that *describe the policy* ("where a fact is not confirmed it is
marked as being verified") rather than render a marker. Admissible per the FAQ /
policy-statement decision (`BUILD-STATUS.md`). Left untouched; light copy review
only if the phrasing now over-promises visible markers:
`src/components/home/sections.tsx` WhyZoebar body · `src/app/guides/page.tsx`
authorship-standard section · `/quality` metadata description ·
`/request-quote` "Unconfirmed figures — Stated as being verified" row ·
`/thank-you` copy.

### H. Dead render branch — left, harmless

`src/app/traceability/page.tsx` `RECORD_FIELDS` render still has the
`status === "pending" → <Pending />` branch. No row uses `status: "pending"` any
more (both commented in the first pass), so it never fires. Left in place; do
not touch the Status column per instruction.

---

## Infrastructure retained (dead but valid)

`perLot` support, kept for re-enable: `components/primitives/data.tsx`
(`SpecRow.perLot` + the `<Pending>Confirmed per lot</Pending>` branch) ·
`components/primitives/Prose.tsx` (`block.perLot` branch) · `content/blocks.ts`
(`perLot?` on the `pending` block; `countWords` `case "pending"`) ·
`content/coffee.ts` (`SpecField.perLot?`) · `app/coffee/page.tsx` `toRows` ·
`app/quality/page.tsx` `QUALITY_SPEC.map`. Nothing sets `perLot: true` in active
code.

---

## Verification (2 Sep 2026 sweep)

`npx tsc --noEmit` clean · `npm run lint` clean · `npm run build` clean, all 31
routes generate. No layout break introduced by the hidden items; the borderline
cases are under *Flagged* rather than hidden.
