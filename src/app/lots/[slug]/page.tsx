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
 * Lots come from Sanity (`publishedLots()` / `lotBySlug()`). Every existing lot
 * is pre-rendered at build; `dynamicParams` is `true` so a lot published after
 * a build renders on first request without a redeploy (the revalidation
 * webhook refreshes it thereafter). An unknown slug still 404s via `notFound()`.
 */

export async function generateStaticParams() {
  return (await publishedLots()).map((l) => ({ slug: l.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const lot = await lotBySlug(slug);
  if (!lot) return {};

  const description = lot.isDemo
    ? `Demonstration lot record for ${lot.lotId}, showing how a Zoebar lot page and its QR code work. Not a live commercial offer.`
    : `${lot.lotId}: ${lot.process} Ethiopian Arabica from ${lot.origin} (${lot.zone}), ${lot.country}, ${lot.harvestYear} harvest, processed at an affiliated washing station with Zoebar's direct operational oversight.`;

  const title = lot.isDemo
    ? `${lot.lotId}, demonstration lot record`
    : `${lot.lotId}, ${lot.origin} ${lot.harvestYear}`;

  return {
    title,
    description,
    alternates: { canonical: `/lots/${lot.slug}` },
    openGraph: { title, description, url: `/lots/${lot.slug}` },
    /* A demonstration record must not turn up in search as a live offer.
       The page still resolves, so a scanned QR code works during review. */
    ...(lot.isDemo ? { robots: { index: false, follow: false } } : {}),
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
  const lot = await lotBySlug(slug);
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
    {
      label: "Availability",
      /* A demonstration record has no availability to state. Saying
         "Available" on a demo lot is exactly the impression the client asked
         us to remove. */
      value: lot.isDemo
        ? "Not offered — demonstration record"
        : lot.available
          ? "Available"
          : "Contracted",
    },
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
            /* No Product node for a demonstration record. Product schema is a
               machine-readable offer, and a demo lot is not one. */
            lot.isDemo
              ? undefined
              : productSchema({
                  name: `${lot.lotId}, ${lot.process} Ethiopian Arabica, ${lot.origin}`,
                  description: `${lot.process} Ethiopian Arabica green coffee from ${lot.origin} (${lot.zone}), ${lot.country}, ${lot.harvestYear} harvest, processed at an affiliated washing station in ${ORIGIN.name} with Zoebar's direct operational oversight.`,
                  path: `/lots/${lot.slug}`,
                  properties,
                }),
            breadcrumbSchema(trail),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        eyebrow={
          lot.isDemo
            ? "Demonstration lot · not a live offer"
            : `${lot.origin} · ${lot.harvestYear} harvest`
        }
        title={lot.lotId}
        lede={
          lot.isDemo
            ? `A demonstration record, published so the QR code and the lot page can be reviewed end to end. The figures below are an example of the fields a real lot carries. This lot is not for sale, and nothing on this page describes coffee Zoebar is offering.`
            : `${lot.process} Ethiopian Arabica from ${lot.origin} (${lot.zone}), ${lot.country}, processed at an affiliated washing station with Zoebar's direct operational oversight.`
        }
        meta={
          lot.isDemo
            ? [
                { term: "Status", detail: "Demonstration record" },
                { term: "Offer", detail: "Not for sale" },
                { term: "Purpose", detail: "QR and lot-page review" },
              ]
            : [
                { term: "Process", detail: lot.process },
                { term: "Harvest", detail: String(lot.harvestYear) },
                ...(altitude(lot)
                  ? [{ term: "Altitude", detail: altitude(lot)! }]
                  : []),
                {
                  term: "Availability",
                  detail: lot.available ? "Available" : "Contracted",
                },
              ]
        }
      />

      {/* --- Demonstration banner ---------------------------------------------
          Client instruction, 4 September 2026: an example lot must be
          unmistakably a demo. This sits above the record, in the sand accent
          rather than in a muted pending chip, so it is read before the table
          is. It disappears entirely the moment `isDemo` is turned off in the
          Studio. */}
      {lot.isDemo && (
        <Section surface="light" rhythm="tight" density="spec" aria-labelledby="demo-notice">
          <Container width="wide">
            <div className="border-l-2 border-[#c9a227] bg-sand/40 px-7 py-6">
              <p
                id="demo-notice"
                className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink"
              >
                Demonstration lot — not a live commercial offer
              </p>
              <p className="mt-3 max-w-[68ch] font-sans text-[0.9375rem] leading-[1.7] text-[#3d423a]">
                {lot.lotId} is an example record used to show how a Zoebar lot
                page and its QR code work. It does not describe coffee that is
                available, and none of the figures on it should be read as a
                specification, an availability or a price. Real lots publish
                only once every figure on them is confirmed, and they carry no
                banner.
              </p>
            </div>
          </Container>
        </Section>
      )}

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

          {/* QR code. Both formats link to this page; physical printing and
              application to sacks/sample bags happens outside the app. */}
          <div className="mt-14 flex flex-col gap-6 rounded-[2rem] bg-bone p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-[1.5rem] leading-tight text-ink">
                Download the QR code
              </h3>
              <p className="mt-2 max-w-[48ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
                {lot.isDemo
                  ? `Links to this page. Provided so the scan can be tested end to end — do not print it on a sack, because ${lot.lotId} is a demonstration record.`
                  : `Links to this page. Print it on the sack or sample bag for ${lot.lotId}.`}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button
                href={`/lots/${lot.slug}/qr?format=svg`}
                variant="secondary"
                download
                ariaLabel={`Download the ${lot.lotId} QR code as SVG`}
              >
                SVG
              </Button>
              <Button
                href={`/lots/${lot.slug}/qr?format=png`}
                variant="secondary"
                download
                ariaLabel={`Download the ${lot.lotId} QR code as PNG`}
              >
                PNG
              </Button>
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

      {/* --- CTA --------------------------------------------------------------
          A demonstration record must not carry "Enquire about Lot 042" — that
          is the live-offer impression the client asked us to remove. The demo
          variant routes to the general enquiry instead, and says why. */}
      <Section surface="deep" rhythm="base" density="story" aria-labelledby="lot-cta">
        <Container width="wide">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[34ch]">
              <h2
                id="lot-cta"
                className="text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
              >
                {lot.isDemo ? "Ask about real lots." : `Enquire about ${lot.lotId}.`}
              </h2>
              {lot.isDemo && (
                <p className="mt-6 font-sans text-[1.0625rem] leading-[1.65] text-[#cfd9d6]">
                  {lot.lotId} is not for sale. For coffee that is, tell us what
                  you are looking for and we will send what is confirmed.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                href={
                  lot.isDemo ? "/request-quote" : `/request-quote?lot=${lot.slug}`
                }
                onDark
              >
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
