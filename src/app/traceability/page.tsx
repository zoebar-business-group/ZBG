import type { Metadata } from "next";

import { ORIGIN, OPERATIONS } from "@/lib/org";
import { graph, articleSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import { TRACEABILITY_FAQS } from "@/content/faqs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/data";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Traceability", path: "/traceability" },
];

export const metadata: Metadata = {
  title: "Traceability, Lot Records from Amaro",
  description:
    "The lot record Zoebar's traceability system is built around: origin in Amaro (Koore Zone), Ethiopia, processing at an affiliated washing station with direct operational oversight, harvest period, quality record and the producers connected to the lot. Publishing begins once the first lots are confirmed.",
  alternates: { canonical: "/traceability" },
  openGraph: { title: "Traceability, Lot Records from Amaro", url: "/traceability", type: "article" },
};

/**
 * /traceability — specification surface.
 *
 * Directive 15 requires traceability to be visual and to use real data. No lot
 * ID is invented here: the page documents the STRUCTURE of a lot record and
 * what each field means. Published lots appear once the client confirms
 * traceability depth (Strategy Open Item #6).
 */

const RECORD_FIELDS = [
  {
    field: "Lot identifier",
    holds: "The reference to be printed on the sack and carried across the documentation.",
    status: "structure",
  },
  {
    field: "Origin",
    holds: `${ORIGIN.name} (${ORIGIN.zone}), ${ORIGIN.country}.`,
    status: "verified",
  },
  {
    field: "Washing station",
    holds: `Affiliated station at ${OPERATIONS.washingStationLocation}, run with Zoebar's direct operational oversight.`,
    status: "verified",
  },
  {
    field: "Processing method",
    holds: "Washed or natural, recorded per lot rather than assumed.",
    status: "verified",
  },
  {
    field: "Harvest period",
    holds: `The harvest the lot came from, within the ${ORIGIN.harvestStart}–${ORIGIN.harvestEnd} window.`,
    status: "verified",
  },
  // LOT-DEPENDENT ROW — hidden pending real per-lot data. Do not delete;
  // uncomment to re-enable. Tracker: docs/LOT-DEPENDENT-FIELDS.md
  // {
  //   field: "Quality assessment",
  //   holds: "The grade and cupping record, added once it is produced before the lot is released.",
  //   status: "pending",
  // },
  {
    field: "Producers",
    holds: "The growers connected to the lot, listed where permission to name them is recorded.",
    status: "structure",
  },
  // LOT-DEPENDENT ROW — hidden pending real per-lot data. Do not delete;
  // uncomment to re-enable. Tracker: docs/LOT-DEPENDENT-FIELDS.md
  // {
  //   field: "Shipment",
  //   holds: "Documentation, inspection and departure details, added for the contract.",
  //   status: "pending",
  // },
];

export default function TraceabilityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            articleSchema({
              headline: "Traceability, lot records from Amaro",
              description:
                "The lot record Zoebar's traceability system is built around: origin in Amaro (Koore Zone), Ethiopia, processing method at an affiliated washing station with direct operational oversight, harvest period, quality assessment and connected producers. Publishing begins once the first lots are confirmed.",
              path: "/traceability",
            }),
            faqSchema(TRACEABILITY_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        eyebrow="Traceability"
        title="Built to follow a lot back."
        lede={TRACEABILITY_FAQS[0].answer}
        meta={[
          { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Station", detail: "Affiliated, direct oversight" },
          { term: "QR destination", detail: "Lot page" },
          { term: "Published lots", detail: <Pending /> },
        ]}
      />

      {/* --- The chain ------------------------------------------------------ */}
      <Section surface="ink" rhythm="base" density="story" aria-labelledby="chain">
        <Container width="wide">
          <Eyebrow index="01" className="text-sand">
            The chain
          </Eyebrow>
          <h2
            id="chain"
            className="mt-6 max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
          >
            Six links, one record.
          </h2>
          <p className="mt-7 max-w-[52ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#cfd9d6]">
            The chain and the lot page that renders it are built and working.
            What each link carries is set out below; publishing begins once the
            first lots are confirmed.
          </p>

          <ol className="mt-14 flex flex-col gap-px overflow-hidden rounded-[0.125rem] bg-[rgba(240,226,203,0.16)] md:flex-row">
            {["Lot", ORIGIN.name, "Washing station", "Process", "Quality", "Shipment"].map(
              (step, i) => (
                <li
                  key={step}
                  data-animate
                  style={{ ["--animate-delay" as string]: `${i * 55}ms` }}
                  className="flex flex-1 items-center gap-4 bg-ink px-5 py-6 md:flex-col md:items-start md:gap-8 md:py-8"
                >
                  <span
                    data-numeric
                    className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta-inverse"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-sans text-[0.9375rem] text-alabaster">{step}</span>
                </li>
              ),
            )}
          </ol>
        </Container>
      </Section>

      {/* --- What the record holds ------------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="record">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-4">
              <Eyebrow index="02" className="text-meta">
                The lot record
              </Eyebrow>
              <Answer
                id="record"
                className="mt-7"
                question={TRACEABILITY_FAQS[0].question}
                answer={TRACEABILITY_FAQS[0].answer}
              />
            </div>

            <div className="min-w-0 lg:col-span-8">
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <caption className="mb-4 text-left font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-meta">
                    Lot record fields
                  </caption>
                  <thead>
                    <tr className="border-b border-[#c9c0ae]">
                      <th
                        scope="col"
                        className="py-3 pr-6 font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta"
                      >
                        Field
                      </th>
                      <th
                        scope="col"
                        className="py-3 pr-6 font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta"
                      >
                        What it holds
                      </th>
                      <th
                        scope="col"
                        className="py-3 font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECORD_FIELDS.map((r) => (
                      <tr key={r.field} className="border-t border-[#e2dbcd] align-top">
                        <th
                          scope="row"
                          className="w-[22%] py-4 pr-6 font-sans text-sm font-medium text-ink"
                        >
                          {r.field}
                        </th>
                        <td className="py-4 pr-6 font-sans text-[0.9375rem] leading-relaxed text-[#5a5f56]">
                          {r.holds}
                        </td>
                        <td className="py-4">
                          {r.status === "verified" ? (
                            <span className="font-sans text-sm text-[#2e5954]">Confirmed</span>
                          ) : r.status === "structure" ? (
                            <span className="font-sans text-sm text-meta">Per lot</span>
                          ) : (
                            <Pending />
                          )}
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

      {/* --- QR ------------------------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="qr">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow index="03" className="text-meta">
                QR programme
              </Eyebrow>
              <Answer
                id="qr"
                className="mt-7"
                question={TRACEABILITY_FAQS[1].question}
                answer={TRACEABILITY_FAQS[1].answer}
              />
            </div>
            <div className="lg:col-span-6">
              <FaqList faqs={TRACEABILITY_FAQS} />
            </div>
          </div>

          <div className="mt-14 flex flex-wrap gap-4">
            <Button href="/request-quote">Request a quote</Button>
            <Button href="/farmers" variant="secondary">
              The producers
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
