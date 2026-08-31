import type { Metadata } from "next";
import Link from "next/link";

import { ORIGIN, OPERATIONS, altitudeBand, harvestWindow } from "@/lib/org";
import { graph, articleSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import { QUALITY_FAQS } from "@/content/faqs";
import { QUALITY_SPEC, IDENTITY } from "@/content/coffee";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Pending, SpecTable } from "@/components/primitives/data";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Quality", path: "/quality" },
];

export const metadata: Metadata = {
  title: "Quality, Grading, Cupping and Inspection",
  description:
    "How Ethiopian green coffee quality is assessed: the raw evaluation, the cup evaluation, the export grade and the inspection points. What Zoebar oversees at an affiliated washing station in Amaro, and which specifications are still being verified.",
  alternates: { canonical: "/quality" },
  openGraph: {
    title: "Quality, Grading, Cupping and Inspection",
    url: "/quality",
    type: "article",
  },
};

/**
 * /quality — a specification surface.
 *
 * The page has an unusual job: it is about quality assessment at a moment when
 * Zoebar's own grade, screen size and cupping band are unconfirmed (Open Item
 * #4). The answer is not to soften the page with adjectives. It is to explain
 * the assessment system precisely — which is genuinely useful and genuinely
 * ownable — and to show the empty specification honestly beside it.
 *
 * A buyer who sees a competitor's confident invented cupping score next to
 * Zoebar's "being verified" is being shown the difference between the two
 * suppliers, not a gap in the site.
 */

/** The two assessments that produce an Ethiopian export grade. */
const ASSESSMENTS = [
  {
    n: "01",
    name: "Raw evaluation",
    subject: "The green bean, before roasting",
    detail:
      "Defects are identified in a weighed sample and totalled against a full-defect equivalence table. Screen size distribution and moisture content are recorded alongside the count. A raw problem is usually a sorting or drying problem, and it is visible in the sack.",
    measures: ["Defect count", "Screen size", "Moisture content", "Foreign matter"],
  },
  {
    n: "02",
    name: "Cup evaluation",
    subject: "The brewed liquor",
    detail:
      "The coffee is roasted, ground and cupped, and scored for cleanliness, acidity, body and flavour, with any cup fault recorded. A cup fault is usually a fermentation or storage problem, and it is invisible until the coffee is brewed.",
    measures: ["Cleanliness", "Acidity", "Body", "Flavour", "Cup faults"],
  },
];

/** Points at which quality is fixed or checked between cherry and container. */
const CONTROL_POINTS = [
  {
    stage: "Cherry intake",
    control: "Ripeness and condition assessed on arrival at the washing station.",
    controlledBy: "Zoebar",
  },
  {
    stage: "Sorting",
    control: "Density and defect separation before processing begins.",
    controlledBy: "Zoebar",
  },
  {
    stage: "Processing and drying",
    control:
      "Method recorded per lot; drying monitored on raised beds through to target moisture.",
    controlledBy: "Zoebar",
  },
  {
    stage: "Resting and milling",
    control: "Moisture equalised in parchment before hulling, then screened and sorted.",
    controlledBy: "Zoebar",
  },
  {
    stage: "Export grading",
    control:
      "Raw and cup assessment producing the grade recorded on the export quality certificate.",
    controlledBy: "National coffee authority",
  },
  {
    stage: "Pre-shipment sample",
    control:
      "Sample drawn from the actual lot for buyer approval, against the contract quality basis.",
    controlledBy: "Zoebar and buyer",
  },
  {
    stage: "Weight and quality inspection",
    control:
      "Independent determination at the point named in the contract, where one is appointed.",
    controlledBy: "Independent inspector",
  },
];

