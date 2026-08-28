import type { Metadata } from "next";
import Link from "next/link";

import { ORG, ORIGIN, OPERATIONS, BUYERS, altitudeBand, harvestWindow } from "@/lib/org";
import {
  graph,
  aboutPageSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { ABOUT_FAQS } from "@/content/faqs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { SpecTable } from "@/components/primitives/data";
import { Figure } from "@/components/primitives/Figure";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export const metadata: Metadata = {
  title: "About Zoebar Business Group",
  description:
    "Zoebar Business Group FZE LLC is a UAE-registered international trading company connecting Ethiopia and international markets, with a flagship focus on Ethiopian Arabica green coffee from Amaro (Koore Zone), Ethiopia.",
  alternates: { canonical: "/about" },
  openGraph: { title: "About Zoebar Business Group", url: "/about", type: "website" },
};

/**
 * /about — story surface, opening deep.
 *
 * The company page carries the Organization entity, so every fact here is read
 * from `org.ts` rather than written into the markup. Legal address and TRN are
 * Open Item #10 and render as pending; the structure of the company — a UAE
 * entity, an Ethiopian entity being established, and an owned washing station
 * — is verified and is the substance of the page.
 */

/** The three commitments, from the Foundation Brief. */
const COMMITMENTS = [
  {
    n: "01",
    name: "Origin",
    detail:
      "Coffee bought at the point it is grown and processed, not several hands downstream. Zoebar Ethiopia owns the washing station in Amaro, which is what makes an origin claim checkable rather than repeated.",
    href: "/amaro",
    hrefLabel: "The origin",
  },
  {
    n: "02",
    name: "Quality",
    detail:
      "Quality is decided at intake, sorting and drying, and only recorded at the grading table. Controlling those stages is what makes the eventual specification meaningful.",
    href: "/quality",
    hrefLabel: "How quality is assessed",
  },
  {
    n: "03",
    name: "Trust",
    detail:
      "Every published figure is a confirmed figure. Where a fact has not been verified, this site says so rather than filling the gap with a plausible number.",
    href: "/traceability",
    hrefLabel: "How traceability works",
  },
];

/** One-line registered address, or null while Open Item #10 is outstanding. */
function formatAddress(): string | null {
  const a = ORG.legalAddress;
  if (!a) return null;
  return [
    a.streetAddress,
    a.addressLocality,
    a.addressRegion,
    a.postalCode,
    a.addressCountry,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            aboutPageSchema({
              name: `About ${ORG.name}`,
              description: ORG.description,
              path: "/about",
            }),
            faqSchema(ABOUT_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        eyebrow="About"
        title="Closer to origin."
        lede={ORG.positioning}
        meta={[
          { term: "Legal entity", detail: ORG.legalName },
          { term: "Registered", detail: "United Arab Emirates" },
          { term: "Ethiopia", detail: OPERATIONS.ethiopiaStatus },
          { term: "Flagship focus", detail: "Ethiopian Arabica green coffee" },
        ]}
      />

      {/* --- What Zoebar is -------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="story" aria-labelledby="what">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Eyebrow index="01" className="text-meta">
                The company
              </Eyebrow>
              <Answer
                id="what"
                className="mt-7"
                question={ABOUT_FAQS[0].question}
                answer={ABOUT_FAQS[0].answer}
              />
              <div className="mt-8 flex max-w-[58ch] flex-col gap-5 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]">
                <p>
                  The promise is three words ({ORG.promise.toLowerCase()}) and they
                  are meant in order. Origin comes first because everything downstream
                  depends on it. Quality is what the origin makes possible. Trust is
                  what the two produce when they are documented rather than asserted.
                </p>
                <p>
                  Coffee is the flagship, not the whole company. But it is where the
                  standard is set: if the coffee record holds up to a buyer checking it
                  against the sack in front of them, everything else Zoebar does can be
                  held to the same test.
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <Figure
                ratio="portrait"
                rounded="panel"
                src="/washing-station.jpg"
                alt={`The Zoebar washing station in ${OPERATIONS.washingStationLocation}, where cherry is received, processed and dried.`}
                brief="The Zoebar washing station in Amaro during working hours: the operational asset in use, photographed as a place of work rather than as a landscape."
                caption={`${OPERATIONS.ethiopiaEntity} owns the washing station in ${OPERATIONS.washingStationLocation}.`}
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- The three commitments -------------------------------------------- */}
      <Section surface="deep" rhythm="loose" density="story" aria-labelledby="commitments">
        <Container width="wide">
          <Eyebrow className="text-sand">The promise, in order</Eyebrow>
          <h2
            id="commitments"
            className="mt-7 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
          >
            {ORG.promise}
          </h2>

          <div className="mt-16 grid gap-px overflow-hidden bg-[rgba(240,226,203,0.16)] lg:grid-cols-3">
            {COMMITMENTS.map((c, i) => (
              <div
                key={c.n}
                data-animate
                style={{ ["--animate-delay" as string]: `${i * 60}ms` }}
                className="flex min-w-0 flex-col gap-5 bg-emerald p-8 sm:p-10"
              >
                <span
                  data-numeric
                  className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]"
                >
                  {c.n}
                </span>
                <h3 className="font-display text-[1.75rem] leading-tight text-alabaster">
                  {c.name}
                </h3>
                <p className="max-w-[40ch] font-sans text-[0.9375rem] leading-[1.7] text-[#cfd9d6]">
                  {c.detail}
                </p>
                <Link
                  href={c.href}
                  className="mt-auto pt-4 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-sand underline-offset-4 hover:underline"
                >
                  {c.hrefLabel}
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Structure --------------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="structure">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="02" className="text-meta">
                Structure
              </Eyebrow>
              <h2
                id="structure"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Two entities, one station.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                {ABOUT_FAQS[1].answer}
              </p>
              <p className="mt-5 max-w-[42ch] font-sans text-[0.9375rem] leading-[1.65] text-meta">
                Registered address and TRN are being verified and appear here, in the
                footer and in the Organization structured data at the same moment they
                are confirmed, because all three read from one record.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <SpecTable
                caption="Company record"
                rows={[
                  { label: "Legal entity", value: ORG.legalName },
                  { label: "Trading name", value: ORG.name },
                  { label: "Country of registration", value: "United Arab Emirates" },
                  { label: "Ethiopian entity", value: OPERATIONS.ethiopiaEntity },
                  { label: "Ethiopian status", value: OPERATIONS.ethiopiaStatus },
                  {
                    label: "Washing station",
                    value: `Owned, ${OPERATIONS.washingStationLocation}`,
                  },
                  {
                    label: "Origin",
                    value: `${ORIGIN.name} (${ORIGIN.zone}), ${ORIGIN.country}`,
                    note: "Amaro is an administrative zone and is not part of the Sidama Region.",
                  },
                  { label: "Altitude", value: `${altitudeBand()} masl` },
                  { label: "Harvest", value: harvestWindow() },
                  /* Null today (Open Item #10). Formatted rather than rendered
                     directly: a SpecRow value is a ReactNode, and the address
                     record is an object. */
                  { label: "Registered address", value: formatAddress() },
                  { label: "TRN", value: ORG.trn },
                  { label: "Founded", value: ORG.foundingDate },
                ]}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Who Zoebar works with --------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="buyers">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="03" className="text-meta">
                Who we work with
              </Eyebrow>
              <h2
                id="buyers"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Buyers who ask for the record.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                The site is built for buyers who check. Everything on it, the
                specification tables, the lot record, the guides, is designed to be
                read sceptically rather than skimmed.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <ul className="flex flex-col">
                {BUYERS.map((buyer, i) => (
                  <li
                    key={buyer}
                    className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-t border-[#d9d0bf] py-6"
                  >
                    <span
                      data-numeric
                      className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-[1.0625rem] leading-[1.6] text-ink">
                      {buyer}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-12 flex flex-wrap gap-4">
                <Button href="/request-quote">Request a quote</Button>
                <Button href="/about/founder" variant="secondary">
                  The founder
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Meet the founder ---------------------------------------------------
          The founder's own account is Open Item #7 and is being written with
          them. This section introduces and routes to it; it does not narrate a
          story on their behalf, and the portrait stays a composed panel until a
          real photograph is supplied. */}
      <Section surface="light" rhythm="base" density="story" aria-labelledby="founder">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Figure
                ratio="portrait"
                rounded="panel"
                brief="Portrait of the founder of Zoebar Business Group, in working context rather than a formal studio setting."
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            <div className="lg:col-span-7">
              <Eyebrow index="04" className="text-meta">
                The founder
              </Eyebrow>
              <h2
                id="founder"
                className="mt-7 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Meet the founder.
              </h2>

              <p className="mt-8 max-w-[58ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#3d423a]">
                {ORG.name} was built on a single conviction: that the distance
                between an Ethiopian coffee farm and the buyer who ends up with
                the sack is longer than it needs to be, and that most of what
                gets lost across it is information.
              </p>

              <p className="mt-6 max-w-[58ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#3d423a]">
                The founder&rsquo;s own account of why the company exists is
                being written with them, and will be published here once it is
                confirmed. It is not being drafted on their behalf in the
                meantime, for the same reason nothing else on this site is
                estimated: a story written for someone is not their story.
              </p>

              <div className="mt-12 flex flex-wrap gap-4">
                <Button href="/about/founder">Read the founder&rsquo;s page</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- What is next: the ecommerce arm ------------------------------------
          A teaser, deliberately not a route. There is no product, no catalogue
          and no launch date confirmed, so a dedicated page would be a page
          about an absence - and an indexable one. This block states the
          direction and nothing more. Give it its own page when the offer is
          defined. */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="whats-next">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="05" className="text-meta">
                What is next
              </Eyebrow>
              <h2
                id="whats-next"
                className="mt-7 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Beyond the sack.
              </h2>
            </div>

            <div className="lg:col-span-7">
              <p className="max-w-[58ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#3d423a]">
                Green coffee in container volumes is the flagship, and it sets
                the standard the rest of the company is held to. It is not the
                whole intent. An ecommerce arm is in development, to carry
                Zoebar coffee to buyers whose volumes sit below a container
                without asking them to accept a thinner record of where it came
                from.
              </p>

              <p className="mt-6 max-w-[58ch] font-sans text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.65] text-[#3d423a]">
                No catalogue, pricing or launch date is confirmed yet, so none
                is published here. The traceability that applies to a
                twenty-tonne lot is the same traceability that will apply to a
                single bag.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-6">
                <Button href="/contact" variant="secondary">
                  Register interest
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- FAQ ---------------------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="about-faq">
        <Container width="text">
          <h2
            id="about-faq"
            className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            The company, answered.
          </h2>
          <FaqList faqs={ABOUT_FAQS} className="mt-12" />
        </Container>
      </Section>
    </>
  );
}
