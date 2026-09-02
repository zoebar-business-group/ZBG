import "server-only";

import { Resend } from "resend";

import { VOLUME_BANDS } from "@/content/coffee";
import { whatsappHref } from "@/lib/site";

/**
 * ENQUIRY DELIVERY + HARDENING
 * ----------------------------------------------------------------------------
 * The quote and sample request is the site's primary conversion (Strategy 6).
 * Silently dropping a container-volume enquiry is the single most expensive bug
 * this site could ship, so every failure mode here is surfaced, never hidden.
 *
 * DELIVERY (Strategy Open Item #11 — CRM / email platform choice):
 *   Two channels, chosen by the buyer on the form (`channel` field):
 *
 *   - "email" (default): Resend is the transport. `submitEnquiry`
 *       1. sends an internal notification to ENQUIRY_TO_EMAIL, and
 *       2. sends the buyer an autoresponder,
 *     then mirrors the payload to GOOGLE_SHEET_WEBHOOK_URL as a fallback log.
 *     With RESEND_API_KEY unset the action returns `notice: "not-configured"`
 *     rather than showing a confirmation for a message nobody received.
 *
 *   - "whatsapp": click-to-chat only, NO WhatsApp Business API. The action
 *     validates as normal, logs to the sheet (with `channel: "whatsapp"`),
 *     and returns a `wa.me` deep link (`whatsappEnquiryUrl`) for the client
 *     to open in the buyer's own WhatsApp. Nothing is sent via Resend.
 *     Offered only when WHATSAPP_NUMBER is set (Directive 25) — same honesty
 *     rule as the withheld /contact WhatsApp row.
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
  /** How the buyer identifies themselves on the WhatsApp path. "" on email. */
  phone: string;
  country: string;
  volume: string;
  message: string;
  /** "quote" | "sample" — the sample request is the highest-intent action. */
  kind: string;
  /** "email" | "whatsapp" — which submission path the buyer chose. */
  channel: string;
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

/** Deliberately permissive: the only reliable test of an address is a reply
 *  landing in it. Shared by the quote/sample flow and the /contact question flow. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validate(e: Partial<Enquiry>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!e.name?.trim()) errors.name = "Please enter your name.";
  // Company is optional — many first enquiries come from an individual buyer
  // before a company name is settled.

  // The buyer identifies themselves by email OR by phone, depending on the
  // path they chose. Both checks stay deliberately permissive — the only
  // reliable test of a contact detail is reaching the person on it.
  if (e.channel === "whatsapp") {
    const phone = e.phone?.trim() ?? "";
    const digits = phone.replace(/\D/g, "");
    if (!phone) errors.phone = "Please enter a phone number we can reach you on.";
    else if (digits.length < 7 || digits.length > 15)
      errors.phone = "Please check your phone number.";
  } else {
    const email = e.email?.trim() ?? "";
    if (!email) errors.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(email))
      errors.email = "Please check your email address.";
  }

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
 * General question — the lightweight /contact form
 *
 * Distinct from `Enquiry`: no company, country, volume band or WhatsApp path.
 * It shares the hardening (honeypot, `verifyRecaptcha`, `isRateLimited` /
 * `recordSubmission`), the escaping, and the same Google Sheet log — the row
 * just carries `kind: "question"` with the commercial columns blank.
 * ---------------------------------------------------------------------- */

export interface Question {
  name: string;
  email: string;
  message: string;
}

export function validateQuestion(q: Partial<Question>): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!q.name?.trim()) errors.name = "Please enter your name.";

  const email = q.email?.trim() ?? "";
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email)) errors.email = "Please check your email address.";

  // No length floor — a general question is not a commercial spec. Just non-empty.
  if (!q.message?.trim()) errors.message = "Please enter your question.";

  return errors;
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
    console.warn("[enquiry] RECAPTCHA_SECRET_KEY not set, skipping bot verification.");
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
    console.warn("[enquiry] reCAPTCHA verify request errored, failing open.", err);
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

