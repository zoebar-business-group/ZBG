import type { Metadata } from "next";
import Link from "next/link";

import { ORIGIN, harvestWindow } from "@/lib/org";
import { graph, collectionSchema, breadcrumbSchema } from "@/lib/schema";
import { GUIDES, guideReadingTime } from "@/content/guides";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Guides", path: "/guides" },
];

export const metadata: Metadata = {
  title: "Green Coffee Guides, Grading, Calendar, Documents, Incoterms",
  description:
    "Seven reference guides for green coffee buyers: how Ethiopian coffee is graded, the harvest and shipping calendar, the importer's documentation checklist, and Incoterms 2020 applied to coffee.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Green Coffee Guides, Grading, Calendar, Documents, Incoterms",
    url: "/guides",
    type: "website",
  },
};

/**
 * /guides — the reference index. Spec density.
 *
 * The four pillars are fixed by Strategy 4.2 and are deliberately not a blog:
 * they are maintained reference documents that a buyer returns to, and the
 * index reads as a contents page rather than a feed of cards.
 */
export default function GuidesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            collectionSchema({
              name: "Green coffee guides",
              description:
                "Reference guides for green coffee buyers: Ethiopian grading, the harvest and shipping calendar, import documentation and Incoterms 2020.",
              path: "/guides",
              items: GUIDES.map((g) => ({
                name: g.navTitle,
                path: `/guides/${g.slug}`,
              })),
            }),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        eyebrow="Guides"
        title="Reference, not marketing."
        lede="Seven guides covering the questions a green coffee buyer actually has to answer before a first Ethiopian shipment: how the buying process runs, how the grade is produced, when the crop moves, which documents are required, what an Incoterms rule does and does not include, how payment is structured, and what fits in a container."
        meta={[
          { term: "Guides", detail: GUIDES.length },
          { term: "Origin covered", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "Standard", detail: "Sources named, gaps stated" },
        ]}
      />

      {/* --- The guides ------------------------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="index">
        <Container width="wide">
          <h2 id="index" className="sr-only">
            The guides
          </h2>

          <ol className="flex flex-col">
            {GUIDES.map((guide, i) => (
              <li
                key={guide.slug}
                data-animate
                style={{ ["--animate-delay" as string]: `${i * 45}ms` }}
                className="border-t border-[#e2dbcd]"
              >
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group grid grid-cols-1 items-start gap-4 py-10 sm:grid-cols-[3rem_minmax(0,1fr)] sm:gap-x-8"
                >
                  <span
                    data-numeric
                    className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint sm:pt-3"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <h3 className="max-w-[24ch] font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.12] tracking-[-0.01em] text-ink transition-colors duration-[200ms] group-hover:text-emerald-mid">
                      {guide.title}
                    </h3>
                    <p className="mt-4 max-w-[62ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                      {guide.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                      <span className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-meta">
                        {guideReadingTime(guide)} min read
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ink"
                      >
                        Read the guide
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* --- How these are written ------------------------------------------ */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="standard">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-meta">Editorial standard</Eyebrow>
              <h2
                id="standard"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                How these are written.
              </h2>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <dl className="flex flex-col">
                {[
                  {
                    term: "General trade information is explained",
                    detail:
                      "Grading structures, Incoterms rules and documentation sets are public reference material. They are set out here in full, with the reasoning, rather than summarised into a sales point.",
                  },
                  {
                    term: "Figures that move are not frozen",
                    detail:
                      "Defect allowances, tariff rates and regulatory application dates are revised. Where a figure depends on a schedule or a jurisdiction, the guide says so and names where the authoritative version lives, instead of quoting a number that will quietly go stale.",
                  },
                  {
                    term: "Zoebar's own specifications follow the trust rule",
                    detail:
                      "Grade, screen size, cupping band, moisture, packing, lead times and Incoterms are marked as being verified until the client confirms them. A guide is not a route around that rule.",
                  },
                  {
                    term: "Every claim about origin comes from one record",
                    detail: `Origin, altitude, harvest window and processing method are read from a single canonical source, so ${ORIGIN.name} is described identically on every page of this site.`,
                  },
                ].map((item) => (
                  <div key={item.term} className="border-t border-[#d9d0bf] py-7">
                    <dt className="max-w-[46ch] font-display text-[1.25rem] leading-snug text-ink">
                      {item.term}
                    </dt>
                    <dd className="mt-3 max-w-[62ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
                      {item.detail}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-12 flex flex-wrap gap-4">
                <Button href="/request-quote">Request a quote</Button>
                <Button href="/coffee" variant="secondary">
                  See the coffee
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