export default function QualityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            articleSchema({
              headline: "Quality, grading, cupping and inspection",
              description:
                "How Ethiopian green coffee quality is assessed through a raw evaluation and a cup evaluation, how the export grade is issued, and which quality specifications Zoebar has confirmed.",
              path: "/quality",
            }),
            faqSchema(QUALITY_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        eyebrow="Quality"
        title="Assessed, then stated."
        lede="Quality in green coffee is not an adjective. It is a set of measurements taken on a defined sample, by named parties, at points fixed in a contract. This page sets out what is measured, who measures it, and which of Zoebar's own figures are confirmed today."
        meta={[
          { term: "Origin", detail: `${ORIGIN.name} (${ORIGIN.zone})` },
          { term: "Altitude", detail: `${altitudeBand()} masl` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "Station", detail: "Affiliated, direct oversight" },
        ]}
      />

      {/* --- Answer first ---------------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="assessment">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Answer
                id="assessment"
                question={QUALITY_FAQS[0].question}
                answer={QUALITY_FAQS[0].answer}
              />
              <p className="mt-6 max-w-[58ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                The full structure of the Ethiopian grade, what the bands mean, who
                issues them, and why a grade is not a cup score, is set out in{" "}
                <Link
                  href="/guides/ethiopian-coffee-grading"
                  className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  the grading guide
                </Link>
                .
              </p>
            </div>
            <div className="min-w-0 lg:col-span-5">
              <SpecTable
                caption="Verified origin"
                rows={IDENTITY.map((s) => ({
                  label: s.label,
                  value: s.value,
                  note: s.note,
                }))}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- The two assessments --------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="two-assessments">
        <Container width="wide">
          <h2
            id="two-assessments"
            className="max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Two assessments, one sample.
          </h2>
          <p className="mt-7 max-w-[58ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
            An Ethiopian grade is a composite of both. Two coffees that taste quite
            different can carry the same grade, and a coffee can cup beautifully and
            still be held back by its raw score. Buy on both numbers, not one.
          </p>

          <div className="mt-14 grid gap-px overflow-hidden bg-[#e2dbcd] lg:grid-cols-2">
            {ASSESSMENTS.map((a, i) => (
              <div
                key={a.n}
                data-animate
                style={{ ["--animate-delay" as string]: `${i * 60}ms` }}
                className="flex min-w-0 flex-col gap-5 bg-alabaster p-8 sm:p-10"
              >
                <div className="flex items-baseline gap-4">
                  <span
                    data-numeric
                    className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint"
                  >
                    {a.n}
                  </span>
                  <h3 className="font-display text-[1.625rem] leading-tight text-ink">
                    {a.name}
                  </h3>
                </div>
                <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-meta">
                  {a.subject}
                </p>
                <p className="max-w-[52ch] font-sans text-[0.9375rem] leading-[1.7] text-[#5a5f56]">
                  {a.detail}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {a.measures.map((m) => (
                    <li
                      key={m}
                      className="border border-[#e2dbcd] px-3 py-1.5 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[#5a5f56]"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Control points --------------------------------------------------- */}
      <Section surface="deep" rhythm="loose" density="story" aria-labelledby="control">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-sand">Control</Eyebrow>
              <h2
                id="control"
                className="mt-7 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
              >
                Where quality is actually decided.
              </h2>
              <p className="mt-7 max-w-[44ch] font-sans text-[1.0625rem] leading-[1.65] text-[#cfd9d6]">
                Quality is not created at the grading table. It is created at intake,
                at sorting and on the drying beds, and the grading table only records
                what already happened. The washing station in{" "}
                {OPERATIONS.washingStationLocation} is held by an affiliated company
                within Zoebar&rsquo;s ownership structure and run with direct
                operational oversight, which puts the stages that determine the
                outcome under direct management rather than bought in.
              </p>
              <div className="mt-10">
                <Button href="/process" variant="secondary" onDark>
                  The seven stages
                </Button>
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <div className="w-full min-w-0 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <caption className="mb-4 text-left font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]">
                    Quality control points
                  </caption>
                  <thead>
                    <tr className="border-t border-[rgba(240,226,203,0.34)]">
                      <th
                        scope="col"
                        className="py-3 pr-6 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#9db3b0]"
                      >
                        Stage
                      </th>
                      <th
                        scope="col"
                        className="py-3 pr-6 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#9db3b0]"
                      >
                        What is fixed or checked
                      </th>
                      <th
                        scope="col"
                        className="whitespace-nowrap py-3 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#9db3b0]"
                      >
                        Controlled by
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTROL_POINTS.map((p) => (
                      <tr
                        key={p.stage}
                        className="border-t border-[rgba(240,226,203,0.18)] align-top"
                      >
                        <th
                          scope="row"
                          className="py-4 pr-6 font-sans text-[0.9375rem] font-medium text-alabaster"
                        >
                          {p.stage}
                        </th>
                        <td className="py-4 pr-6 font-sans text-[0.9375rem] leading-[1.6] text-[#cfd9d6]">
                          {p.control}
                        </td>
                        <td className="py-4 font-sans text-[0.9375rem] text-[#9db3b0]">
                          {p.controlledBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- The specification ------------------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="specification">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-meta">Specification</Eyebrow>
              <h2
                id="specification"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                What we can state today.
              </h2>
              <p className="mt-7 max-w-[44ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                {QUALITY_FAQS[2].answer}
              </p>
              <div className="mt-8 flex items-center gap-3">
                <span className="font-sans text-sm text-meta">Quality figures</span>
                <Pending>Confirmed per lot</Pending>
              </div>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <SpecTable
                caption="Quality specification"
                rows={QUALITY_SPEC.map((s) => ({
                  label: s.label,
                  value: s.value,
                  note: s.note,
                  perLot: s.perLot,
                }))}
              />
              <p className="mt-8 max-w-[58ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
                These fields fill from the client&rsquo;s confirmed records, not from
                industry averages. When they are confirmed they appear here, on{" "}
                <Link
                  href="/coffee"
                  className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  the coffee page
                </Link>{" "}
                and on each lot record simultaneously, because all three read from one
                source.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Why the gaps are visible ------------------------------------------ */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="position">
        <Container width="text">
          <Eyebrow className="text-meta">The position</Eyebrow>
          <h2
            id="position"
            className="mt-6 max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            An empty field is a statement.
          </h2>
          <div className="mt-8 flex max-w-[64ch] flex-col gap-6 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]">
            <p>
              Most green coffee offer sheets are complete. Every field carries a value,
              and a buyer has no way to tell which of those values came from a
              certificate and which came from a colleague&rsquo;s memory of last
              season.
            </p>
            <p>
              Zoebar would rather show the gap. A specification that reads &ldquo;being
              verified&rdquo; is a commitment that every other field on the page was
              confirmed before it was published, which is the only thing that makes
              the confirmed fields worth anything.
            </p>
            <p>
              It also sets the standard for what follows. When the grade, screen size
              and cupping band are confirmed, they will be confirmed figures, and the
              lot record carrying them will be checkable against the sack in front of
              you.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/request-quote">Request a quote</Button>
            <Button href="/traceability" variant="secondary">
              How traceability works
            </Button>
          </div>
        </Container>
      </Section>

      {/* --- FAQ -------------------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="quality-faq">
        <Container width="text">
          <h2
            id="quality-faq"
            className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Quality, answered.
          </h2>
          <FaqList faqs={QUALITY_FAQS} className="mt-12" />
        </Container>
      </Section>
    </>
  );
}
