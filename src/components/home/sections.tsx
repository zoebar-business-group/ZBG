import Link from "next/link";

import {
  ORIGIN,
  OPERATIONS,
  BUYERS,
  altitudeBand,
  harvestWindow,
} from "@/lib/org";
import { citableSummary } from "@/lib/schema";
import { externalHrefFor } from "@/lib/site";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";
import { Stat, Pending, SpecTable } from "@/components/primitives/data";
import { Figure } from "@/components/primitives/Figure";

/* ============================================================================
   02 — WHY ZOEBAR
   ----------------------------------------------------------------------------
   Answer-first pattern (Strategy 5.2): an H2 phrased as the buyer's actual
   question, then a self-contained answer that survives being quoted alone.
   Deliberately the quietest section on the page — it follows the hero, so it
   contracts rather than competes.
   ========================================================================== */

export function WhyZoebar() {
  return (
    <Section
      surface="light"
      rhythm="base"
      density="spec"
      aria-labelledby="why-heading"
    >
      <Container width="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow index="02" className="text-meta">
              Why Zoebar
            </Eyebrow>
            <h2
              id="why-heading"
              className="mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              What does Zoebar supply?
            </h2>
          </div>

          <div className="min-w-0 lg:col-span-7">
            {/* The extractable passage. Numbers, place names, altitudes and
                dates, with no back-references. */}
            <p
              data-animate
              className="max-w-[52ch] font-sans text-[clamp(1.125rem,1.5vw,1.4rem)] leading-[1.55] text-ink"
            >
              {citableSummary()}
            </p>

            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {[
                {
                  title: "A single origin, in depth",
                  body: `Our current coffee program is centered on ${ORIGIN.name}, allowing us to build deeper knowledge of the farms, processing practices, season and people behind each lot.`,
                },
                {
                  title: "An affiliated washing station",
                  body: `The washing station in ${OPERATIONS.washingStationLocation} is held by an affiliated company within Zoebar's ownership structure and run with Zoebar's direct operational oversight, so processing is managed rather than bought in.`,
                },
                {
                  title: "Traceability that resolves",
                  body: "Our traceability system is built around lot-level records covering origin, processing, quality and shipment. Where a fact is not yet confirmed, it is marked as being verified.",
                },
                {
                  title: "Buyers who value consistency",
                  body: "Specialty roasters, family-owned coffee companies and importers building dependable Ethiopian sourcing.",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  data-animate
                  style={{ ["--animate-delay" as string]: `${i * 70}ms` }}
                  className="border-t border-[#e2dbcd] pt-5"
                >
                  <h3 className="font-sans text-[0.9375rem] font-medium text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 max-w-[38ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   03 — AMARO
   ----------------------------------------------------------------------------
   The sharpest search and citation asset (Strategy 4.1). The Koore Zone /
   Sidama distinction is stated prominently and accurately, because nobody
   else in the market has written it properly.
   ========================================================================== */

export function Amaro() {
  return (
    <Section
      surface="deep"
      rhythm="cinematic"
      density="story"
      aria-labelledby="amaro-heading"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow index="03" className="text-sand">
              The origin
            </Eyebrow>

            <h2
              id="amaro-heading"
              data-animate
              className="mt-7 max-w-[12ch] text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.02em] text-alabaster"
            >
              {ORIGIN.name}, {ORIGIN.country}
            </h2>

            {/* The accuracy statement. Verbatim from the canonical entity so
                the same wording appears wherever the category is named. */}
            <p
              data-animate
              style={{ ["--animate-delay" as string]: "80ms" }}
              className="mt-8 max-w-[54ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#cfd9d6]"
            >
              {ORIGIN.categoryNote}
            </p>

            <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3">
              <Stat
                value={altitudeBand()}
                unit="masl"
                label="Altitude"
                onDark
                /* Keeps two columns at every width. "1,700-1,800" is the
                   longest value in the group, and squeezing it into a third of
                   a half-width container is what pushed it over the harvest
                   stat beside it. */
                className="col-span-2 text-alabaster"
                size="large"
              />
              <Stat
                value={ORIGIN.harvestStart.slice(0, 3).toUpperCase()}
                unit={`– ${ORIGIN.harvestEnd.slice(0, 3).toUpperCase()}`}
                label="Harvest window"
                onDark
                className="text-alabaster"
              />
              <Stat
                value="2"
                unit="methods"
                label="Washed / Natural"
                footnote="Depending on the lot"
                onDark
                className="text-alabaster"
              />
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-6">
              <Button href="/amaro" onDark>
                Explore {ORIGIN.name}
              </Button>
              {/* PENDING FIELD hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
              <div className="flex items-center gap-3">
                <span className="font-sans text-sm text-[#9db3b0]">Varieties</span>
                <Pending onDark />
              </div>
              */}
            </div>
          </div>

          <div className="lg:col-span-6">
            <Figure
              ratio="portrait"
              rounded="panel"
              cut
              onDark
              src="/amaro-harvest.jpg"
              alt="A coffee tree in Amaro, Koore Zone, heavy with ripe red, orange and green cherry, with terraced rows of coffee running back across the hillside behind it in hazy light. No people in frame."
              brief="Cherry on the tree in Amaro during harvest, with the planted hillside behind, natural light."
              /* No toLowerCase(): the window is "September - December", and
                 lowercasing it printed "september - december" on the homepage.
                 Month names are proper nouns. */
              caption={`${ORIGIN.name}, ${ORIGIN.zone}. Harvest runs ${harvestWindow()}.`}
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   04 — THE WASHING STATION
   ----------------------------------------------------------------------------
   Foundation Brief 3: an operational asset and a credibility anchor, shown
   through accurate information and field documentation — never as decorative
   background. Light surface, tight rhythm: a deliberate gear change down from
   the immersive Amaro chapter.
   ========================================================================== */

export function WashingStation() {
  return (
    <Section
      surface="light"
      rhythm="base"
      density="story"
      aria-labelledby="station-heading"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <Figure
              ratio="landscape"
              rounded="panel"
              src="/wash1.jpg"
              alt="The affiliated washing station at Amaro in use: a worker directs a hose into one of the concrete fermentation tanks, water running over the coffee settled at the bottom, with forested hillside behind."
              brief="The affiliated washing station at Amaro, the concrete fermentation tanks in working use during processing."
              caption="An affiliated washing station at Amaro, run with Zoebar's direct operational oversight."
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </div>

          <div className="order-1 lg:order-2 lg:col-span-5">
            <Eyebrow index="04" className="text-meta">
              The washing station
            </Eyebrow>
            <h2
              id="station-heading"
              className="mt-6 max-w-[14ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Processing with direct oversight.
            </h2>
            <p className="mt-7 max-w-[44ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
              {OPERATIONS.ethiopiaEntity} is{" "}
              {OPERATIONS.ethiopiaStatus.charAt(0).toLowerCase() +
                OPERATIONS.ethiopiaStatus.slice(1)}
              . The washing station in {OPERATIONS.washingStationLocation} is
              held by an affiliated company within Zoebar&rsquo;s ownership
              structure and run with Zoebar&rsquo;s direct operational
              oversight, which is what makes the process record on a lot a fact
              rather than a claim. It is set to transition to{" "}
              {OPERATIONS.ethiopiaEntity} directly.
            </p>

            <dl className="mt-10 flex flex-col">
              {[
                { term: "Tenure", detail: "Affiliated, direct oversight" },
                { term: "Location", detail: OPERATIONS.washingStationLocation },
                { term: "Methods", detail: ORIGIN.processing.join(" and ") },
                // PENDING FIELD hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
                // { term: "Recorded timings", detail: null },
              ].map((row) => (
                <div
                  key={row.term}
                  className="flex items-baseline justify-between gap-6 border-t border-[#e2dbcd] py-4"
                >
                  <dt className="font-sans text-sm text-meta">{row.term}</dt>
                  <dd className="text-right font-sans text-[0.9375rem] text-ink">
                    {row.detail ?? <Pending />}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-9">
              <Button href="/process" variant="quiet">
                See the full process
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   05 — FROM CHERRY TO CONTAINER
   ----------------------------------------------------------------------------
   The journey made structural rather than described. A specification surface:
   near-sharp geometry, tight rows, minimal motion. Real timings are Open
   Item #4 and are marked pending rather than invented.
   ========================================================================== */

const STAGES = [
  {
    n: "01",
    name: "Cherry",
    detail: "Selective picking through the harvest window.",
  },
  {
    n: "02",
    name: "Sorting",
    detail: "Density and defect separation on delivery.",
  },
  {
    n: "03",
    name: "Processing",
    detail: "Washed or natural, depending on the lot.",
  },
  {
    n: "04",
    name: "Drying",
    detail: "Raised beds, turned and monitored to target moisture.",
  },
  {
    n: "05",
    name: "Quality",
    detail: "Grading and cupping before a lot is released.",
  },
  {
    n: "06",
    name: "Lot",
    detail:
      "Origin, processing and quality records are consolidated under the lot identity.",
  },
  {
    n: "07",
    name: "Export",
    detail: "Documentation, inspection and shipment.",
  },
];

export function CherryToContainer() {
  return (
    <Section
      surface="bone"
      rhythm="base"
      density="spec"
      aria-labelledby="journey-heading"
    >
      <Container width="wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="05" className="text-meta">
              From cherry to container
            </Eyebrow>
            <h2
              id="journey-heading"
              className="mt-6 max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Seven stages, one record.
            </h2>
          </div>
          {/* PENDING FIELD hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
          <div className="flex items-center gap-3">
            <span className="font-sans text-sm text-meta">Stage timings</span>
            <Pending />
          </div>
          */}
        </div>

        {/* Horizontal on desktop, vertical on mobile, the composition
            transforms rather than shrinking (Directive 27). */}
        <ol className="mt-14 grid gap-px overflow-hidden rounded-[0.125rem] bg-[#ddd5c6] sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <li
              key={stage.n}
              data-animate
              style={{ ["--animate-delay" as string]: `${i * 55}ms` }}
              className="flex min-h-[11rem] flex-col justify-between bg-alabaster p-6"
            >
              <span
                data-numeric
                className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint"
              >
                {stage.n}
              </span>
              <div className="mt-8">
                <h3 className="font-display text-[1.5rem] leading-none tracking-[-0.01em] text-ink">
                  {stage.name}
                </h3>
                <p className="mt-3 max-w-[26ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
                  {stage.detail}
                </p>
              </div>
            </li>
          ))}
          {/* Deliberate empty cell completes the grid without a filler card. */}
          <li aria-hidden="true" className="hidden bg-alabaster lg:block" />
        </ol>
      </Container>
    </Section>
  );
}

/* ============================================================================
   06 — QUALITY
   ========================================================================== */

export function Quality() {
  return (
    <Section
      surface="light"
      rhythm="base"
      density="spec"
      aria-labelledby="quality-heading"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow index="06" className="text-meta">
              Quality
            </Eyebrow>
            <h2
              id="quality-heading"
              className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Graded, cupped, recorded.
            </h2>
            <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
              Grading and cupping data belong on the lot, not in the marketing.
              The reference below is the confirmed origin picture; per-lot
              grading figures live on each lot record.
            </p>
            <div className="mt-9">
              <Button href="/quality" variant="quiet">
                Quality and grading
              </Button>
            </div>
          </div>

          <div className="min-w-0 lg:col-span-7">
            {/* Real HTML table, mandatory, never an image (Strategy 4.3). */}
            <SpecTable
              caption="Quality reference, Amaro"
              rows={[
                { label: "Species", value: ORIGIN.species },
                { label: "Processing", value: ORIGIN.processing.join(" / ") },
                { label: "Altitude", value: `${altitudeBand()} masl` },
                { label: "Harvest", value: harvestWindow() },
                // LOT-DEPENDENT — hidden pending real per-lot data (docs/LOT-DEPENDENT-FIELDS.md):
                // { label: "Grade", value: null, perLot: true },
                // { label: "Screen size", value: null, perLot: true },
                // { label: "Cupping score", value: null, perLot: true },
                // { label: "Moisture content", value: null, perLot: true },
              ]}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   07 — TRACEABILITY
   ----------------------------------------------------------------------------
   Directive 15: make traceability visual, using real data. The lot passport
   below is a structure, not a fabricated record — no lot ID is invented.
   ========================================================================== */

const CHAIN = [
  "Lot",
  ORIGIN.name,
  "Washing station",
  "Process",
  "Quality",
  "Shipment",
];

export function Traceability() {
  return (
    <Section
      surface="ink"
      rhythm="loose"
      density="story"
      aria-labelledby="trace-heading"
    >
      <Container width="wide">
        <div className="max-w-[46rem]">
          <Eyebrow index="07" className="text-sand">
            Traceability
          </Eyebrow>
          <h2
            id="trace-heading"
            data-animate
            className="mt-7 max-w-[16ch] text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.02em] text-alabaster"
          >
            A lot you can follow back.
          </h2>
          <p
            data-animate
            style={{ ["--animate-delay" as string]: "80ms" }}
            className="mt-8 max-w-[52ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#cfd9d6]"
          >
            Our traceability system is built around lot-level records covering
            origin, processing, quality and shipment information. Each lot gets
            its own page, reached by a QR code on the sack or sample bag;
            publishing begins once the first lots are confirmed.
          </p>
        </div>

        {/* The chain. A measured line rather than a row of cards, the
            positioning principle drawn: distance, reduced to one path. */}
        <ol className="mt-16 flex flex-col gap-px overflow-hidden rounded-[0.125rem] bg-[rgba(240,226,203,0.16)] md:flex-row">
          {CHAIN.map((step, i) => (
            <li
              key={step}
              data-animate
              style={{ ["--animate-delay" as string]: `${i * 60}ms` }}
              className="flex flex-1 items-center gap-4 bg-ink px-5 py-6 md:flex-col md:items-start md:gap-8 md:py-8"
            >
              <span
                data-numeric
                className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta-inverse"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-sans text-[0.9375rem] text-alabaster">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center gap-6">
          <Button href="/traceability" onDark variant="secondary">
            How traceability works
          </Button>
          {/* PENDING FIELD hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
          <div className="flex items-center gap-3">
            <span className="font-sans text-sm text-[#9db3b0]">Published lots</span>
            <Pending onDark />
          </div>
          */}
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   08 — FARMERS
   ----------------------------------------------------------------------------
   Foundation Brief 6 and Strategy 3.2: farmers are skilled producers. Never
   charity, poverty or rescue framing — this rule is absolute. A profile
   cannot publish without a permission record, so none are shown yet.
   ========================================================================== */

export function Farmers() {
  return (
    <Section
      surface="light"
      rhythm="base"
      density="story"
      aria-labelledby="farmers-heading"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow index="08" className="text-meta">
              The producers
            </Eyebrow>
            <h2
              id="farmers-heading"
              className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              The people who grew it, named.
            </h2>
            <p className="mt-7 max-w-[44ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
              Producer credit is a stated purpose of this site. Each profile
              carries the grower&rsquo;s name, plot, altitude and their own
              words, and lot pages link back to the people who grew the lot.
            </p>
            <p className="mt-5 max-w-[44ch] font-sans text-sm leading-relaxed text-meta">
              Profiles publish only with documented permission from the
              producer. They are added progressively as those permissions are
              confirmed.
            </p>
            <div className="mt-9">
              <Button href="/farmers" variant="quiet">
                Producer profiles
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7 ">
            {/* Both photographs are landscape frames in portrait slots, and in
                both the producer stands well to the left. `focus="left"` anchors
                the crop on them; the default centre crop cuts through the face. */}
            <Figure
              ratio="portrait"
              rounded="card"
              focus="left"
              src="/farmer-one.jpg"
              alt="A coffee producer in a worn brown jacket picking ripe red cherry by hand from a laden branch at their plot in Amaro, Koore Zone."
              brief="A producer hand-picking ripe cherry at their plot in Amaro, seen in profile among the coffee trees, natural light, unposed."
              sizes="(max-width: 640px) 100vw, 28vw"
            />
            <Figure
              ratio="portrait"
              rounded="card"
              cut
              focus="left"
              className="sm:mt-14"
              src="/zoebarfarmers1.jpeg"
              alt="A coffee producer standing among cherry-laden coffee trees at his plot in Amaro, Koore Zone, reaching to a branch of ripening cherry, forested hillside behind."
              brief="A producer at his plot in Amaro among the coffee trees, cherry ripening on the branch, documentary, natural light."
              sizes="(max-width: 640px) 100vw, 28vw"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   09 — AVAILABLE COFFEE
   ----------------------------------------------------------------------------
   A buyer tool, not a marketing panel (Directive 16). Specification surface.
   ========================================================================== */

export function AvailableCoffee() {
  return (
    <Section
      surface="bone"
      rhythm="base"
      density="spec"
      aria-labelledby="coffee-heading"
    >
      <Container width="wide">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="09" className="text-meta">
              Available coffee
            </Eyebrow>
            <h2
              id="coffee-heading"
              className="mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              2026/27 New Crop.
            </h2>
          </div>
          <p className="max-w-[38ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
            Samples, lot specifications and commercial terms will become
            available as the new crop progresses.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <SpecTable
              caption="2026/27 new crop, Amaro green coffee"
              rows={[
                { label: "Coffee", value: `${ORIGIN.name} green coffee` },
                { label: "Processing", value: ORIGIN.processing.join(" / ") },
                { label: "Harvest", value: harvestWindow() },
              ]}
            />
            <p className="mt-8 max-w-[52ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
              New-crop samples become available once the coffee has been
              processed and its quality evaluated, not before. Register interest
              now and we will come back to you as the crop reaches that point.
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[2rem] bg-alabaster p-8 ring-1 ring-[#e2dbcd]">
              <h3 className="font-display text-[1.75rem] leading-tight tracking-[-0.01em]">
                Who we supply
              </h3>
              <ul className="mt-6 flex flex-col">
                {BUYERS.map((b) => (
                  <li
                    key={b}
                    className="border-t border-[#e2dbcd] py-4 font-sans text-[0.9375rem] leading-relaxed text-[#5a5f56]"
                  >
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/coffee">View specifications</Button>
                <Button href="/request-quote#sample" variant="secondary">
                  Request a sample
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   10 — FROM ORIGIN
   ----------------------------------------------------------------------------
   The Journal is a permanent knowledge library, not reproduced social posts
   (Foundation Brief 7). Entries are seeded from the LinkedIn archive in week
   one (Strategy Open Item #12), so no article is invented here.
   ========================================================================== */

export function FromOrigin() {
  return (
    <Section
      surface="light"
      rhythm="base"
      density="story"
      aria-labelledby="journal-heading"
    >
      <Container width="wide">
        <div className="flex flex-col gap-6 border-b border-[#e2dbcd] pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow index="10" className="text-meta">
              From Origin
            </Eyebrow>
            <h2
              id="journal-heading"
              className="mt-6 max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Field notes from Amaro.
            </h2>
          </div>
          <Button
            href={externalHrefFor("/journal") ?? "/journal"}
            variant="quiet"
          >
            All entries
          </Button>
        </div>

        <p className="mt-10 max-w-[54ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
          From Origin documents the coffee journey through verified information
          and photography from {ORIGIN.name}, harvest updates, processing notes
          and buyer resources. Entries publish as each is confirmed.
        </p>

        <div className="mt-10 flex items-center gap-3">
          <span className="font-sans text-sm text-meta">First entries</span>
          <Pending>Seeding from archive</Pending>
        </div>
      </Container>
    </Section>
  );
}

/* ============================================================================
   11 — REQUEST
   ----------------------------------------------------------------------------
   Primary conversion is Request a Quote; the sample request is the highest
   intent action on the site (Strategy 6.2).
   ========================================================================== */

export function RequestSection() {
  return (
    <Section
      surface="deep"
      rhythm="loose"
      density="story"
      aria-labelledby="request-heading"
    >
      <Container width="wide">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-7">
            <Eyebrow className="text-sand">Next step</Eyebrow>
            <h2
              id="request-heading"
              data-animate
              className="mt-7 max-w-[14ch] text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.02em] text-alabaster"
            >
              Start with a sample.
            </h2>
            <p
              data-animate
              style={{ ["--animate-delay" as string]: "80ms" }}
              className="mt-8 max-w-[50ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#cfd9d6]"
            >
              Tell us the volume and grade you are working with and we will come
              back with current availability, specifications and terms. If a
              detail is not yet confirmed, we will say so rather than estimate
              it.
            </p>
          </div>

          <div className="flex flex-col justify-end gap-4 lg:col-span-5">
            <Button href="/request-quote" onDark>
              Request a quote
            </Button>
            <Button href="/request-quote#sample" variant="secondary" onDark>
              Request a sample
            </Button>
            <p className="mt-2 text-center font-sans text-sm leading-relaxed text-[#9db3b0]">
              Prefer to talk it through?{" "}
              <Link
                href="/contact"
                className="text-sand underline underline-offset-4"
              >
                Contact the team
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
