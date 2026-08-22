import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { graph, articleSchema, faqSchema, breadcrumbSchema } from "@/lib/schema";
import {
  publishedEntries,
  entryBySlug,
  entryReadingTime,
} from "@/content/journal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Blocks } from "@/components/primitives/Prose";

/**
 * /journal/[slug] — a journal entry.
 *
 * `ENTRIES` is currently empty, so this route generates zero pages and any
 * /journal/* URL correctly 404s. That is deliberate, not unfinished: an entry
 * carries a publication date and a named author in its Article schema, so a
 * seeded example would broadcast an invented date and attribution about a
 * harvest that did not happen. The template is complete and fills the moment
 * the client supplies real material (Strategy Open Item #12).
 */

export function generateStaticParams() {
  return publishedEntries().map((e) => ({ slug: e.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = entryBySlug(slug);
  if (!entry) return {};

  return {
    title: entry.navTitle,
    description: entry.description,
    alternates: { canonical: `/journal/${entry.slug}` },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: `/journal/${entry.slug}`,
      type: "article",
      publishedTime: entry.datePublished,
      modifiedTime: entry.dateModified,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function JournalEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = entryBySlug(slug);
  if (!entry) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: "Journal", path: "/journal" },
    { name: entry.navTitle, path: `/journal/${entry.slug}` },
  ];

  const others = publishedEntries()
    .filter((e) => e.slug !== entry.slug)
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            articleSchema({
              headline: entry.title.replace(/\.$/, ""),
              description: entry.description,
              path: `/journal/${entry.slug}`,
              datePublished: entry.datePublished,
              dateModified: entry.dateModified,
              author: entry.author,
            }),
            faqSchema(entry.faqs),
            breadcrumbSchema(trail),
          ),
        }}
      />

      <PageHeader
        trail={trail}
        eyebrow={entry.topic}
        title={entry.title}
        meta={[
          { term: "Published", detail: formatDate(entry.datePublished) },
          { term: "Last revised", detail: formatDate(entry.dateModified) },
          { term: "Author", detail: entry.author },
          { term: "Reading time", detail: `${entryReadingTime(entry)} min` },
        ]}
      />

      {/* --- The answer, first ---------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="answer">
        <Container width="text">
          <Answer id="answer" question={entry.question} answer={entry.answer} />
        </Container>
      </Section>

      {/* --- The entry ------------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="body">
        <Container width="text">
          <h2 id="body" className="sr-only">
            {entry.navTitle}
          </h2>

          <div className="flex flex-col gap-14">
            {entry.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 min-w-0">
                <h2 className="max-w-[24ch] font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.14] tracking-[-0.01em] text-ink">
                  {section.heading}
                </h2>
                <Blocks blocks={section.blocks} className="mt-7" />
              </section>
            ))}
          </div>
        </Container>
      </Section>

      {entry.faqs.length > 0 && (
        <Section surface="bone" rhythm="base" density="spec" aria-labelledby="entry-faq">
          <Container width="text">
            <h2
              id="entry-faq"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              Questions, answered.
            </h2>
            <FaqList faqs={entry.faqs} className="mt-12" />
          </Container>
        </Section>
      )}

      {/* --- More ------------------------------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="more">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              id="more"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              More from the journal.
            </h2>
            <Link
              href="/journal"
              className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
            >
              All entries
            </Link>
          </div>

          {others.length > 0 && (
            <ul className="mt-12 grid gap-px overflow-hidden bg-[#e2dbcd] sm:grid-cols-3">
              {others.map((other) => (
                <li key={other.slug} className="bg-alabaster">
                  <Link
                    href={`/journal/${other.slug}`}
                    className="group flex h-full flex-col gap-4 p-7"
                  >
                    <time
                      dateTime={other.datePublished}
                      data-numeric
                      className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#a8a294]"
                    >
                      {other.datePublished}
                    </time>
                    <h3 className="max-w-[22ch] font-display text-[1.25rem] leading-snug text-ink transition-colors duration-[200ms] group-hover:text-emerald-mid">
                      {other.navTitle}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/request-quote">Request a quote</Button>
            <Button href="/guides" variant="secondary">
              Buyer guides
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
