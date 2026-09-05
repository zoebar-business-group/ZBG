import type { Metadata } from "next";
import Link from "next/link";

import { ORIGIN, harvestWindow } from "@/lib/org";
import { graph, collectionSchema, breadcrumbSchema } from "@/lib/schema";
import { publishedLots } from "@/content/lots";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Lots", path: "/lots" },
];

const BASE_METADATA: Metadata = {
  title: "Coffee Lots, Amaro Green Coffee Records",
  description:
    "Individual lot records for Zoebar's washed and natural Ethiopian Arabica green coffee from Amaro (Koore Zone), Ethiopia: origin, processing, harvest and quality per lot. The destination for the QR codes on Zoebar sacks.",
  alternates: { canonical: "/lots" },
  openGraph: {
    title: "Coffee Lots, Amaro Green Coffee Records",
    url: "/lots",
    type: "website",
  },
};

/**
 * NOINDEX UNTIL THERE IS A REAL LOT, matching the pattern used for /journal
 * while it had no entries: a one-line empty state is thin content in the
 * sitemap. A demonstration lot does not lift the index either — an index of
 * example records is not something to put in front of search (client
 * instruction, 4 September 2026). Flips to indexable automatically once a lot
 * with `isDemo` off is published. At that point also drop the `noindex` flag
 * on /lots in `lib/site.ts` so the index enters the sitemap.
 */
export async function generateMetadata(): Promise<Metadata> {
  const live = (await publishedLots()).some((l) => !l.isDemo);
  return live
    ? BASE_METADATA
    : { ...BASE_METADATA, robots: { index: false, follow: true } };
}

/**
 * /lots — the lot index. Spec density.
 *
 * Lots come from Sanity, read via `publishedLots()` (same accessor
 * `[slug]/page.tsx` uses).
 */
export default async function LotsPage() {
  const lots = await publishedLots();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            collectionSchema({
              name: "Coffee lots",
              description:
                "Individual lot records for Zoebar's Ethiopian Arabica green coffee from Amaro (Koore Zone), Ethiopia.",
              path: "/lots",
              /* Demonstration records stay out of structured data. */
              items: lots
                .filter((l) => !l.isDemo)
                .map((l) => ({
                  name: l.lotId,
                  path: `/lots/${l.slug}`,
                })),
            }),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        eyebrow="Lots"
        title="Available lots."
        lede="Each lot has its own record: origin, processing, harvest and quality for that specific coffee. The QR codes on Zoebar sacks and sample bags open the lot page for the coffee in front of you."
        meta={[
          { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "QR destination", detail: "One page per lot" },
          /* A count of zero is a fact, not a pending field. It used to render
             a "Being verified" chip, which the client asked us to stop showing
             where information is simply not there yet. */
          { term: "Published lots", detail: String(lots.length) },
        ]}
      />

      <Section surface="light" rhythm="base" density="spec" aria-labelledby="lots-index">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              id="lots-index"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Lot records.
            </h2>
          </div>

          {lots.length === 0 ? (
            <div className="mt-12 border-t border-[#e2dbcd] pt-10">
              <p className="max-w-[52ch] font-sans text-[1.0625rem] leading-[1.65] text-[#3d423a]">
                Lots for the 2026/27 harvest publish from October.{" "}
                <Link
                  href="/request-quote"
                  className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  Request the availability sheet
                </Link>{" "}
                for what is on offer now.
              </p>
              <div className="mt-9">
                <Button href="/traceability" variant="quiet">
                  How lot records work
                </Button>
              </div>
            </div>
          ) : (
            <ul className="mt-12 grid gap-px overflow-hidden bg-[#e2dbcd] sm:grid-cols-2 lg:grid-cols-3">
              {lots.map((lot) => (
                <li key={lot.slug} className="bg-alabaster">
                  <Link
                    href={`/lots/${lot.slug}`}
                    className="group flex h-full flex-col gap-4 p-7"
                  >
                    <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint">
                      {lot.harvestYear} harvest &middot; {lot.process}
                    </p>
                    <h3 className="max-w-[20ch] font-display text-[1.25rem] leading-snug text-ink transition-colors duration-[200ms] group-hover:text-emerald-mid">
                      {lot.lotId}
                    </h3>
                    {/* A demonstration record is labelled here too, so it is
                        never mistaken for an offer in the index. */}
                    {lot.isDemo ? (
                      <span className="mt-auto inline-flex w-fit border border-[#c9a227] bg-sand/40 px-2.5 py-1 font-sans text-[0.625rem] font-medium uppercase tracking-[0.16em] text-ink">
                        Demonstration lot
                      </span>
                    ) : (
                      <p className="mt-auto font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-meta">
                        {lot.available ? "Available" : "Contracted"}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>
    </>
  );
}
