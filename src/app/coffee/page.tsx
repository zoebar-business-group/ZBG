import type { Metadata } from "next";

import { ORIGIN, BUYERS, altitudeBand, harvestWindow } from "@/lib/org";
import {
  graph,
  productSchema,
  faqSchema,
  breadcrumbSchema,
  citableSummary,
} from "@/lib/schema";
import {
  IDENTITY,
  QUALITY_SPEC,
  COMMERCIAL_SPEC,
  ALL_SPECS,
  confirmedSpecs,
} from "@/content/coffee";
import { PROCESS_FAQS } from "@/content/faqs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Pending, SpecTable, type SpecRow } from "@/components/primitives/data";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Coffee", path: "/coffee" },
];

export const metadata: Metadata = {
  title: "Ethiopian Green Coffee — Specifications and Availability",
  description:
    "Zoebar supplies washed and natural Ethiopian Arabica green coffee from Amaro (Koore Zone), Ethiopia at 1,700–1,800 masl. Specifications, packing, terms and sample requests for green coffee buyers.",
  alternates: { canonical: "/coffee" },
  openGraph: {
    title: "Ethiopian Green Coffee — Specifications and Availability",
    description: citableSummary(),
    url: "/coffee",
  },
};

/** SpecField → SpecRow. A null value renders the Pending marker. */
function toRows(fields: typeof ALL_SPECS): SpecRow[] {
  return fields.map((f) => ({ label: f.label, value: f.value, note: f.note }));
}

/**
 * /coffee — a specification surface and a buyer tool, not a marketing landing
 * page (Directive 16). Dense, scannable, real HTML tables throughout.
 *
 * Spec surfaces get two CTA opportunities (Directive 24): the sample request
 * sits alongside the specifications where a buyer decides, and the quote CTA
 * closes the page.
 */
export default function CoffeePage() {
  const confirmedCount = confirmedSpecs().length;
  const pendingCount = ALL_SPECS.length - confirmedCount;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            productSchema({
              name: `Ethiopian Arabica Green Coffee — ${ORIGIN.name}, ${ORIGIN.country}`,
              description: citableSummary(),
              path: "/coffee",
              // Only confirmed fields. No Offer node until terms are public.
              properties: confirmedSpecs().map((s) => ({
                name: s.schemaName!,
                value: s.value!,
              })),
            }),
            faqSchema(PROCESS_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        trail={TRAIL}
        eyebrow="The offer"
        title="Ethiopian Arabica green coffee."
        lede={citableSummary()}
        meta={[
          { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Altitude", detail: `${altitudeBand()} masl` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "Processing", detail: ORIGIN.processing.join(" / ") },
        ]}
      />

      {/* --- Specification state, stated up front -------------------------- */}
      <Section surface="bone" rhythm="tight" density="spec" aria-labelledby="state">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2">
              <h2
                id="state"
                className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-meta"
              >
                Specification status
              </h2>
              <p className="max-w-[56ch] font-sans text-[0.9375rem] leading-relaxed text-[#3d423a]">
                {confirmedCount} of {ALL_SPECS.length} fields are confirmed. The
                remaining {pendingCount} are being verified with our operations
                team and will be published here once fixed — not estimated.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span
                data-numeric
                className="font-display text-[2.5rem] leading-none tracking-[-0.02em] text-ink"
              >
                {confirmedCount}
                <span className="text-faint">/{ALL_SPECS.length}</span>
              </span>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Identity: what is confirmed ------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="identity">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Eyebrow index="01" className="text-meta">
                Product identity
              </Eyebrow>
              <Answer
                id="identity"
                className="mt-7"
                question="What green coffee does Zoebar supply?"
                answer={citableSummary()}
              />
            </div>
            <div className="min-w-0 lg:col-span-8">
              <SpecTable caption="Confirmed product identity" rows={toRows(IDENTITY)} />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Quality and commercial: side by side --------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="specs">
        <Container width="wide">
          <h2
            id="specs"
            className="max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Quality and terms.
          </h2>
          <p className="mt-6 max-w-[58ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
            These are the fields a buyer shortlists on. Zoebar publishes them
            when they are fixed rather than offering indicative ranges that move
            at contract stage.
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <SpecTable caption="Quality specification" rows={toRows(QUALITY_SPEC)} />
            </div>
            <div className="min-w-0">
              <SpecTable caption="Commercial terms" rows={toRows(COMMERCIAL_SPEC)} />
            </div>
          </div>

          {/* First CTA opportunity — at the point of evaluation. */}
          <div className="mt-14 flex flex-col gap-6 rounded-[2rem] bg-bone p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-[1.5rem] leading-tight text-ink">
                Need a figure that is not published?
              </h3>
              <p className="mt-2 max-w-[48ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
                Ask directly. We will give you the confirmed number, or tell you
                when it will be confirmed.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button href="/request-quote">Request a quote</Button>
              <Button href="/request-quote#sample" variant="secondary">
                Request a sample
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Who we supply --------------------------------------------------- */}
      <Section surface="deep" rhythm="base" density="story" aria-labelledby="buyers">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="02" className="text-sand">
                Priority buyers
              </Eyebrow>
              <h2
                id="buyers"
                className="mt-7 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
              >
                Who we supply.
              </h2>
              <p className="mt-7 max-w-[46ch] font-sans text-[1.0625rem] leading-[1.65] text-[#cfd9d6]">
                Zoebar builds relationships with buyers who value consistency,
                traceability and dependable long-term partnership — not those
                competing only on the lowest price.
              </p>
            </div>
            <div className="lg:col-span-7">
              <ul className="flex flex-col">
                {BUYERS.map((b, i) => (
                  <li
                    key={b}
                    data-animate
                    style={{ ["--animate-delay" as string]: `${i * 60}ms` }}
                    className="flex items-baseline gap-6 border-t border-[rgba(240,226,203,0.18)] py-6"
                  >
                    <span
                      data-numeric
                      className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta-inverse"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-[1.0625rem] leading-relaxed text-alabaster">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Lots ------------------------------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="lots">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow index="03" className="text-meta">
                Lots
              </Eyebrow>
              <h2
                id="lots"
                className="mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Available lots.
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-meta">Published lots</span>
              <Pending />
            </div>
          </div>
          <p className="mt-8 max-w-[58ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
            Each lot gets its own page carrying origin, process, harvest, quality
            and the producers who grew it. Lot pages are the destination for QR
            codes printed on sacks and sample bags. They publish once per-lot
            specifications are confirmed.
          </p>
          <div className="mt-9">
            <Button href="/traceability" variant="quiet">
              How lot records work
            </Button>
          </div>
        </Container>
      </Section>

      {/* --- FAQ + closing CTA ------------------------------------------------ */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="coffee-faq">
        <Container width="text">
          <h2
            id="coffee-faq"
            className="max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Common questions.
          </h2>
          <FaqList faqs={PROCESS_FAQS} className="mt-12" />
          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/request-quote">Request a quote</Button>
            <Button href="/amaro" variant="secondary">
              About the origin
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
