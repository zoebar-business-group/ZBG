import type { Metadata } from "next";

import { ORG, FOUNDER, OPERATIONS } from "@/lib/org";
import {
  graph,
  aboutPageSchema,
  personSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Figure } from "@/components/primitives/Figure";
import { Button } from "@/components/primitives/Button";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Founder", path: "/about/founder" },
];

const SUMMARY = `${FOUNDER.name} founded ${ORG.name} after years in monitoring, evaluation, research and learning, and built it on the belief that commercial success should rest on knowledge, relationships, transparency and continuous improvement.`;

export const metadata: Metadata = {
  title: `${FOUNDER.name}, Founder`,
  description: SUMMARY,
  alternates: { canonical: "/about/founder" },
  openGraph: {
    title: `${FOUNDER.name}, Founder of ${ORG.name}`,
    description: SUMMARY,
    url: "/about/founder",
    type: "profile",
  },
};

/**
 * /about/founder — the founder's account, in her own framing.
 *
 * The page stood empty until the client supplied both the portrait and the
 * text on 4 September 2026. The story now on the page is the client's own
 * working draft, carried verbatim from `FOUNDER.story` in `lib/org.ts` — it is
 * not paraphrased here, and nothing is added to it. The client has said they
 * may refine the wording before publication; replacing the strings in
 * `lib/org.ts` is the whole of that change.
 *
 * The three principles below are the client's own closing sentence, split into
 * its three clauses. They restate her text; they do not extend it.
 */

/** "Verify before claiming, understand before selling, and keep improving
 *  from one season to the next." — the founder's sentence, set out. */
const PRINCIPLES = [
  {
    n: "01",
    term: "Verify before claiming",
    detail:
      "A specification is published once it is confirmed. Figures that belong to a lot are confirmed on that lot, and nothing on this site is filled with an estimate to make a page look complete.",
  },
  {
    n: "02",
    term: "Understand before selling",
    detail:
      "Knowing how the coffee was grown, picked, processed and dried before it is offered. That is why processing sits at an affiliated washing station under direct operational oversight rather than at arm's length.",
  },
  {
    n: "03",
    term: "Keep improving, season to season",
    detail:
      "A harvest is a year of evidence. What it shows about picking, fermentation, drying and sorting is carried into the next one rather than repeated.",
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
              name: `${FOUNDER.name}, founder of ${ORG.name}`,
              description: SUMMARY,
              path: "/about/founder",
            }),
            personSchema({
              name: FOUNDER.name,
              jobTitle: FOUNDER.role,
              description: SUMMARY,
              path: "/about/founder",
              image: FOUNDER.portrait,
            }),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        surface="deep"
        eyebrow="Founder"
        title={FOUNDER.name}
        lede="A background in monitoring, evaluation, research and learning, brought to coffee and international trade."
        meta={[
          { term: "Role", detail: FOUNDER.role },
          { term: "Company", detail: ORG.name },
          { term: "Ethiopia", detail: OPERATIONS.ethiopiaStatus },
          { term: "Station", detail: OPERATIONS.washingStationLocation },
        ]}
      />

      {/* --- The account ------------------------------------------------------ */}
      <Section surface="light" rhythm="base" density="story" aria-labelledby="story">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              {/* 4:5, matching the file the portrait script writes, so the
                  photograph is never cropped back into a tight headshot. */}
              <Figure
                src={FOUNDER.portrait}
                alt={FOUNDER.portraitAlt}
                ratio="portraitSoft"
                rounded="panel"
                priority
                brief="Portrait of the founder of Zoebar Business Group."
                caption={`${FOUNDER.name}, ${FOUNDER.role.toLowerCase()}, ${ORG.name}.`}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>

            <div className="lg:col-span-7">
              <Eyebrow className="text-meta">In her own words</Eyebrow>
              <h2
                id="story"
                className="mt-6 max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Why this company exists.
              </h2>

              <div className="mt-8 flex max-w-[62ch] flex-col gap-6 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]">
                {FOUNDER.story.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>

              {/* The closing line, given the weight it carries in the client's
                  own text rather than folded into the last paragraph. */}
              <p className="mt-10 max-w-[24ch] border-t border-[#d9d0bf] pt-8 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-[1.15] tracking-[-0.015em] text-ink">
                {FOUNDER.refrain}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- The three principles --------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="principles">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-meta">The approach</Eyebrow>
              <h2
                id="principles"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                What the learning mindset means in practice.
              </h2>
              <p className="mt-7 max-w-[44ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                Three commitments, and each one is visible in how this site is
                built rather than only in how it is described.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <dl className="flex flex-col">
                {PRINCIPLES.map((item, i) => (
                  <div
                    key={item.term}
                    data-animate
                    style={{ ["--animate-delay" as string]: `${i * 60}ms` }}
                    className="border-t border-[#d9d0bf] py-7"
                  >
                    <dt className="flex items-baseline gap-4">
                      <span
                        data-numeric
                        className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint"
                      >
                        {item.n}
                      </span>
                      <span className="max-w-[46ch] font-display text-[1.25rem] leading-snug text-ink">
                        {item.term}
                      </span>
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
