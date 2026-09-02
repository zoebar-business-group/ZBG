"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  isRateLimited,
  logQuestionToSheet,
  recordSubmission,
  sendQuestionEmails,
  validateQuestion,
  verifyRecaptcha,
  type Question,
} from "@/lib/enquiry";
import type { FormState } from "@/lib/enquiry-state";

/**
 * /contact — the general-question form.
 *
 * A lighter sibling of `submitEnquiry` (app/request-quote/actions.ts): same
 * "use server" contract (every export async), same order of checks (cheap
 * silent rejections first, delivery last), and the same hardening helpers from
 * lib/enquiry.ts — honeypot, `verifyRecaptcha`, `isRateLimited` /
 * `recordSubmission`. It validates only name, email and message, has no
 * WhatsApp path, and hardcodes `kind: "question"` server-side so a forged
 * request cannot route itself down the quote flow.
 *
 * Honesty rule (identical to the enquiry flow): with RESEND_API_KEY unset the
 * action returns `notice: "not-configured"` rather than a false confirmation.
 */

// Mirrors the local helper in app/request-quote/actions.ts. Kept inline rather
// than shared so that file stays untouched.
function readIp(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerList.get("x-real-ip")?.trim() || "unknown";
}

export async function submitQuestion(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1. Honeypot. A real browser never fills "website". Look exactly like a
  //    successful submit, but send and log nothing.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect("/thank-you?kind=question");
  }

  const question: Question = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // 2. reCAPTCHA v3. Same action name ("enquiry_submit") as the client flow, so
  //    `verifyRecaptcha` is reused unchanged. Fails open when unconfigured.
  const recaptcha = await verifyRecaptcha(String(formData.get("recaptchaToken") ?? ""));
  if (recaptcha.outcome === "reject") {
    return { status: "error", errors: {}, notice: "verification-failed", values: question };
  }

  // 3. Rate limit: one accepted submission per email / IP per 60 seconds.
  const headerList = await headers();
  const rateKeys = { email: question.email, phone: "", ip: readIp(headerList) };
  if (isRateLimited(rateKeys)) {
    return { status: "error", errors: {}, notice: "rate-limited", values: question };
  }

  // 4. Server-side validation — name, email, message only.
  const errors = validateQuestion(question);
  if (Object.keys(errors).length) {
    return { status: "error", errors, values: question };
  }

  // 5. Delivery not configured. Never show a confirmation for a message nobody
  //    received.
  if (!process.env.RESEND_API_KEY) {
    console.error("[question] RESEND_API_KEY is not set, question was NOT delivered.");
    return { status: "error", errors: {}, notice: "not-configured", values: question };
  }

  // Accepted from here. Claim the rate-limit slot before any slow I/O so a
  // double-click cannot produce two deliveries.
  recordSubmission(rateKeys);

  // 6. Internal notification + asker autoresponder. Never throws.
  await sendQuestionEmails(question, recaptcha.score);

  // 7. Fallback log to the Google Sheet webhook, with kind: "question". Never throws.
  await logQuestionToSheet(question);

  // 8. Success — the same one next-step ask as the enquiry flow.
  redirect("/thank-you?kind=question");
}