export interface RateIdentity {
  email: string;
  phone: string;
  ip: string;
}

function rateKeys({ email, phone, ip }: RateIdentity): string[] {
  const keys: string[] = [];
  const normalisedEmail = email.trim().toLowerCase();
  const normalisedPhone = phone.replace(/\D/g, "");
  if (normalisedEmail) keys.push(`email:${normalisedEmail}`);
  if (normalisedPhone) keys.push(`phone:${normalisedPhone}`);
  if (ip && ip !== "unknown") keys.push(`ip:${ip}`);
  return keys;
}

function sweep(now: number): void {
  for (const [key, ts] of lastAccepted) {
    if (now - ts > RATE_WINDOW_MS) lastAccepted.delete(key);
  }
}

export function isRateLimited(keys: RateIdentity): boolean {
  const now = Date.now();
  sweep(now);
  return rateKeys(keys).some((key) => {
    const ts = lastAccepted.get(key);
    return ts !== undefined && now - ts < RATE_WINDOW_MS;
  });
}

/** Call once an enquiry has passed validation and is about to be delivered. */
export function recordSubmission(keys: RateIdentity): void {
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
    ["Company", e.company.trim() ? escapeHtml(e.company) : "-"],
    ["Email", escapeHtml(e.email)],
    ["Country", escapeHtml(e.country)],
    ["Volume", escapeHtml(e.volume)],
    ["Message", e.message.trim() ? escapeHtml(e.message) : "-"],
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
  const who = e.company.trim() ? escapeHtml(e.company) : escapeHtml(e.name);
  return (
    `<h2 style="font-family:Georgia,serif">New ${kind} enquiry, ${who}</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`
  );
}

function autoresponderHtml(): string {
  const para = `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">`;
  let html =
    `${para}Your enquiry reached our team in Dubai. You'll have a reply within ` +
    `one working day.</p>`;

  // Real wa.me link when WHATSAPP_NUMBER is set; the line is omitted entirely
  // otherwise (Directive 25 — no placeholder URL ever ships).
  const wa = whatsappHref("Hello Zoebar, I just sent an enquiry through your website.");
  if (wa) {
    html += `${para}Prefer WhatsApp? <a href="${wa}">Message the team here</a>.</p>`;
  }
  return html;
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
  const subject = headerSafe(
    `New ${kind} enquiry, ${e.company.trim() || e.name.trim() || "website"}`,
  );

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
 * General question — internal notification + asker autoresponder
 *
 * Same transport, constants and escaping as the enquiry pair above. The
 * internal subject is deliberately unlike "New quote enquiry" / "New sample
 * enquiry" so the two are distinguishable at a glance in the inbox.
 * ---------------------------------------------------------------------- */

function questionInternalHtml(q: Question, score: number | null): string {
  const rows: Array<[string, string]> = [
    ["Name", escapeHtml(q.name)],
    ["Email", escapeHtml(q.email)],
    ["Message", q.message.trim() ? escapeHtml(q.message) : "-"],
    ["Type", "General question (via /contact)"],
    ["reCAPTCHA score", score === null ? "not verified" : score.toFixed(2)],
  ];
  const body = rows
    .map(
      ([term, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5f645d;vertical-align:top;white-space:nowrap">${term}</td>` +
        `<td style="padding:6px 0;white-space:pre-wrap">${value}</td></tr>`,
    )
    .join("");
  return (
    `<h2 style="font-family:Georgia,serif">New question, ${escapeHtml(q.name)}</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${body}</table>`
  );
}

function questionAutoresponderHtml(): string {
  const para = `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">`;
  let html =
    `${para}Your question reached our team. You'll have a reply within one ` +
    `working day.</p>`;

  const wa = whatsappHref("Hello Zoebar, I just sent a question through your website.");
  if (wa) {
    html += `${para}Prefer WhatsApp? <a href="${wa}">Message the team here</a>.</p>`;
  }
  return html;
}

/**
 * Sends the internal notification and the asker's autoresponder for a general
 * question. Never throws — a mail failure is logged and swallowed so the
 * question still reaches the fallback sheet log and the asker still sees a
 * confirmation.
 */
export async function sendQuestionEmails(q: Question, score: number | null): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // guarded by the caller; defensive here

  const resend = new Resend(apiKey);
  const to = process.env.ENQUIRY_TO_EMAIL || FALLBACK_TO;
  const subject = headerSafe(`New question, ${q.name.trim() || "website"}`);

  try {
    const { error } = await resend.emails.send({
      from: FROM_INTERNAL,
      to,
      replyTo: q.email,
      subject,
      html: questionInternalHtml(q, score),
    });
    if (error) console.error("[question] internal notification rejected by Resend.", error);
  } catch (err) {
    console.error("[question] internal notification threw.", err);
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_BUYER,
      to: q.email,
      subject: "Your question reached Zoebar",
      html: questionAutoresponderHtml(),
    });
    if (error) console.error("[question] autoresponder rejected by Resend.", error);
  } catch (err) {
    console.error("[question] autoresponder threw.", err);
  }
}

