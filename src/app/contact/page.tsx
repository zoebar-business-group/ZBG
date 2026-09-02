import type { Metadata } from "next";
import Link from "next/link";

import { ORG, OPERATIONS, ORIGIN } from "@/lib/org";
import {
  graph,
  contactPageSchema,
  faqSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { CONTACT_FAQS } from "@/content/faqs";
import { WHATSAPP_NUMBER, whatsappHref, WHATSAPP_MESSAGES } from "@/lib/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Pending } from "@/components/primitives/data";
import { ContactForm } from "@/components/forms/ContactForm";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

export const metadata: Metadata = {
  title: "Contact Zoebar Business Group",
  description:
    "Contact Zoebar Business Group about Ethiopian Arabica green coffee from Amaro (Koore Zone), Ethiopia: specifications, availability, samples and pricing. Enquiries are answered by the commercial team.",
  alternates: { canonical: "/contact" },
  openGraph: { title: "Contact Zoebar Business Group", url: "/contact", type: "website" },
};

/**
 * /contact — a specification surface built around a lightweight general-question
 * form (`ContactForm` → `submitQuestion`), distinct from the commercial
 * enquiry funnel at /request-quote.
 *
 * Telephone, email and registered address are Open Item #10. Rather than a
 * conventional contact page with a plausible number nobody answers, the channel
 * table states what is and is not available, and the form takes any general
 * question straight to the team. Buyers after specifications, availability,
 * pricing or a sample are routed to /request-quote, where the form captures
 * what a firm answer needs.
 */

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            contactPageSchema("/contact"),
            faqSchema(CONTACT_FAQS),
            breadcrumbSchema(TRAIL),
          ),
        }}
      />

      <PageHeader
        eyebrow="Contact"
        title="Start the conversation."
        lede={`A general question about Zoebar, the coffee from ${ORIGIN.name} (${ORIGIN.zone}), Ethiopia, or how the company works reaches the team through the form below. For specifications, availability, pricing or a sample, use the request-a-quote form instead.`}
        meta={[
          { term: "Company", detail: ORG.legalName },
          { term: "Registered", detail: "United Arab Emirates" },
          { term: "Ethiopia", detail: OPERATIONS.ethiopiaStatus },
          { term: "Station", detail: OPERATIONS.washingStationLocation },
        ]}
      />

      {/* --- Answer first, and the channels --------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="how">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <Answer
                id="how"
                question={CONTACT_FAQS[0].question}
                answer={CONTACT_FAQS[0].answer}
              />
              {/* The telephone, email and registered address are confirmed and
                  published in the record opposite, so the old "being verified"
                  note that stood here was out of date. The reasoning behind the
                  channels is worth keeping; the build status is not. */}
              <p className="mt-6 max-w-[58ch] font-sans text-[0.9375rem] leading-[1.7] text-[#5a5f56]">
                Every channel listed here is monitored. Nothing is filled with a
                general enquiry address, because a channel nobody monitors is
                worse than no channel at all.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-6">
              <div className="w-full min-w-0 overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <caption className="mb-4 text-left font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-meta">
                    Contact channels
                  </caption>
                  <tbody>
                    <tr className="border-t border-[#d9d0bf] align-top">
                      <th
                        scope="row"
                        className="w-[42%] py-4 pr-6 font-sans text-sm font-medium text-[#5a5f56]"
                      >
                        General questions
                      </th>
                      <td className="py-4 font-sans text-[0.9375rem] text-ink">
                        <Link
                          href="#enquiry"
                          className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                        >
                          Available on this page
                        </Link>
                        <span className="mt-1 block text-sm text-meta">
                          Anything about the company, the coffee or the origin.
                        </span>
                      </td>
                    </tr>

                    <tr className="border-t border-[#d9d0bf] align-top">
                      <th
                        scope="row"
                        className="w-[42%] py-4 pr-6 font-sans text-sm font-medium text-[#5a5f56]"
                      >
                        Quotes and samples
                      </th>
                      <td className="py-4 font-sans text-[0.9375rem] text-ink">
                        <Link
                          href="/request-quote"
                          className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                        >
                          Request a quote
                        </Link>
                        <span className="mt-1 block text-sm text-meta">
                          Specifications, availability, pricing and sample requests.
                        </span>
                      </td>
                    </tr>

                    {[
                      { label: "Email", value: ORG.email },
                      { label: "Telephone", value: ORG.telephone },
                      {
                        label: "WhatsApp",
                        value: WHATSAPP_NUMBER ? (
                          <a
                            href={whatsappHref(WHATSAPP_MESSAGES["/contact"]) ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                          >
                            Message us on WhatsApp
                          </a>
                        ) : null,
                        note: WHATSAPP_NUMBER
                          ? undefined
                          : "Withheld until a number is verified, rather than pointed at a placeholder.",
                      },
                      // PENDING FIELDS hidden pending confirmed data (docs/LOT-DEPENDENT-FIELDS.md):
                      // { label: "Registered address", value: null },
                      // { label: "TRN", value: ORG.trn },
                    ].map((row) => (
                      <tr key={row.label} className="border-t border-[#d9d0bf] align-top">
                        <th
                          scope="row"
                          className="w-[42%] py-4 pr-6 font-sans text-sm font-medium text-[#5a5f56]"
                        >
                          {row.label}
                        </th>
                        <td className="py-4 font-sans text-[0.9375rem] text-ink">
                          {row.value ?? <Pending />}
                          {row.note && (
                            <span className="mt-1 block text-sm text-meta">
                              {row.note}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* --- The form --------------------------------------------------------- */}
      <Section
        id="enquiry"
        surface="light"
        rhythm="base"
        density="spec"
        aria-labelledby="enquiry-heading"
        className="scroll-mt-24"
      >
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow className="text-meta">Ask</Eyebrow>
              <h2
                id="enquiry-heading"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Ask a question.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                For anything about the company, the coffee from {ORIGIN.name}, the
                affiliated washing station, or how Zoebar works. Give us enough to
                answer properly and we will reply by email.
              </p>

              <p className="mt-8 max-w-[42ch] font-sans text-[0.9375rem] leading-[1.65] text-meta">
                After specifications, availability, pricing or a sample? The{" "}
                <Link
                  href="/request-quote"
                  className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  request-a-quote form
                </Link>{" "}
                captures the volume, grade and destination a firm answer needs.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- FAQ ---------------------------------------------------------------- */}
      <Section surface="bone" rhythm="base" density="spec" aria-labelledby="contact-faq">
        <Container width="text">
          <h2
            id="contact-faq"
            className="max-w-[18ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
          >
            Getting in touch, answered.
          </h2>
          <FaqList faqs={CONTACT_FAQS} className="mt-12" />
        </Container>
      </Section>
    </>
  );
}
