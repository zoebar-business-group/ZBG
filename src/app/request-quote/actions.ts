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
  whatsappEnquiryUrl,
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
 *
 * Two delivery paths, chosen by the `channel` field:
 *   - "email"    → Resend + sheet log, then redirect to /thank-you.
 *   - "whatsapp" → sheet log only, then return a `wa.me` URL for the client to
 *                  open. No Resend. See lib/enquiry.ts.
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

  const channel = formData.get("channel") === "whatsapp" ? "whatsapp" : "email";

  const enquiry: Enquiry = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    country: String(formData.get("country") ?? ""),
    volume: String(formData.get("volume") ?? ""),
    message: String(formData.get("message") ?? ""),
    kind: String(formData.get("kind") ?? "quote"),
    channel,
  };

  // 2. reCAPTCHA v3. Rejects a bad token or a low score; passes (fails open)
  //    when the secret is unset or Google is unreachable. Applies to both paths.
  const recaptcha = await verifyRecaptcha(String(formData.get("recaptchaToken") ?? ""));
  if (recaptcha.outcome === "reject") {
    return { status: "error", errors: {}, notice: "verification-failed", values: enquiry };
  }

  // 3. Rate limit: one accepted enquiry per email / phone / IP per 60 seconds.
  const headerList = await headers();
  const rateKeys = { email: enquiry.email, phone: enquiry.phone, ip: readIp(headerList) };
  if (isRateLimited(rateKeys)) {
    return { status: "error", errors: {}, notice: "rate-limited", values: enquiry };
  }

  // 4. Server-side validation. Channel-aware: email path needs a valid email,
  //    WhatsApp path needs a phone number.
  const errors = validate(enquiry);
  if (Object.keys(errors).length) {
    return { status: "error", errors, values: enquiry };
  }

  // 5a. WhatsApp path — no Resend. Log the source, hand back a wa.me URL.
  if (channel === "whatsapp") {
    const whatsappUrl = whatsappEnquiryUrl(enquiry);
    if (!whatsappUrl) {
      // Only reachable via a forged request: the form hides the option when
      // WHATSAPP_NUMBER is unset. Same honest notice as the email path.
      console.error("[enquiry] channel=whatsapp but WHATSAPP_NUMBER is unset.");
      return { status: "error", errors: {}, notice: "not-configured", values: enquiry };
    }
    recordSubmission(rateKeys);
    await logEnquiryToSheet(enquiry);
    return { status: "idle", errors: {}, whatsappUrl, values: enquiry };
  }

  // 5b. Email path — delivery not configured. Never show a confirmation for a
  //     message nobody received.
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
