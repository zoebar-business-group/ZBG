import "server-only";

import { Resend } from "resend";

import { VOLUME_BANDS } from "@/content/coffee";

/**
 * ENQUIRY DELIVERY + HARDENING
 * ----------------------------------------------------------------------------
 * The quote and sample request is the site's primary conversion (Strategy 6).
 * Silently dropping a container-volume enquiry is the single most expensive bug
 * this site could ship, so every failure mode here is surfaced, never hidden.
 *
 * DELIVERY (Strategy Open Item #11 — CRM / email platform choice):
 *   Resend is the transport. `submitEnquiry` (app/request-quote/actions.ts):
 *     1. sends an internal notification to ENQUIRY_TO_EMAIL, and
 *     2. sends the buyer an autoresponder,
 *   then mirrors the payload to GOOGLE_SHEET_WEBHOOK_URL as a fallback log.
 *   With RESEND_API_KEY unset the action returns `notice: "not-configured"`
 *   rather than showing a confirmation for a message nobody received.
 *
 * BOT HARDENING:
 *   - a honeypot field ("website") checked in the action,
 *   - reCAPTCHA v3 (`verifyRecaptcha`), which fails OPEN if Google is
 *     unreachable and fails CLOSED on a low score or a bad token,
 *   - a 60-second per-email / per-IP rate limit (`isRateLimited`).
 *
 * ENV: RESEND_API_KEY, ENQUIRY_TO_EMAIL, GOOGLE_SHEET_WEBHOOK_URL,
 *      RECAPTCHA_SECRET_KEY (server) and NEXT_PUBLIC_RECAPTCHA_SITE_KEY
 *      (client). See .env.local.example.
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

/* --------------------------------------------------------------------------
 * Escaping
 * ---------------------------------------------------------------------- */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escape HTML so a field value cannot inject markup into an email body. */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

/** Collapse CR/LF so a field value cannot inject an email header. */
function headerSafe(input: string): string {
  return input.replace(/[\r\n]+/g, " ").trim();
}

/* --------------------------------------------------------------------------
 * Validation — the client never decides what is acceptable
 * ---------------------------------------------------------------------- */

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
  return Boolean(process.env.RESEND_API_KEY);
}

/* --------------------------------------------------------------------------
 * reCAPTCHA v3
 * ---------------------------------------------------------------------- */

const RECAPTCHA_ACTION = "enquiry_submit";
const RECAPTCHA_MIN_SCORE = 0.5;

export type RecaptchaResult =
  /** Verified human, verification skipped (no secret), or Google unreachable. */
  | { outcome: "pass"; score: number | null }
  /** Bad token, wrong action, or a score below the threshold. */
  | { outcome: "reject" };

interface SiteVerifyResponse {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

export async function verifyRecaptcha(token: string): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    // Not configured. Do not block real buyers — but warn so an unhardened
    // production deploy is loud in the platform logs.
    console.warn("[enquiry] RECAPTCHA_SECRET_KEY not set — skipping bot verification.");
    return { outcome: "pass", score: null };
  }

  if (!token) return { outcome: "reject" };

  let data: SiteVerifyResponse;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    data = (await res.json()) as SiteVerifyResponse;
  } catch (err) {
    // Fail OPEN: Google's API being briefly down must not cost a real enquiry.
    console.warn("[enquiry] reCAPTCHA verify request errored — failing open.", err);
    return { outcome: "pass", score: null };
  }

  if (!data.success) {
    console.warn("[enquiry] reCAPTCHA verification failed.", data["error-codes"]);
    return { outcome: "reject" };
  }

  if (data.action && data.action !== RECAPTCHA_ACTION) {
    console.warn("[enquiry] reCAPTCHA action mismatch.", data.action);
    return { outcome: "reject" };
  }

  if (typeof data.score === "number" && data.score < RECAPTCHA_MIN_SCORE) {
    console.warn("[enquiry] reCAPTCHA score below threshold.", data.score);
    return { outcome: "reject" };
  }

  return { outcome: "pass", score: typeof data.score === "number" ? data.score : null };
}

/* --------------------------------------------------------------------------
 * Rate limiting — 60s per email OR per IP
 *
 * In-memory and per-instance: on a multi-instance / serverless deployment this
 * is best-effort, not a guarantee. It exists to stop a single client hammering
 * the form, not as a distributed quota. Swap the Map for a shared store (KV,
 * Redis) if that guarantee is ever needed.
 * ---------------------------------------------------------------------- */

const RATE_WINDOW_MS = 60_000;
const lastAccepted = new Map<string, number>();

function rateKeys({ email, ip }: { email: string; ip: string }): string[] {
  const keys: string[] = [];
  const normalisedEmail = email.trim().toLowerCase();
  if (normalisedEmail) keys.push(`email:${normalisedEmail}`);
  if (ip && ip !== "unknown") keys.push(`ip:${ip}`);
  return keys;
}

