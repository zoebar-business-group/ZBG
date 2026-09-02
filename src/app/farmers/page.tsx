import type { Metadata } from "next";
import Link from "next/link";

import { ORIGIN, altitudeBand } from "@/lib/org";
import {
  graph,
  articleSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { FARMER_FAQS } from "@/content/faqs";
import { publishedProducers } from "@/content/farmers";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Figure } from "@/components/primitives/Figure";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Farmers", path: "/farmers" },
];

export const metadata: Metadata = {
  title: "Producers, The Growers of Amaro",
  description:
    "The producers who grow Zoebar's coffee in Amaro (Koore Zone), Ethiopia, at 1,700–1,800 masl. Named individually, with plot and altitude, where documented permission has been given.",
  alternates: { canonical: "/farmers" },
  openGraph: {
    title: "Producers, The Growers of Amaro",
    url: "/farmers",
    type: "article",
  },
};

/**
 * /farmers — story surface.
 *
 * Farmer credit is a stated purpose of the site (Strategy 0), not a decoration.
 * Two rules govern this page absolutely:
 *   1. Producers are skilled producers. No charity, poverty or rescue framing.
 *   2. No profile publishes without documented permission.
 *
 * Both are enforced structurally: `publishedProducers()` is the only accessor,
 * and it filters on the permission field.
 */
export default function FarmersPage() {
  const producers = publishedProducers();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            articleSchema({
              headline: "Producers, the growers of Amaro",
              description:
                "The producers who grow Zoebar's coffee in Amaro (Koore Zone), Ethiopia, named individually with plot and altitude where documented permission has been given.",
              path: "/farmers",
            }),
            faqSchema(FARMER_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        eyebrow="The producers"
        title="The people who grew it."
        lede={FARMER_FAQS[0].answer}
        meta={[
          { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Zone", detail: ORIGIN.zone },
          { term: "Altitude", detail: `${altitudeBand()} masl` },
          { term: "Published profiles", detail: producers.length },
        ]}
      />

      {/* --- Why this page exists ------------------------------------------- */}
      <Section
        surface="light"
        rhythm="base"
        density="story"
        aria-labelledby="credit"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="01" className="text-meta">
                Producer credit
              </Eyebrow>
            </div>
            <div className="lg:col-span-7">
              <Answer
                id="credit"
                question="Why does Zoebar name its producers?"
                answer="Producer credit is a stated purpose of this site. The people who grow the coffee in Amaro, Koore Zone, Ethiopia will be named with their plot and altitude, with lot pages linking back to them as profiles are added. This is what will turn traceability from a marketing claim into a checkable fact."
              />
              <p className="mt-8 max-w-[58ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
                Profiles are built from the producer&rsquo;s own account of
                their work: the plot they farm, the altitude they farm at, how
                long they have worked with Zoebar, and their own words where
                they choose to give them. Producers are the skilled specialists
                behind the coffee, and the page is written that way.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Profiles, or an honest empty state ------------------------------ */}
      <Section
        surface="bone"
        rhythm="base"
        density="story"
        aria-labelledby="profiles"
      >
        <Container width="wide">
          {producers.length === 0 ? (
            /* No published profiles yet. This carries the same content as the
               homepage producers chapter — statement, then the photographs —
               rather than an "in progress" status panel describing work still
               to be done. The CTA the homepage carries is dropped: it points
               here, and the reader is already here. */
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <h2
                  id="profiles"
                  className="max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
                >
                  The people who grew it, named.
                </h2>
                <p className="mt-7 max-w-[52ch] font-sans text-[1.0625rem] leading-[1.65] text-[#3d423a]">
                  Producer credit is a stated purpose of this site. Each profile
                  carries the grower&rsquo;s name, plot, altitude and their own
                  words, and lot pages link back to the people who grew the lot.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6">
                {/* Both are landscape frames in portrait slots and both
                    producers stand to the left, so the crop is anchored left;
                    the default centre crop cuts through the face. */}
                <Figure
                  src="/farmer-one.jpg"
                  alt="A coffee producer in a worn brown jacket picking ripe red cherry by hand from a laden branch at their plot in Amaro, Koore Zone."
                  ratio="portrait"
                  rounded="card"
                  focus="left"
                  brief="A producer hand-picking ripe cherry at their plot in Amaro, seen in profile among the coffee trees, natural light, unposed."
                  sizes="(max-width: 640px) 100vw, 24vw"
                />
                <Figure
                  src="/zoebarfarmers1.jpeg"
                  alt="A coffee producer standing among cherry-laden coffee trees at his plot in Amaro, Koore Zone, reaching to a branch of ripening cherry, forested hillside behind."
                  ratio="portrait"
                  rounded="card"
                  cut
                  focus="left"
                  className="sm:mt-12"
                  brief="A producer at his plot in Amaro among the coffee trees, cherry ripening on the branch, documentary, natural light."
                  sizes="(max-width: 640px) 100vw, 24vw"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Same id as the heading in the empty branch, so the section's
                  aria-labelledby resolves either way. */}
              <h2
                id="profiles"
                className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Producer profiles.
              </h2>
              <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {producers.map((p) => (
                <li key={p.slug}>
                  <Link href={`/farmers/${p.slug}`} className="group block">
                    <Figure
                      ratio="portrait"
                      rounded="card"
                      src={p.photo ?? undefined}
                      alt={p.photoAlt ?? undefined}
                      brief={`Portrait of ${p.name} at their plot in ${p.plot}.`}
                      sizes="(max-width: 640px) 100vw, 30vw"
                    />
                    <h3 className="mt-5 font-display text-[1.5rem] leading-tight text-ink">
                      {p.name}
                    </h3>
                    <p className="mt-2 font-sans text-sm text-[#5a5f56]">
                      {p.plot}
                      {p.altitude
                        ? ` · ${p.altitude.toLocaleString("en-US")} masl`
                        : ""}
                    </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Container>
      </Section>

      {/* --- FAQ ------------------------------------------------------------- */}
      <Section
        surface="light"
        rhythm="base"
        density="spec"
        aria-labelledby="farmer-faq"
      >
        <Container width="text">
          <h2
            id="farmer-faq"
            className="max-w-[20ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Producers, answered.
          </h2>
          <FaqList faqs={FARMER_FAQS} className="mt-12" />
        </Container>
      </Section>
    </>
  );
}