/* --------------------------------------------------------------------------
 * Fallback log — mirror the payload to a Google Sheet webhook
 * ---------------------------------------------------------------------- */

/** One webhook POST, shared by the enquiry and question logs. Never throws. */
async function postToSheet(row: Record<string, string>): Promise<void> {
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ timestamp: new Date().toISOString(), ...row }),
    });
    if (!res.ok) console.error("[enquiry] sheet webhook returned", res.status);
  } catch (err) {
    console.error("[enquiry] sheet webhook threw.", err);
  }
}

/**
 * Never throws. The honeypot and the reCAPTCHA token are deliberately absent.
 * `channel` ("email" | "whatsapp") lets Eden's team see the enquiry source;
 * `phone` is populated on the WhatsApp path and empty on the email path.
 */
export async function logEnquiryToSheet(e: Enquiry): Promise<void> {
  await postToSheet({
    channel: e.channel === "whatsapp" ? "whatsapp" : "email",
    name: e.name,
    company: e.company,
    email: e.email,
    phone: e.phone,
    country: e.country,
    volume: e.volume,
    message: e.message,
    kind: e.kind,
  });
}

/**
 * Never throws. Same sheet, same columns as an enquiry row, with the
 * commercial fields (company, phone, country, volume) blank and
 * `kind: "question"` so question rows are distinguishable in the log.
 */
export async function logQuestionToSheet(q: Question): Promise<void> {
  await postToSheet({
    channel: "email",
    name: q.name,
    company: "",
    email: q.email,
    phone: "",
    country: "",
    volume: "",
    message: q.message,
    kind: "question",
  });
}

/* --------------------------------------------------------------------------
 * WhatsApp click-to-chat — build the pre-filled message + deep link
 *
 * No WhatsApp Business API. This produces a `wa.me` URL that the client opens
 * in the buyer's own WhatsApp; they send it themselves. The URL builder reuses
 * `whatsappHref` from lib/site.ts (same null-guard + encoding as the /lots
 * page-context links).
 * ---------------------------------------------------------------------- */

export function whatsappEnquiryMessage(e: Enquiry): string {
  const kind = e.kind === "sample" ? "sample" : "quote";
  const lines = [
    `New ${kind} enquiry via zoebarbusinessgroup.com`,
    `Name: ${e.name}`,
  ];
  if (e.company.trim()) lines.push(`Company: ${e.company.trim()}`);
  lines.push(`Country: ${e.country}`, `Volume: ${e.volume}`, `Phone: ${e.phone}`);
  if (e.message.trim()) lines.push(`Message: ${e.message.trim()}`);
  return lines.join("\n");
}

/** `null` when WHATSAPP_NUMBER is unset — the caller treats that as unconfigured. */
export function whatsappEnquiryUrl(e: Enquiry): string | null {
  return whatsappHref(whatsappEnquiryMessage(e));
}
