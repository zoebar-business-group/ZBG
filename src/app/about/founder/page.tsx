import type { Metadata } from "next";

import { ORG, OPERATIONS } from "@/lib/org";
import { graph, aboutPageSchema, breadcrumbSchema } from "@/lib/schema";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/data";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Founder", path: "/about/founder" },
];

export const metadata: Metadata = {
  title: "The Founder",
  description:
    "The founder's account of why Zoebar Business Group was built, in their own words. Being prepared with the founder and published once confirmed.",
  alternates: { canonical: "/about/founder" },
  openGraph: { title: "The Founder", url: "/about/founder", type: "profile" },
  /**
   * NOINDEX WHILE UNWRITTEN. The route ships because it is linked from the
   * footer and from /about, and a 404 there is a visible defect. It stays out
   * of the index until it carries the founder's actual account — Strategy Open
   * Item #7. Remove this, and the noindex/built flags in `lib/site.ts`, when
   * the material lands.
   */
  robots: { index: false, follow: true },
};

/**
 * /about/founder — pending, and honest about it.
 *
 * A founder page is a first-person account. Writing one from inference would
 * put words in a real, named person's mouth and publish them under their own
 * name: the most serious form of invented fact this site could commit, and
 * squarely against the trust rule.
 *
 * So this page carries what is true today — that the account is being written
 * with the founder — and states what it will contain, which is a real answer
 * to "who is behind this company?" even before the story is told.
 */

/** What the founder's account will cover. A commitment, not a summary. */
const SCOPE = [
  {
    term: "Why coffee, and why Amaro",
    detail:
      "The decision to build around a single origin and a single washing station rather than a broad trading book.",
  },
  {
    term: "Why the station was bought, not contracted",
    detail:
      "Owning the point where quality is decided is expensive and slow. The account will set out the reasoning behind choosing it anyway.",
  },
  {
    term: "What the company is for",
    detail: `The founder's own framing of the positioning this site is built on: ${ORG.positioning.toLowerCase()}`,
  },
  {
    term: "What has not gone to plan",
    detail:
      "An account that only contains successes is a brochure. The one published here will include what proved harder than expected.",
  },
];

export default function FounderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            aboutPageSchema({
              name: `The founder of ${ORG.name}`,
              description:
                "The founder's account of why Zoebar Business Group was built. Being prepared with the founder.",
              path: "/about/founder",
            }),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        trail={TRAIL}
        eyebrow="Founder"
        title="In their own words."
        lede="The founder's account of why this company exists is being written with the founder, and will be published here when it is confirmed. It is not being drafted on their behalf in the meantime."
        meta={[
          { term: "Status", detail: <Pending>In preparation</Pending> },
          { term: "Company", detail: ORG.name },
          { term: "Ethiopia", detail: OPERATIONS.ethiopiaStatus },
          { term: "Station", detail: OPERATIONS.washingStationLocation },
        ]}
      />

      {/* --- Why the page is empty ------------------------------------------- */}
      <Section surface="light" rhythm="base" density="story" aria-labelledby="why-empty">
        <Container width="text">
          <Eyebrow className="text-[#7b8079]">The position</Eyebrow>
          <h2
            id="why-empty"
            className="mt-6 max-w-[22ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            A founder&rsquo;s story cannot be written for them.
          </h2>

          <div className="mt-8 flex max-w-[64ch] flex-col gap-6 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]">
            <p>
              Most of this site withholds a number until it is confirmed. This page
              withholds something harder to fake and easier to get wrong: a person&rsquo;s
              own account of their own decisions.
            </p>
            <p>
              A founder page assembled from what is publicly known would be a
              first-person narrative written by someone who was not there, published
              under a real person&rsquo;s name. That is a more serious invention than a
              cupping score, not a lesser one, and the same rule applies to it.
            </p>
            <p>
              So the page waits. What follows is what the account will cover, published
              in advance so it can be held against the version that eventually appears.
            </p>
          </div>
        </Container>
      </Section>

      {/* --- What it will cover ------------------------------------------------ */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="scope">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-[#7b8079]">What it will cover</Eyebrow>
              <h2
                id="scope"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Four things, on the record.
              </h2>
              <div className="mt-8 flex items-center gap-3">
                <span className="font-sans text-sm text-[#7b8079]">Founder account</span>
                <Pending />
              </div>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <dl className="flex flex-col">
                {SCOPE.map((item) => (
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
                <Button href="/about">About the company</Button>
                <Button href="/request-quote" variant="secondary">
                  Request a quote
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
