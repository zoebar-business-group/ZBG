import type { Metadata } from "next";
import Link from "next/link";

import { ORIGIN, altitudeBand } from "@/lib/org";
import { graph, articleSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import { FARMER_FAQS } from "@/content/faqs";
import { publishedProducers } from "@/content/farmers";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/data";
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
  openGraph: { title: "Producers, The Growers of Amaro", url: "/farmers", type: "article" },
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
          { term: "Published profiles", detail: producers.length || <Pending /> },
        ]}
      />

      {/* --- Why this page exists ------------------------------------------- */}
      <Section surface="light" rhythm="base" density="story" aria-labelledby="credit">
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
                answer="Producer credit is a stated purpose of this site. The people who grow the coffee in Amaro, Koore Zone, Ethiopia are named with their plot and altitude, and lot pages link back to them. This is what turns traceability from a marketing claim into a checkable fact."
              />
              <p className="mt-8 max-w-[58ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
                Profiles are built from the producer&rsquo;s own account of their work:
                the plot they farm, the altitude they farm at, how long they have
                worked with Zoebar, and their own words where they choose to give
                them. Producers are the skilled specialists behind the coffee, and
                the page is written that way.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Profiles, or an honest empty state ------------------------------ */}
      <Section surface="bone" rhythm="base" density="story" aria-labelledby="profiles">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              id="profiles"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Producer profiles.
            </h2>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-meta">Status</span>
              {producers.length === 0 && <Pending>Awaiting permissions</Pending>}
            </div>
          </div>

          {producers.length === 0 ? (
            <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-6">
                <p className="max-w-[52ch] font-sans text-[1.0625rem] leading-[1.65] text-[#3d423a]">
                  No profiles are published yet. A profile cannot go live until the
                  producer has given documented permission for their name,
                  photograph and words to be used.
                </p>
                <p className="mt-5 max-w-[52ch] font-sans text-[0.9375rem] leading-[1.65] text-[#5a5f56]">
                  Profiles are added progressively as those permissions are
                  recorded, rather than the page launching with stand-in people.
                  Each will carry the producer&rsquo;s name, plot, altitude, years
                  working with Zoebar and the lots they contributed to.
                </p>
                <div className="mt-9">
                  <Button href="/traceability" variant="quiet">
                    How lots link to producers
                  </Button>
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-6">
                <Figure
                  ratio="portrait"
                  rounded="card"
                  brief="Producer portrait at their own plot, working context, direct and unposed. Publication requires documented permission."
                  sizes="(max-width: 640px) 100vw, 24vw"
                />
                <Figure
                  ratio="portrait"
                  rounded="card"
                  cut
                  className="sm:mt-12"
                  brief="A producer delivering cherry to the Zoebar washing station at Amaro, documentary, no staging."
                  sizes="(max-width: 640px) 100vw, 24vw"
                />
              </div>
            </div>
          ) : (
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
                      {p.altitude ? ` · ${p.altitude.toLocaleString("en-US")} masl` : ""}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* --- FAQ ------------------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="farmer-faq">
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
