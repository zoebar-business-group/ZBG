import type { Metadata } from "next";

import { ORIGIN } from "@/lib/org";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container, Section } from "@/components/primitives/layout";
import { Button } from "@/components/primitives/Button";

/**
 * /thank-you — noindex (Strategy 3, architecture).
 *
 * The funnel specifies "one next-step ask" here (Strategy 6.1), so the page
 * offers exactly one onward action rather than a menu.
 */
export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
  alternates: { canonical: "/thank-you" },
};

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind } = await searchParams;
  const isSample = kind === "sample";

  return (
    <>
      <PageHeader
        eyebrow="Received"
        title={isSample ? "Sample request received." : "Enquiry received."}
        lede={
          isSample
            ? "Thank you. We will confirm what is available against the profile you described, and come back with sample details and timing."
            : "Thank you. We will come back with current availability, confirmed specifications and terms. Where a figure is still being verified, we will tell you when it will be confirmed."
        }
      />

      <Section surface="light" rhythm="base" density="spec" aria-labelledby="next">
        <Container width="text">
          <h2
            id="next"
            className="max-w-[20ch] text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.16] tracking-[-0.01em]"
          >
            While you wait
          </h2>
          <p className="mt-5 max-w-[54ch] font-sans text-[1.0625rem] leading-[1.65] text-[#5a5f56]">
            {ORIGIN.name} is where all of this starts, the zone, the altitude
            band, the harvest window and the washing station Zoebar owns and
            runs.
          </p>
          <div className="mt-9">
            <Button href="/amaro">Read about {ORIGIN.name}</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
