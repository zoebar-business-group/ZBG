import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ORIGIN } from "@/lib/org";
import { graph, productSchema, breadcrumbSchema } from "@/lib/schema";
import { publishedLots, lotBySlug, type Lot } from "@/content/lots";
import { producerBySlug } from "@/content/farmers";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";
import { Pending, SpecTable, type SpecRow } from "@/components/primitives/data";

/**
 * /lots/[slug] — the lot passport.
 *
 * This is the QR destination printed on sacks and sample bags (Strategy 5.4)
 * and the template for programmatic lot pages at scale (Strategy 10.1).
 *
 * `LOTS` is currently empty, so this route generates zero pages and any
 * /lots/* URL correctly 404s. That is deliberate: a lot page is a record about
 * physical coffee a buyer can hold, so a seeded example would be a false
 * record with a scannable code pointing at it. The template is complete and
 * fills the moment real lot data is confirmed.
 */

export function generateStaticParams() {
  return publishedLots().map((l) => ({ slug: l.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lot = lotBySlug(slug);
  if (!lot) return {};

  const description = `${lot.lotId}: ${lot.process} Ethiopian Arabica from ${lot.origin} (${lot.zone}), ${lot.country}, ${lot.harvestYear} harvest, processed at Zoebar's own washing station.`;

  return {
    title: `${lot.lotId} — ${lot.origin} ${lot.harvestYear}`,
    description,
    alternates: { canonical: `/lots/${lot.slug}` },
    openGraph: { title: `${lot.lotId} — ${lot.origin}`, description, url: `/lots/${lot.slug}` },
  };
}

function altitude(lot: Lot): string | null {
  if (lot.altitudeMin === null || lot.altitudeMax === null) return null;
  return `${lot.altitudeMin.toLocaleString("en-US")}–${lot.altitudeMax.toLocaleString("en-US")} masl`;
}

export default async function LotPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lot = lotBySlug(slug);
  if (!lot) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: "Coffee", path: "/coffee" },
    { name: lot.lotId, path: `/lots/${lot.slug}` },
  ];

  const identity: SpecRow[] = [
    { label: "Lot", value: lot.lotId },
    { label: "Origin", value: `${lot.origin} (${lot.zone}), ${lot.country}` },
    { label: "Harvest", value: String(lot.harvestYear) },
    { label: "Process", value: lot.process },
    { label: "Altitude", value: altitude(lot) },
  ];

  const quality: SpecRow[] = [
    { label: "Grade", value: lot.grade },
    { label: "Screen size", value: lot.screenSize },
    { label: "Cupping score", value: lot.cuppingScore },
    { label: "Moisture content", value: lot.moistureContent },
  ];

  const commercial: SpecRow[] = [
    { label: "Packing", value: lot.packing },
    { label: "Quantity", value: lot.quantity },
    { label: "Availability", value: lot.available ? "Available" : "Contracted" },
  ];

  // Only fields with confirmed values reach structured data.
  const properties = [
    { name: "lotId", value: lot.lotId },
    { name: "origin", value: `${lot.origin} (${lot.zone}), ${lot.country}` },
    { name: "harvestYear", value: String(lot.harvestYear) },
    { name: "processingMethod", value: lot.process },
    ...(altitude(lot) ? [{ name: "altitude", value: altitude(lot)! }] : []),
    ...(lot.grade ? [{ name: "grade", value: lot.grade }] : []),
    ...(lot.screenSize ? [{ name: "screenSize", value: lot.screenSize }] : []),
    ...(lot.cuppingScore ? [{ name: "cuppingScore", value: lot.cuppingScore }] : []),
    ...(lot.moistureContent
      ? [{ name: "moistureContent", value: lot.moistureContent }]
      : []),
  ];

  const producers = lot.producerSlugs
    .map((s) => producerBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            productSchema({
              name: `${lot.lotId} — ${lot.process} Ethiopian Arabica, ${lot.origin}`,
              description: `${lot.process} Ethiopian Arabica green coffee from ${lot.origin} (${lot.zone}), ${lot.country}, ${lot.harvestYear} harvest, processed at Zoebar's own washing station in ${ORIGIN.name}.`,
              path: `/lots/${lot.slug}`,
              properties,
            }),
            breadcrumbSchema(trail),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        trail={trail}
        eyebrow={`${lot.origin} · ${lot.harvestYear} harvest`}
        title={lot.lotId}
        lede={`${lot.process} Ethiopian Arabica from ${lot.origin} (${lot.zone}), ${lot.country}, processed at Zoebar's own washing station.`}
        meta={[
          { term: "Process", detail: lot.process },
          { term: "Harvest", detail: String(lot.harvestYear) },
          { term: "Altitude", detail: altitude(lot) ?? <Pending onDark /> },
          {
            term: "Availability",
            detail: lot.available ? "Available" : "Contracted",
          },
        ]}
      />

      {/* --- The record ----------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="record">
        <Container width="wide">
          <h2
            id="record"
            className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            The lot record.
          </h2>
          <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-10">
            <div className="min-w-0">
              <SpecTable caption="Identity" rows={identity} />
            </div>
            <div className="min-w-0">
              <SpecTable caption="Quality" rows={quality} />
            </div>
            <div className="min-w-0">
              <SpecTable caption="Commercial" rows={commercial} />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Producers ------------------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="story" aria-labelledby="producers">
        <Container width="wide">
          <Eyebrow className="text-meta">Producers</Eyebrow>
          <h2
            id="producers"
            className="mt-6 max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Who grew this lot.
          </h2>

          {producers.length === 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <p className="max-w-[52ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                Producer profiles for this lot publish once each grower has given
                documented permission to be named.
              </p>
              <Pending>Awaiting permissions</Pending>
            </div>
          ) : (
            <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {producers.map((p) => (
                <li key={p.slug} className="border-t border-[#ddd5c6] pt-5">
                  <Link href={`/farmers/${p.slug}`} className="group block">
                    <h3 className="font-display text-[1.5rem] leading-tight text-ink">
                      {p.name}
                    </h3>
                    <p className="mt-2 font-sans text-sm text-[#5a5f56]">
                      {p.plot}
                      {p.altitude ? ` · ${p.altitude.toLocaleString("en-US")} masl` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* --- CTA -------------------------------------------------------------- */}
      <Section surface="deep" rhythm="base" density="story" aria-labelledby="lot-cta">
        <Container width="wide">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2
              id="lot-cta"
              className="max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
            >
              Enquire about {lot.lotId}.
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button href={`/request-quote?lot=${lot.slug}`} onDark>
                Request a quote
              </Button>
              <Button href="/request-quote#sample" variant="secondary" onDark>
                Request a sample
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
