import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ORG } from "@/lib/org";
import {
  graph,
  articleSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { GUIDES, guideBySlug, guideReadingTime } from "@/content/guides";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Button } from "@/components/primitives/Button";
import { Blocks } from "@/components/primitives/Prose";

/**
 * /guides/[slug] — a pillar reference guide.
 *
 * Answer-first (Strategy 5.2): the H2 immediately below the header is the
 * buyer's question and the paragraph beneath it is a self-contained answer
 * that survives being quoted alone. Everything after it is depth for the human
 * reader.
 *
 * Article schema carries real `datePublished` and `dateModified` values taken
 * from the guide record — the dates the guide was written and last revised.
 * They are never refreshed to look current.
 */

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) return {};

  return {
    title: guide.navTitle,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      type: "article",
    },
  };
}

/** Long month-day-year, stable across locales because it is fixed to en-GB. */
function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideBySlug(slug);
  if (!guide) notFound();

  const trail = [
    { name: "Home", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: guide.navTitle, path: `/guides/${guide.slug}` },
  ];

  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            articleSchema({
              headline: guide.title.replace(/\.$/, ""),
              description: guide.description,
              path: `/guides/${guide.slug}`,
              datePublished: guide.datePublished,
              dateModified: guide.dateModified,
              author: ORG.name,
            }),
            faqSchema(guide.faqs),
            breadcrumbSchema(trail),
          ),
        }}
      />

      <PageHeader
        trail={trail}
        eyebrow="Guide"
        title={guide.title}
        meta={[
          { term: "Reading time", detail: `${guideReadingTime(guide)} min` },
          { term: "Published", detail: formatDate(guide.datePublished) },
          { term: "Last revised", detail: formatDate(guide.dateModified) },
          { term: "Author", detail: ORG.name },
        ]}
      />

      {/* --- The answer, first ---------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="answer">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Answer id="answer" question={guide.question} answer={guide.answer} />
            </div>

            {/* Contents. A plain anchor list — present in the DOM, no JS. */}
            <nav aria-labelledby="contents" className="min-w-0 lg:col-span-5">
              <p
                id="contents"
                className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-meta"
              >
                Contents
              </p>
              <ol className="mt-6 flex flex-col">
                {guide.sections.map((section, i) => (
                  <li key={section.id} className="border-t border-[#d9d0bf]">
                    <a
                      href={`#${section.id}`}
                      className="group grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-4 font-sans text-[0.9375rem] leading-snug text-[#5a5f56] transition-colors duration-[200ms] hover:text-ink"
                    >
                      <span
                        data-numeric
                        aria-hidden="true"
                        className="pt-[0.2em] text-[0.625rem] font-medium tabular-nums tracking-[0.16em] text-faint"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{section.heading}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </Container>
      </Section>

      {/* --- The guide body -------------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="body">
        <Container width="wide">
          <h2 id="body" className="sr-only">
            {guide.navTitle}
          </h2>

          <div className="flex flex-col gap-16 sm:gap-20">
            {guide.sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                /* scroll-mt clears the fixed navigation when an anchor lands. */
                className="scroll-mt-28 grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-16"
              >
                <div className="lg:col-span-4">
                  <div className="lg:sticky lg:top-28">
                    <p
                      data-numeric
                      aria-hidden="true"
                      className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-5 max-w-[20ch] font-display text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.14] tracking-[-0.01em] text-ink">
                      {section.heading}
                    </h2>
                  </div>
                </div>

                <div className="min-w-0 lg:col-span-8">
                  <Blocks blocks={section.blocks} />
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      {/* --- Questions ------------------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="guide-faq">
        <Container width="text">
          <h2
            id="guide-faq"
            className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Questions, answered.
          </h2>
          <FaqList faqs={guide.faqs} className="mt-12" />
          <div className="mt-12 flex flex-wrap gap-4">
            <Button href="/request-quote">Request a quote</Button>
            <Button href="/coffee" variant="secondary">
              Specifications
            </Button>
          </div>
        </Container>
      </Section>

      {/* --- The rest of the set --------------------------------------------- */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="more-guides">
        <Container width="wide">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h2
              id="more-guides"
              className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
            >
              The rest of the set.
            </h2>
            <Link
              href="/guides"
              className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ink underline-offset-4 hover:underline"
            >
              All guides
            </Link>
          </div>

          <ul className="mt-12 grid gap-px overflow-hidden bg-[#e2dbcd] sm:grid-cols-3">
            {others.map((other) => (
              <li key={other.slug} className="bg-alabaster">
                <Link href={`/guides/${other.slug}`} className="group flex h-full flex-col gap-4 p-7">
                  <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-faint">
                    Guide
                  </p>
                  <h3 className="max-w-[20ch] font-display text-[1.25rem] leading-snug text-ink transition-colors duration-[200ms] group-hover:text-emerald-mid">
                    {other.navTitle}
                  </h3>
                  <p className="mt-auto font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-meta">
                    {guideReadingTime(other)} min read
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
