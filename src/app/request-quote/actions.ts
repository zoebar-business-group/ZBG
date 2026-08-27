"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  isRateLimited,
  logEnquiryToSheet,
  recordSubmission,
  sendEnquiryEmails,
  validate,
  verifyRecaptcha,
  type Enquiry,
} from "@/lib/enquiry";
import type { FormState } from "@/lib/enquiry-state";

/**
 * Every export from this module must be an async function — that is the
 * "use server" contract. The FormState shape and its initial value live in
 * `@/lib/enquiry-state` for that reason.
 *
 * A Server Action is a public POST endpoint (see the Next.js Server Actions
 * guide), so every check below runs server-side and treats FormData as
 * untrusted. Order matters: cheap silent rejections first, delivery last.
 */
function readIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerList.get("x-real-ip")?.trim() || "unknown";
}

export async function submitEnquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1. Honeypot. A real browser never fills "website". Look exactly like a
  //    successful submit, but send and log nothing.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect("/thank-you?kind=quote");
  }

  const enquiry: Enquiry = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    country: String(formData.get("country") ?? ""),
    volume: String(formData.get("volume") ?? ""),
    message: String(formData.get("message") ?? ""),
    kind: String(formData.get("kind") ?? "quote"),
  };

  // 2. reCAPTCHA v3. Rejects a bad token or a low score; passes (fails open)
  //    when the secret is unset or Google is unreachable.
  const recaptcha = await verifyRecaptcha(String(formData.get("recaptchaToken") ?? ""));
  if (recaptcha.outcome === "reject") {
    return { status: "error", errors: {}, notice: "verification-failed", values: enquiry };
  }

  // 3. Rate limit: one accepted enquiry per email OR IP per 60 seconds.
  const headerList = await headers();
  const rateKeys = { email: enquiry.email, ip: readIp(headerList) };
  if (isRateLimited(rateKeys)) {
    return { status: "error", errors: {}, notice: "rate-limited", values: enquiry };
  }

  // 4. Server-side validation.
  const errors = validate(enquiry);
  if (Object.keys(errors).length) {
    return { status: "error", errors, values: enquiry };
  }

  // 5. Delivery not configured — never show a confirmation for a message
  //    nobody received.
  if (!process.env.RESEND_API_KEY) {
    console.error(
      "[enquiry] RESEND_API_KEY is not set — enquiry was NOT delivered.",
      { kind: enquiry.kind, country: enquiry.country, volume: enquiry.volume },
    );
    return { status: "error", errors: {}, notice: "not-configured", values: enquiry };
  }

  // The enquiry is accepted from here on. Claim the rate-limit slot before any
  // slow I/O so a double-click cannot produce two deliveries.
  recordSubmission(rateKeys);

  // 6. Internal notification + buyer autoresponder. Never throws.
  await sendEnquiryEmails(enquiry, recaptcha.score);

  // 7. Fallback log to the Google Sheet webhook. Never throws.
  await logEnquiryToSheet(enquiry);

  // 8. Success — same as before: redirect to the one next-step ask.
  redirect(`/thank-you?kind=${encodeURIComponent(enquiry.kind)}`);
}
