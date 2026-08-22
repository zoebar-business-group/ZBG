import type { Metadata } from "next";

import { ORIGIN, ORG, altitudeBand, harvestWindow } from "@/lib/org";
import { graph, breadcrumbSchema } from "@/lib/schema";
import { isDeliveryConfigured } from "@/lib/enquiry";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section, Eyebrow } from "@/components/primitives/layout";
import { Pending } from "@/components/primitives/data";
import { EnquiryForm } from "@/components/forms/EnquiryForm";

const TRAIL = [
  { name: "Home", path: "/" },
  { name: "Request a quote", path: "/request-quote" },
];

export const metadata: Metadata = {
  title: "Request a Quote — Ethiopian Green Coffee",
  description:
    "Request a quote or a sample of Zoebar's washed and natural Ethiopian Arabica green coffee from Amaro (Koore Zone), Ethiopia. Tell us your volume and destination and we will come back with confirmed specifications.",
  alternates: { canonical: "/request-quote" },
  openGraph: { title: "Request a Quote — Ethiopian Green Coffee", url: "/request-quote" },
};

/**
 * /request-quote — the primary conversion (Strategy 6), with the sample
 * request as the highest-intent action on the site (Strategy 6.2).
 *
 * Delivery is gated on Open Item #11 (CRM / email platform choice). Where it
 * is unconfigured the page says so at the top rather than presenting a form
 * that silently discards container-volume enquiries.
 */
export default function RequestQuotePage() {
  const configured = isDeliveryConfigured();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: graph(breadcrumbSchema(TRAIL)) }}
      />

      <PageHeader
        trail={TRAIL}
        eyebrow="Enquiry"
        title="Request a quote."
        lede={`Tell us the volume, grade and destination you are working with. We come back with current availability, confirmed specifications and terms — and where a figure is not yet confirmed, we say so rather than estimating it.`}
        meta={[
          { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
          { term: "Altitude", detail: `${altitudeBand()} masl` },
          { term: "Harvest", detail: harvestWindow() },
          { term: "Processing", detail: ORIGIN.processing.join(" / ") },
        ]}
      />

      {/* Delivery status. Shown only while unconfigured — this is a build-time
          honesty notice, not a permanent design element. */}
      {!configured && (
        <Section surface="bone" rhythm="tight" density="spec">
          <Container width="wide">
            <div className="flex flex-col gap-3 border-l-2 border-[#c9c0ae] pl-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-meta">
                  Enquiry delivery
                </h2>
                <Pending>Not connected</Pending>
              </div>
              <p className="max-w-[62ch] font-sans text-[0.9375rem] leading-relaxed text-[#3d423a]">
                The enquiry route is not connected to a mailbox or CRM yet, so
                this form cannot deliver a message. It is left visible and
                honest rather than accepting enquiries that would go nowhere.
                Connecting it is a single environment variable —{" "}
                <code className="rounded-[2px] bg-[#e6dfd1] px-1.5 py-0.5 font-mono text-[0.8125rem]">
                  ENQUIRY_WEBHOOK_URL
                </code>
                .
              </p>
            </div>
          </Container>
        </Section>
      )}

      {/* --- Quote form ------------------------------------------------------ */}
      <Section surface="light" rhythm="base" density="spec" aria-labelledby="quote-form">
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="01" className="text-meta">
                Quote
              </Eyebrow>
              <h2
                id="quote-form"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]"
              >
                Tell us what you need.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
                The more precise the volume and destination, the more useful the
                reply. If you are still scoping, choose &ldquo;not yet
                determined&rdquo; — we would rather talk early than send a
                number that does not fit.
              </p>

              <dl className="mt-10 flex flex-col">
                {[
                  { term: "What you get", detail: "Availability, specifications and terms" },
                  { term: "Unconfirmed figures", detail: "Stated as being verified" },
                  { term: "Company", detail: ORG.legalName },
                ].map((r) => (
                  <div
                    key={r.term}
                    className="flex items-baseline justify-between gap-6 border-t border-[#e2dbcd] py-4"
                  >
                    <dt className="font-sans text-sm text-meta">{r.term}</dt>
                    <dd className="text-right font-sans text-[0.9375rem] text-ink">
                      {r.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="min-w-0 lg:col-span-7">
              <EnquiryForm kind="quote" submitLabel="Request a quote" />
            </div>
          </div>
        </Container>
      </Section>

      {/* --- Sample request — the highest-intent action --------------------- */}
      <Section
        id="sample"
        surface="deep"
        rhythm="base"
        density="story"
        aria-labelledby="sample-form"
      >
        <Container width="wide">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow index="02" className="text-sand">
                Sample
              </Eyebrow>
              <h2
                id="sample-form"
                className="mt-6 max-w-[16ch] text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em] text-alabaster"
              >
                Request a sample.
              </h2>
              <p className="mt-7 max-w-[42ch] font-sans text-[1.0625rem] leading-[1.65] text-[#cfd9d6]">
                Cup it before you commit. Tell us the profile you are looking for
                and we will match it against what is on the drying beds and in
                store.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <span className="font-sans text-sm text-[#9db3b0]">Sample policy</span>
                <Pending onDark />
              </div>
            </div>

            <div className="min-w-0 rounded-[2rem] bg-alabaster p-7 sm:p-9 lg:col-span-7">
              <EnquiryForm kind="sample" submitLabel="Request a sample" />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
