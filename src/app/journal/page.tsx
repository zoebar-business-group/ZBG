import type { Metadata } from "next";
import Link from "next/link";

import { ORIGIN, harvestWindow } from "@/lib/org";
import { graph, collectionSchema, breadcrumbSchema } from "@/lib/schema";
import {
  publishedEntries,
  entryReadingTime,
  EDITORIAL_STANDARD,
} from "@/content/journal";
import { GUIDES } from "@/content/guides";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";
import { Pending } from "@/components/primitives/data";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Journal", path: "/journal" },
];

export const metadata: Metadata = {
  title: "Journal — Harvest Notes and Origin Reporting",
  description:
    "Zoebar's editorial record: harvest notes, washing station updates and origin reporting from Amaro (Koore Zone), Ethiopia. Every entry dated, attributed and corrected in public.",
  alternates: { canonical: "/journal" },
  openGraph: {
    title: "Journal — Harvest Notes and Origin Reporting",
    url: "/journal",
    type: "website",
  },
  /**
   * NOINDEX WHILE EMPTY. Not a technical oversight — a decision.
   *
   * The route ships because /journal is in the primary navigation and a 404
   * there is a visible defect. It stays out of the index because a section
   * with no entries is thin content, and submitting it would work against the
   * "100% of pages indexed clean" target in Strategy 8.
   *
   * Remove this block, and the noindex/built flags in `lib/site.ts`, when the
   * first entry is published. The condition is evaluated at build time so the
   * page indexes automatically once entries exist.
   */
  robots: publishedEntries().length === 0 ? { index: false, follow: true } : undefined,
};

/**
 * /journal — the editorial index.
 *
 * Deliberately not a blog card grid (Strategy: editorial index). Entries read
 * as a dated record: date, topic, headline, summary. With zero entries the
 * page states that plainly and says what the standard is, rather than
 * disguising the gap with placeholder posts.
 */
export default function JournalPage() {
  const entries = publishedEntries();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            collectionSchema({
              name: "Journal",
              description:
                "Zoebar's editorial record: harvest notes, washing station updates and origin reporting from Amaro (Koore Zone), Ethiopia.",
              path: "/journal",
              items: entries.map((e) => ({
                name: e.title,
                path: `/journal/${e.slug}`,
              })),
            }),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        trail={TRAIL}
        eyebrow="Journal"
        title="The record, as it happens."
        lede={`Harvest notes, washing station updates and origin reporting from ${ORIGIN.name} (${ORIGIN.zone}), Ethiopia. Entries are dated, attributed and corrected in public — because a journal that is quietly edited is not a record.`}
        meta={[
          { term: "Entries", detail: entries.length || <Pending>None yet</Pending> },
          { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "Publisher", detail: "Zoebar Business Group" },
        ]}
      />

      {/* --- Entries, or the honest absence of them -------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="entries">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              id="entries"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Entries.
            </h2>
            {entries.length === 0 && <Pending>Awaiting first entry</Pending>}
          </div>

          {entries.length === 0 ? (
            <div className="mt-12 border-t border-[#e2dbcd] pt-10">
              <div className="flex max-w-[64ch] flex-col gap-6 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]">
                <p>
                  No entries are published yet. The journal opens with the first
                  harvest note written from the washing station, not with material
                  written to fill the page in the meantime.
                </p>
                <p>
                  That is a slower start than a seeded archive would give, and it is
                  the point. An entry here carries a publication date and an author in
                  its structured data, which means a post invented to make the section
                  look active would be a dated, attributed claim about a harvest that
                  did not happen.
                </p>
                <p>
                  Reference material is available now: the{" "}
                  <Link
                    href="/guides"
                    className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                  >
                    guides
                  </Link>{" "}
                  cover grading, the harvest and shipping calendar, import
                  documentation and Incoterms.
                </p>
              </div>

              <ul className="mt-12 grid gap-px overflow-hidden bg-[#e2dbcd] sm:grid-cols-2 lg:grid-cols-4">
                {GUIDES.map((guide) => (
                  <li key={guide.slug} className="bg-alabaster">
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="group flex h-full flex-col gap-4 p-7"
                    >
                      <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint">
                        Guide
                      </p>
                      <h3 className="max-w-[20ch] font-display text-[1.1875rem] leading-snug text-ink transition-colors duration-[200ms] group-hover:text-emerald-mid">
                        {guide.navTitle}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <ol className="mt-12 flex flex-col">
              {entries.map((entry) => (
                <li key={entry.slug} className="border-t border-[#e2dbcd]">
                  <Link
                    href={`/journal/${entry.slug}`}
                    className="group grid grid-cols-1 items-start gap-4 py-10 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:gap-x-8"
                  >
                    <div className="flex flex-col gap-2 sm:pt-2">
                      <time
                        dateTime={entry.datePublished}
                        data-numeric
                        className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-meta"
                      >
                        {entry.datePublished}
                      </time>
                      <span className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint">
                        {entry.topic}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="max-w-[26ch] font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.12] tracking-[-0.01em] text-ink transition-colors duration-[200ms] group-hover:text-emerald-mid">
                        {entry.title}
                      </h3>
                      <p className="mt-4 max-w-[62ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                        {entry.description}
                      </p>
                      <p className="mt-6 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-meta">
                        {entryReadingTime(entry)} min read
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Container>
      </Section>

      {/* --- Editorial standard ---------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="standard">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-meta">Editorial standard</Eyebrow>
              <h2
                id="standard"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                What an entry has to be.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                These rules are published before the first entry rather than after,
                so they can be held against every entry that follows.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <dl className="flex flex-col">
                {EDITORIAL_STANDARD.map((item) => (
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
                <Button href="/amaro">The origin</Button>
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
