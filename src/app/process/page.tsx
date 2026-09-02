import type { Metadata } from "next";

import { ORIGIN, OPERATIONS, harvestWindow } from "@/lib/org";
import { graph, articleSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import { PROCESS_FAQS } from "@/content/faqs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { SpecTable } from "@/components/primitives/data";
import { Figure } from "@/components/primitives/Figure";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Process", path: "/process" },
];

export const metadata: Metadata = {
  title: "Coffee Process, Cherry to Container",
  description:
    "How Zoebar processes Ethiopian Arabica at an affiliated washing station in Amaro, Ethiopia, with direct operational oversight: intake, sorting, washed and natural processing, drying, grading and lot formation.",
  alternates: { canonical: "/process" },
  openGraph: { title: "Coffee Process, Cherry to Container", url: "/process", type: "article" },
};

/**
 * /process — a specification surface. Dense, scannable, minimal motion.
 *
 * Directive 13: animation must enhance comprehension, never replace content.
 * Every stage below is plain HTML, readable with scripting disabled; the only
 * motion is a staggered entrance on the stage list.
 *
 * Real stage timings are Strategy Open Item #4. The per-stage duration column
 * and the "Stage timings" marker are commented out pending confirmed data
 * (docs/LOT-DEPENDENT-FIELDS.md); `duration: null` is retained on each stage so
 * the column can be re-enabled without reshaping the data.
 */

const STAGES = [
  {
    n: "01",
    name: "Cherry intake",
    detail:
      "Cherry is delivered to the affiliated washing station in Amaro during the harvest window and assessed on arrival.",
    duration: null,
  },
  {
    n: "02",
    name: "Sorting",
    detail:
      "Density and defect separation before processing, so underripe and damaged cherry does not enter the lot.",
    duration: null,
  },
  {
    n: "03",
    name: "Processing",
    detail:
      "Washed or natural, decided and recorded per lot. In washed processing the fruit is removed before drying; in natural processing the cherry dries whole.",
    duration: null,
  },
  {
    n: "04",
    name: "Drying",
    detail:
      "Raised beds, turned and monitored through to target moisture. Drying time varies with method and weather.",
    duration: null,
  },
  {
    n: "05",
    name: "Grading and cupping",
    detail:
      "Quality assessment before a lot is released, producing the grade and cupping record carried on the lot page.",
    duration: null,
  },
  {
    n: "06",
    name: "Lot formation",
    detail:
      "The lot record closes: origin, process, harvest, quality and the producers connected to it.",
    duration: null,
  },
  {
    n: "07",
    name: "Export",
    detail:
      "Documentation, inspection and shipment. Incoterms and port of loading are confirmed per contract.",
    duration: null,
  },
];

