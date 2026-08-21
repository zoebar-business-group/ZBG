import "server-only";

import { VOLUME_BANDS } from "@/content/coffee";

/**
 * ENQUIRY DELIVERY
 * ----------------------------------------------------------------------------
 * The quote and sample request is the site's primary conversion (Strategy 6).
 *
 * DELIVERY IS NOT CONFIGURED. Strategy Open Item #11 — "CRM / email platform
 * choice", blocks: form delivery, needed by build day 4 — is unanswered, and
 * Open Item #10 means Zoebar has no published contact address to fall back to.
 *
 * This module therefore refuses to pretend. `deliverEnquiry` returns a typed
 * failure when no provider is configured, and the form surfaces that honestly
 * rather than showing a success screen for a message nobody received. Silently
 * dropping a container-volume enquiry is the single most expensive bug this
 * site could ship.
 *
 * TO CONNECT: set ENQUIRY_WEBHOOK_URL (any CRM/automation endpoint accepting
 * JSON) and redeploy. No other change is required.
 */

export interface Enquiry {
  name: string;
  company: string;
  email: string;
  country: string;
  volume: string;
  message: string;
  /** "quote" | "sample" — the sample request is the highest-intent action. */
  kind: string;
}

export type EnquiryResult =
  | { ok: true }
  | { ok: false; reason: "validation"; errors: Record<string, string> }
  | { ok: false; reason: "not-configured" }
  | { ok: false; reason: "delivery-failed" };

/** Server-side validation. The client never decides what is acceptable. */
export function validate(e: Partial<Enquiry>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!e.name?.trim()) errors.name = "Please enter your name.";
  if (!e.company?.trim()) errors.company = "Please enter your company.";

  const email = e.email?.trim() ?? "";
  // Deliberately permissive: the only reliable email test is delivery.
  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = "Please check your email address.";

  if (!e.country?.trim()) errors.country = "Please enter your country.";

  if (!e.volume?.trim()) errors.volume = "Please choose a volume band.";
  else if (!VOLUME_BANDS.includes(e.volume as (typeof VOLUME_BANDS)[number]))
    errors.volume = "Please choose a volume band from the list.";

  if (e.kind !== "quote" && e.kind !== "sample") errors.kind = "Invalid request type.";

  return errors;
}

export function isDeliveryConfigured(): boolean {
  return Boolean(process.env.ENQUIRY_WEBHOOK_URL);
}

export async function deliverEnquiry(enquiry: Enquiry): Promise<EnquiryResult> {
  const errors = validate(enquiry);
  if (Object.keys(errors).length) {
    return { ok: false, reason: "validation", errors };
  }

  const endpoint = process.env.ENQUIRY_WEBHOOK_URL;
  if (!endpoint) {
    // Logged at error level so an unconfigured production deploy is loud in
    // the platform logs rather than quietly losing enquiries.
    console.error(
      "[enquiry] ENQUIRY_WEBHOOK_URL is not set — enquiry was NOT delivered.",
      { kind: enquiry.kind, country: enquiry.country, volume: enquiry.volume },
    );
    return { ok: false, reason: "not-configured" };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...enquiry, receivedAt: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error("[enquiry] delivery endpoint returned", res.status);
      return { ok: false, reason: "delivery-failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[enquiry] delivery threw", err);
    return { ok: false, reason: "delivery-failed" };
  }
}