function sweep(now: number): void {
  for (const [key, ts] of lastAccepted) {
    if (now - ts > RATE_WINDOW_MS) lastAccepted.delete(key);
  }
}

export function isRateLimited(keys: { email: string; ip: string }): boolean {
  const now = Date.now();
  sweep(now);
  return rateKeys(keys).some((key) => {
    const ts = lastAccepted.get(key);
    return ts !== undefined && now - ts < RATE_WINDOW_MS;
  });
}

/** Call once an enquiry has passed validation and is about to be delivered. */
export function recordSubmission(keys: { email: string; ip: string }): void {
  const now = Date.now();
  for (const key of rateKeys(keys)) lastAccepted.set(key, now);
}

/* --------------------------------------------------------------------------
 * Email — internal notification + buyer autoresponder
 * ---------------------------------------------------------------------- */

const FROM_ENQUIRIES = "enquiries@zoebarbusinessgroup.com";
const FROM_INTERNAL = `Zoebar Enquiries <${FROM_ENQUIRIES}>`;
const FROM_BUYER = `Zoebar Business Group <${FROM_ENQUIRIES}>`;
const FALLBACK_TO = "eden@zoebarbusinessgroup.com";

function detailRows(e: Enquiry, score: number | null): Array<[string, string]> {
  return [
    ["Name", escapeHtml(e.name)],
    ["Company", escapeHtml(e.company)],
    ["Email", escapeHtml(e.email)],
    ["Country", escapeHtml(e.country)],
    ["Volume", escapeHtml(e.volume)],
    ["Message", e.message.trim() ? escapeHtml(e.message) : "—"],
    ["Request type", e.kind === "sample" ? "Sample" : "Quote"],
    ["reCAPTCHA score", score === null ? "not verified" : score.toFixed(2)],
  ];
}

function internalHtml(e: Enquiry, score: number | null): string {
  const kind = e.kind === "sample" ? "sample" : "quote";
  const rows = detailRows(e, score)
    .map(
      ([term, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5f645d;vertical-align:top;white-space:nowrap">${term}</td>` +
        `<td style="padding:6px 0;white-space:pre-wrap">${value}</td></tr>`,
    )
    .join("");
  return (
    `<h2 style="font-family:Georgia,serif">New ${kind} enquiry — ${escapeHtml(e.company)}</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`
  );
}

function autoresponderHtml(): string {
  return (
    `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">` +
    `Your enquiry reached our team in Dubai. You'll have a reply within one working day.</p>` +
    // TODO(WhatsApp): swap for a real wa.me link once WHATSAPP_NUMBER is verified
    // in src/lib/site.ts (Directive 25). Until then, no placeholder URL ships.
    `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">` +
    `Prefer WhatsApp? {{WHATSAPP_LINK}}</p>`
  );
}

/**
 * Sends both emails. Never throws: a mail failure is logged and swallowed so
 * the enquiry still reaches the fallback sheet log and the buyer still sees a
 * confirmation. `score` is the reCAPTCHA score for the internal email only.
 */
export async function sendEnquiryEmails(e: Enquiry, score: number | null): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // guarded by the caller; defensive here

  const resend = new Resend(apiKey);
  const to = process.env.ENQUIRY_TO_EMAIL || FALLBACK_TO;
  const kind = e.kind === "sample" ? "sample" : "quote";
  const subject = headerSafe(`New ${kind} enquiry — ${e.company}`);

  try {
    const { error } = await resend.emails.send({
      from: FROM_INTERNAL,
      to,
      replyTo: e.email,
      subject,
      html: internalHtml(e, score),
    });
    if (error) console.error("[enquiry] internal notification rejected by Resend.", error);
  } catch (err) {
    console.error("[enquiry] internal notification threw.", err);
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_BUYER,
      to: e.email,
      subject: "Your enquiry reached Zoebar",
      html: autoresponderHtml(),
    });
    if (error) console.error("[enquiry] autoresponder rejected by Resend.", error);
  } catch (err) {
    console.error("[enquiry] autoresponder threw.", err);
  }
}

/* --------------------------------------------------------------------------
 * Fallback log — mirror the payload to a Google Sheet webhook
 * ---------------------------------------------------------------------- */

/** Never throws. The honeypot and the reCAPTCHA token are deliberately absent. */
export async function logEnquiryToSheet(e: Enquiry): Promise<void> {
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        name: e.name,
        company: e.company,
        email: e.email,
        country: e.country,
        volume: e.volume,
        message: e.message,
        kind: e.kind,
      }),
    });
    if (!res.ok) console.error("[enquiry] sheet webhook returned", res.status);
  } catch (err) {
    console.error("[enquiry] sheet webhook threw.", err);
  }
}