export default function ProcessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            articleSchema({
              headline: "Coffee process, cherry to container",
              description:
                "How Zoebar processes Ethiopian Arabica at an affiliated washing station in Amaro, Ethiopia, with direct operational oversight, from cherry intake through sorting, washed and natural processing, drying, grading and lot formation to export.",
              path: "/process",
            }),
            faqSchema(PROCESS_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        eyebrow="Process"
        title="From cherry to container."
        lede={`The washing station in ${OPERATIONS.washingStationLocation} is held by an affiliated company within Zoebar's ownership structure and run with Zoebar's direct operational oversight. Cherry intake, processing method, drying and lot formation are managed directly, which is what makes the process record attached to a lot an operational record rather than a supplier's claim.`}
        meta={[
          { term: "Station", detail: "Affiliated, direct oversight" },
          { term: "Location", detail: OPERATIONS.washingStationLocation },
          { term: "Methods", detail: ORIGIN.processing.join(" / ") },
          { term: "Harvest", detail: harvestWindow() },
        ]}
      />

      {/* --- The seven stages ---------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="stages">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              id="stages"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Seven stages.
            </h2>
            {/* PENDING FIELD hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-meta">Stage timings</span>
              <Pending />
            </div>
            */}
          </div>

          <ol className="mt-12 flex flex-col">
            {STAGES.map((s, i) => (
              <li
                key={s.n}
                data-animate
                style={{ ["--animate-delay" as string]: `${i * 45}ms` }}
                /* Intrinsic tracks, not a 12-column split: the status column
                   sizes to its chip. A fixed col-span-2 collapsed to ~30px at
                   768px and pushed the nowrap chip past the viewport. */
                className="grid grid-cols-1 items-start gap-3 border-t border-[#e2dbcd] py-7 sm:grid-cols-[2.5rem_minmax(0,1fr)_auto] sm:gap-x-6"
              >
                <span
                  data-numeric
                  className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint sm:pt-2"
                >
                  {s.n}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[1.375rem] leading-tight text-ink">
                    {s.name}
                  </h3>
                  <p className="mt-2 max-w-[62ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
                    {s.detail}
                  </p>
                </div>
                {/* PENDING FIELD hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md).
                    The grid keeps its third `auto` track (empty for now) so this
                    re-enables as a one-line change.
                <div className="sm:pt-2 sm:text-right">
                  {s.duration ?? <Pending />}
                </div>
                */}
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* --- Washed vs natural ---------------------------------------------- */}
      <Section surface="deep" rhythm="loose" density="story" aria-labelledby="methods">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow className="text-sand">Two methods</Eyebrow>
              <Answer
                id="methods"
                onDark
                className="mt-7"
                question="What is the difference between washed and natural processing?"
                answer={PROCESS_FAQS[1].answer}
              />
              <div className="mt-12 grid gap-px overflow-hidden rounded-[0.125rem] bg-[rgba(240,226,203,0.16)] sm:grid-cols-2">
                <div className="bg-emerald p-6">
                  <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]">
                    Washed
                  </p>
                  <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-[#cfd9d6]">
                    Fruit removed from the seed before drying.
                  </p>
                </div>
                <div className="bg-emerald p-6">
                  <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]">
                    Natural
                  </p>
                  <p className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-[#cfd9d6]">
                    Cherry dries whole, with the fruit intact.
                  </p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6">
              <Figure
                ratio="landscape"
                rounded="panel"
                onDark
                src="/washing-station.jpg"
                alt="Rows of raised drying beds at the affiliated washing station in Amaro, with concrete fermentation tanks in the foreground and workers tending the parchment, green hills behind."
                brief="Drying beds in use at the affiliated washing station, parchment being turned, showing the working method rather than a styled arrangement."
                caption={`Both methods run at the affiliated washing station in ${OPERATIONS.washingStationLocation}.`}
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Export terms ---------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="export">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-meta">Export</Eyebrow>
              <h2
                id="export"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Terms and timing.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                Lead times, Incoterms and port of loading are confirmed per contract.
                They are published here once fixed rather than shown as indicative
                ranges.
              </p>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <SpecTable
                caption="Export reference"
                rows={[
                  { label: "Origin", value: `${ORIGIN.name} (${ORIGIN.zone}), ${ORIGIN.country}` },
                  { label: "Harvest", value: harvestWindow() },
                  { label: "Processing", value: ORIGIN.processing.join(" / ") },
                  // PENDING FIELDS hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
                  // { label: "Lead time", value: null },
                  // { label: "Incoterms", value: null },
                  // { label: "Port of loading", value: null },
                  // { label: "Packing", value: null },
                  // { label: "Inspection", value: null },
                ]}
              />
            </div>
          </div>
        </Container>
      </Section>

      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="process-faq">
        <Container width="text">
          <h2
            id="process-faq"
            className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Process, answered.
          </h2>
          <FaqList faqs={PROCESS_FAQS} className="mt-12" />
          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/request-quote">Request a quote</Button>
            <Button href="/traceability" variant="secondary">
              How traceability works
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
