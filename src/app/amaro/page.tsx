import type { Metadata } from "next";

import { ORIGIN, OPERATIONS, altitudeBand, harvestWindow } from "@/lib/org";
import {
  graph,
  originPlaceSchema,
  articleSchema,
  faqSchema,
  breadcrumbSchema,
  citableSummary,
} from "@/lib/schema";
import { AMARO_FAQS } from "@/content/faqs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Stat, Pending, SpecTable } from "@/components/primitives/data";
import { Figure } from "@/components/primitives/Figure";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Amaro", path: "/amaro" },
];

export const metadata: Metadata = {
  title: "Amaro, Ethiopia, Koore Zone Coffee Origin",
  description:
    "Amaro (Koore Zone), Ethiopia: Ethiopian Arabica grown at 1,700–1,800 masl, harvested September to December, processed at Zoebar's own washing station. How Amaro relates to the Sidama category.",
  alternates: { canonical: "/amaro" },
  openGraph: {
    title: "Amaro, Ethiopia, Koore Zone Coffee Origin",
    description: citableSummary(),
    url: "/amaro",
    type: "article",
  },
};

/**
 * /amaro — the primary citation target (Strategy 4.1).
 *
 * "Buyers search 'Sidama'; the truth is Koore Zone, commonly traded within the
 * broader Sidama category. Writing that accurately, prominently, on a
 * dedicated page serves the search term and the truth simultaneously. Nobody
 * else in the market has written it properly. Accuracy becomes the ranking
 * advantage."
 *
 * Story density: full-bleed, generous, photography-led — but the accuracy
 * section is deliberately set as a specification surface, because that is the
 * part a buyer needs to be able to scan and trust.
 */
export default function AmaroPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            originPlaceSchema(),
            articleSchema({
              headline: "Amaro, Ethiopia, Koore Zone coffee origin",
              description: citableSummary(),
              path: "/amaro",
            }),
            faqSchema(AMARO_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        eyebrow={`${ORIGIN.zone} · ${ORIGIN.country}`}
        title={`${ORIGIN.name}.`}
        lede={citableSummary()}
        meta={[
          { term: "Zone", detail: ORIGIN.zone },
          { term: "Altitude", detail: `${altitudeBand()} masl` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "Process", detail: ORIGIN.processing.join(" / ") },
        ]}
      />

      {/* --- The accuracy point. The reason this page exists. -------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="category">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="01" className="text-meta">
                Naming and category
              </Eyebrow>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <Answer
                id="category"
                question="Is Amaro coffee the same as Sidama coffee?"
                answer={AMARO_FAQS[1].answer}
              >
                <div className="mt-2 grid gap-px overflow-hidden rounded-[0.125rem] bg-[#ddd5c6] sm:grid-cols-2">
                  <div className="bg-alabaster p-6">
                    <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta">
                      Administratively
                    </p>
                    <p className="mt-3 font-display text-[1.5rem] leading-tight text-ink">
                      {ORIGIN.zone}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#5a5f56]">
                      An administrative zone in Ethiopia. Not part of the Sidama
                      Region.
                    </p>
                  </div>
                  <div className="bg-alabaster p-6">
                    <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-meta">
                      In the trade
                    </p>
                    <p className="mt-3 font-display text-[1.5rem] leading-tight text-ink">
                      Sidama category
                    </p>
                    <p className="mt-2 font-sans text-sm leading-relaxed text-[#5a5f56]">
                      Commonly presented within the broader Sidama coffee
                      category internationally.
                    </p>
                  </div>
                </div>
              </Answer>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Altitude, as a measured band ---------------------------------- */}
      <Section surface="deep" rhythm="loose" density="story" aria-labelledby="altitude">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow index="02" className="text-sand">
                Altitude
              </Eyebrow>
              <Answer
                id="altitude"
                onDark
                className="mt-7"
                question="How high is coffee grown in Amaro?"
                answer={`Coffee in Amaro, Koore Zone, Ethiopia is grown at approximately ${altitudeBand()} metres above sea level. The harvest runs approximately ${ORIGIN.harvestStart} to ${ORIGIN.harvestEnd}, and lots are processed as washed or natural at Zoebar's own washing station in Amaro.`}
              />

              <div className="mt-14 grid grid-cols-2 gap-8">
                <Stat
                  value={ORIGIN.altitudeMin.toLocaleString("en-US")}
                  unit="masl"
                  label="Lower band"
                  onDark
                  className="text-alabaster"
                />
                <Stat
                  value={ORIGIN.altitudeMax.toLocaleString("en-US")}
                  unit="masl"
                  label="Upper band"
                  onDark
                  className="text-alabaster"
                />
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-sm text-[#9db3b0]">Varieties</span>
                  <Pending onDark />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-sans text-sm text-[#9db3b0]">Coordinates</span>
                  <Pending onDark />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Figure
                ratio="portrait"
                rounded="panel"
                cut
                onDark
                src="/amaro.jpg"
                alt="Terraced coffee plots stepping down the hillsides of Amaro, Koore Zone, layered ridgelines receding into haze, no people in frame."
                brief="Amaro at altitude, the slope profile of the growing area, shot to show elevation and terrain rather than a single tree."
                caption={`Coffee in ${ORIGIN.name} grows between ${altitudeBand()} metres above sea level.`}
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Harvest and processing ---------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="harvest">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="03" className="text-meta">
                Harvest and processing
              </Eyebrow>
              <Answer
                id="harvest"
                className="mt-7"
                question="When is the Amaro harvest?"
                answer={AMARO_FAQS[2].answer}
              />
              <div className="mt-9">
                <Button href="/process" variant="quiet">
                  The full process
                </Button>
              </div>
            </div>
            <div className="min-w-0 lg:col-span-7">
              <SpecTable
                caption={`Origin reference, ${ORIGIN.name}, ${ORIGIN.country}`}
                rows={[
                  { label: "Origin", value: `${ORIGIN.name} (${ORIGIN.zone}), ${ORIGIN.country}` },
                  { label: "Trade category", value: "Commonly presented within Sidama" },
                  { label: "Species", value: ORIGIN.species },
                  { label: "Altitude", value: `${altitudeBand()} masl` },
                  { label: "Harvest", value: harvestWindow() },
                  { label: "Processing", value: ORIGIN.processing.join(" / ") },
                  { label: "Washing station", value: `Zoebar-owned, ${OPERATIONS.washingStationLocation}` },
                  { label: "Varieties", value: null },
                  { label: "Cupping profile", value: null },
                  { label: "Soil characteristics", value: null },
                ]}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- FAQ ------------------------------------------------------------ */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="faq">
        <Container width="text">
          <Eyebrow index="04" className="text-meta">
            Questions
          </Eyebrow>
          <h2
            id="faq"
            className="mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Amaro, answered.
          </h2>
          <FaqList faqs={AMARO_FAQS} className="mt-12" />
        </Container>
      </Section>

      {/* --- Next step ------------------------------------------------------ */}
      <Section surface="deep" rhythm="base" density="story" aria-labelledby="amaro-cta">
        <Container width="wide">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <h2
              id="amaro-cta"
              className="max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
            >
              Work with this origin.
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button href="/request-quote" onDark>
                Request a quote
              </Button>
              <Button href="/coffee" variant="secondary" onDark>
                View specifications
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
