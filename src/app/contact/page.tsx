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
import { WHATSAPP_NUMBER, WHATSAPP_ENABLED, whatsappHref, WHATSAPP_MESSAGES } from "@/lib/site";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Answer, FaqList } from "@/components/primitives/Answer";
import { Pending } from "@/components/primitives/data";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

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
 * /contact — a specification surface with the enquiry form on it.
 *
 * Telephone, email and registered address are Open Item #10 and render as
 * pending. That would make a conventional contact page useless, so this one is
 * built around the channel that does work: the enquiry form, which is the same
 * server action as /request-quote and delivers to the same place.
 *
 * The channel table lists what is and is not available deliberately. A buyer
 * who can see that the phone number is being verified — rather than finding a
 * plausible number that nobody answers — learns something accurate about the
 * company on their first visit.
 */

/** What to put in an enquiry so it can be answered in one exchange. */
const INCLUDE = [
  "The volume band you are working toward, even approximately.",
  "Processing method — washed, natural, or both.",
  "Your destination port or delivery point, which decides which Incoterms rules are relevant.",
  "Whether you want a quotation, a sample, or both.",
  "Any grading, moisture or certification requirement your market imposes.",
];

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
        trail={TRAIL}
        eyebrow="Contact"
        title="Start the conversation."
        lede={`Enquiries about Ethiopian Arabica green coffee from ${ORIGIN.name} (${ORIGIN.zone}), Ethiopia — specifications, availability, samples and pricing — reach the commercial team through the form below.`}
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
              <p className="mt-6 max-w-[58ch] font-sans text-[0.9375rem] leading-[1.7] text-[#5a5f56]">
                Direct telephone, email and the registered address are being verified.
                They are published here the moment they are confirmed rather than
                filled with a general enquiry address, because a channel nobody
                monitors is worse than no channel at all.
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
                        Enquiry form
                      </th>
                      <td className="py-4 font-sans text-[0.9375rem] text-ink">
                        <Link
                          href="#enquiry"
                          className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                        >
                          Available on this page
                        </Link>
                        <span className="mt-1 block text-sm text-meta">
                          Quotations and sample requests.
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
                      { label: "Registered address", value: null },
                      { label: "TRN", value: ORG.trn },
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
              <Eyebrow className="text-meta">Enquiry</Eyebrow>
              <h2
                id="enquiry-heading"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Tell us what you need.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                The more of this the first message carries, the fewer exchanges it
                takes to get you a real answer.
              </p>

              <ul className="mt-8 flex max-w-[46ch] flex-col gap-3">
                {INCLUDE.map((item) => (
                  <li
                    key={item}
                    className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-4 font-sans text-[0.9375rem] leading-[1.7] text-[#5a5f56]"
                  >
                    <span aria-hidden="true" className="pt-[0.7em] text-faint">
                      <span className="block h-px w-3 bg-current" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-8 max-w-[42ch] font-sans text-[0.9375rem] leading-[1.65] text-meta">
                Not sure which terms apply? The{" "}
                <Link
                  href="/guides/incoterms-green-coffee"
                  className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  Incoterms guide
                </Link>{" "}
                and the{" "}
                <Link
                  href="/guides/import-documentation-checklist"
                  className="underline decoration-[0.5px] decoration-faint underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  documentation checklist
                </Link>{" "}
                cover both before you write.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <EnquiryForm
                kind="quote"
                submitLabel="Send enquiry"
                whatsappEnabled={WHATSAPP_ENABLED}
              />
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
