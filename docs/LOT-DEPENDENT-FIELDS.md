# Lot-dependent quality fields — hidden pending real per-lot data

**Date:** 31 August 2026
**Scope:** grade, screen size, cupping score, moisture (quality spec on `/coffee`,
`/quality`, homepage, grading guide) — plus the "Quality assessment" and
"Shipment" rows of the `/traceability` lot-record table. All removed from
visible output (commented, not deleted) until real per-lot content exists.
**Related:** `BUILD-STATUS.md` (Open Item #4), `CLAUDE.md` rule 1 (trust rule),
`docs/LOTS-STATUS.md`, branch `feature/eden-review-and-ownership-wording`.

---

## Why

These four fields are recorded on each individual lot, not published as a
standing figure for the origin. On the origin/marketing pages they were showing
as a "Being verified" chip, then briefly as a "Confirmed per lot" label (Eden's
30 Aug review). Current decision: **show nothing at all on the marketing pages
until real lot data exists**, so the code is commented out rather than deleted.

The `/lots/[slug]` lot-page template is **not** affected — it still shows these
fields (as a value, or "Being verified" when a specific lot's value is null).
On a lot page a null grade genuinely means "not confirmed for this lot", which
is honest; on an origin page it was noise.

---

## Which fields

| Field | Status |
|---|---|
| Grade | **Hidden** |
| Screen size | **Hidden** |
| Cupping score | **Hidden** |
| Moisture content | **Hidden** |
| Defect count | **Still visible** as "Being verified" — see note below |
| Varieties | **Still visible** as "Being verified" — origin/cultivar-level, not strictly per-lot |

**Open question:** *Defect count* is also a per-lot measurement (it comes out of
the raw evaluation done on each lot's sample) and arguably belongs in the hidden
set. It was left visible because the explicit instruction named only grade /
screen size / cupping score / moisture. Decide whether it joins the hidden set.
If it does, the `/coffee` and `/quality` "Quality specification" tables would be
left with a single row (Varieties) and should probably not render at all.

---

## Exact locations (commented out — do not delete)

### 1. `src/content/coffee.ts` — `QUALITY_SPEC` (the shared data source)

Lines **82–87**. Feeds the "Quality specification" table on **both** `/coffee`
and `/quality`, and the `/coffee` field counter via `ALL_SPECS`.

```
// LOT-DEPENDENT — hidden pending real per-lot data (docs/LOT-DEPENDENT-FIELDS.md):
// { label: "Grade", value: null, schemaName: "grade", perLot: true },
// { label: "Screen size", value: null, schemaName: "screenSize", perLot: true },
// { label: "Cupping score", value: null, schemaName: "cuppingScore", perLot: true },
{ label: "Defect count", value: null, schemaName: "defectCount" },
// { label: "Moisture content", value: null, schemaName: "moistureContent", perLot: true },
{ label: "Varieties", value: null, schemaName: "varieties" },
```

Header comment on the `QUALITY_SPEC` export updated at lines **69–79**.

No structured-data effect: these fields have `value: null`, so `confirmedSpecs()`
already excluded them from the Product schema `additionalProperty`.

### 2. `src/components/home/sections.tsx` — homepage `Quality()` section table

Lines **398–402**. The "Quality reference, Amaro" `SpecTable` rows.

```
{ label: "Harvest", value: harvestWindow() },
// LOT-DEPENDENT — hidden pending real per-lot data (docs/LOT-DEPENDENT-FIELDS.md):
// { label: "Grade", value: null, perLot: true },
// { label: "Screen size", value: null, perLot: true },
// { label: "Cupping score", value: null, perLot: true },
// { label: "Moisture content", value: null, perLot: true },
```

Section lede reworded at lines **377–381** (it previously described "the fields
below" as per-lot grading data; the fields below are now only confirmed origin
facts).

### 3. `src/app/quality/page.tsx` — "The specification" section chip

Lines **333–341**. JSX-commented "Quality figures / Confirmed per lot" chip.

```
{/* LOT-DEPENDENT FIELDS — "Quality figures" chip hidden with the
    grade / screen size / cupping score / moisture rows, pending
    real per-lot data. Tracker: docs/LOT-DEPENDENT-FIELDS.md
<div className="mt-8 flex items-center gap-3">
  <span className="font-sans text-sm text-meta">Quality figures</span>
  <Pending>Confirmed per lot</Pending>
</div>
*/}
```

`Pending` import removed at lines **12–15** (it was only used by this chip).
Restore `import { Pending, SpecTable } ...` when re-enabling.

### 4. `src/content/guides.ts` — grading guide pending block

Lines **217–228**. The `kind: "pending"` block at the end of the
"grade vs. cup score" section of the `GRADING` guide
(`/guides/ethiopian-coffee-grading`).

```
// LOT-DEPENDENT FIELDS — this pending block is hidden until real per-lot
// data exists in Sanity. Do not delete; uncomment to re-enable and pick
// a label/approach at that point. Tracker: docs/LOT-DEPENDENT-FIELDS.md
// {
//   kind: "pending",
//   label: "Zoebar grade and cupping band",
//   perLot: true,
//   text: "Zoebar's grade, screen size, moisture and cupping score are recorded on each lot rather than published as a standing figure, and appear on the specification table on [our coffee page](/coffee) and on each lot record. Defect count is being verified.",
// },
```

### 5. `src/app/traceability/page.tsx` — `RECORD_FIELDS` table rows

The `/traceability` "Lot record fields" table. Two rows whose Status was
"Being verified" are commented out (added 31 Aug, after items 1–4). Same
rationale: the data is pending real per-lot content, not the system. These are
table rows rather than standalone fields, but the condition for re-enabling and
the open-label question are identical, so they are tracked here.

Lines **~60–80** (shifts as the array changes). Both blocks:

```
// LOT-DEPENDENT ROW — hidden pending real per-lot data. Do not delete;
// uncomment to re-enable. Tracker: docs/LOT-DEPENDENT-FIELDS.md
// {
//   field: "Quality assessment",
//   holds: "The grade and cupping record, added once it is produced before the lot is released.",
//   status: "pending",
// },
```

```
// LOT-DEPENDENT ROW — hidden pending real per-lot data. Do not delete;
// uncomment to re-enable. Tracker: docs/LOT-DEPENDENT-FIELDS.md
// {
//   field: "Shipment",
//   holds: "Documentation, inspection and departure details, added for the contract.",
//   status: "pending",
// },
```

The table now renders **6 rows** — Lot identifier (Per lot), Origin, Washing
station, Processing method, Harvest period (Confirmed ×4), Producers (Per lot).
No "Being verified" rows remain. The `status === "pending" → <Pending />` branch
in the table render is now dead but valid; `Pending` stays imported for the
PageHeader "Published lots" meta chip.

Minor note: `TRACEABILITY_FAQS[0].answer` (the section's `<Answer>` prose) still
lists "the quality assessment" among what a lot record covers, while that row is
no longer in the table. Left as-is — the prose is the fuller description, the
table is the field breakdown — but worth revisiting if it reads oddly.

### Supporting copy changed (not commented — adjusted because it referenced hidden content)

- `src/app/coffee/page.tsx:63` — `pendingCount` restored; the "Specification
  status" sentence (lines **110–114**) reverted to a generic count
  (*"7 of 16 fields are confirmed. The remaining 9 are being verified…"*)
  instead of naming the now-hidden fields.

---

## The `perLot` mechanism is still in place (unused)

Kept as infrastructure for re-enabling. Nothing sets `perLot: true` in active
code any more, so these branches are currently dead but valid:

- `src/components/primitives/data.tsx` — `SpecRow.perLot?` field + the
  `row.perLot ? <Pending>Confirmed per lot</Pending> : <Pending />` branch in `SpecTable`
- `src/components/primitives/Prose.tsx` — `block.perLot ? … : <Pending />` in the `pending` block renderer
- `src/content/blocks.ts` — `perLot?: boolean` on the `pending` block type
- `src/content/coffee.ts:28` — `SpecField.perLot?`
- `src/app/coffee/page.tsx:49` — `toRows` passes `perLot: f.perLot`
- `src/app/quality/page.tsx:342` — `QUALITY_SPEC.map` passes `perLot: s.perLot`

---

## Condition for re-enabling

Uncomment when **real per-lot values for these fields exist in Sanity and at
least one such lot is published.** The Sanity `lot` schema already has `grade`,
`screenSize`, `cuppingScore` and `moistureContent` fields, and `/lots/[slug]`
already renders them — so "real data exists" means: published `lot` documents
with those fields populated.

At that point, either:
- surface a real figure / range drawn from published lots, or
- link from the origin pages to a representative lot record, or
- keep them hidden on origin pages permanently and only show them per-lot.

## Label / approach when re-enabling — **OPEN DECISION, do not pre-decide**

The wording for how these appear on the origin pages (if at all) is unresolved.
Candidates raised so far, none chosen:

- `"Confirmed per lot"` chip (what was there immediately before this change)
- `"Recorded per lot"` / `"Per lot"` status
- No label on origin pages — link to a lot record instead
- A real value/range once enough lots are published

Pick this together with the client. This file should be updated with the
decision when it's made.
