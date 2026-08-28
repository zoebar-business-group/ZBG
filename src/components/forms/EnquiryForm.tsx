"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Script from "next/script";

import { VOLUME_BANDS } from "@/content/coffee";
import { clsx } from "@/lib/clsx";
import { submitEnquiry } from "@/app/request-quote/actions";
import { INITIAL_STATE, type FormState } from "@/lib/enquiry-state";

/**
 * ENQUIRY FORM — the site's primary conversion (Strategy 6).
 *
 * Capture fields are exactly those the funnel specifies: name, company,
 * country, volume band, and a contact detail — email by default, or a phone
 * number when the buyer chooses the WhatsApp path (Strategy 6.1).
 *
 * Accessibility: every input has a real <label>, errors are associated via
 * aria-describedby and announced through a live region, and invalid fields
 * carry aria-invalid. The form works without JavaScript — it is a plain POST
 * to a server action, and validation is server-side.
 *
 * Two submission paths (both POST through `submitEnquiry`):
 *   - Email (default, and the only path without JS): Resend + sheet log, then
 *     a server-side redirect to /thank-you.
 *   - WhatsApp (JS-only enhancement, rendered only when the caller passes
 *     `whatsappEnabled` — i.e. the server saw a `WHATSAPP_NUMBER`): the server
 *     validates + logs, then returns a wa.me deep link; the client opens the
 *     buyer's own WhatsApp and then goes to /thank-you.
 *
 * Bot hardening (all enforced server-side in `submitEnquiry`, both paths):
 *   - a honeypot field ("website") a real browser never fills,
 *   - a reCAPTCHA v3 token minted just before submit, and
 *   - a 60-second per-email / per-phone / per-IP rate limit.
 */

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_ACTION = "enquiry_submit";

type Channel = "email" | "whatsapp";

interface Grecaptcha {
  ready(cb: () => void): void;
  execute(siteKey: string, opts: { action: string }): Promise<string>;
}
declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const NOTICE_COPY: Record<
  NonNullable<FormState["notice"]>,
  { title: string; body: string }
> = {
  "not-configured": {
    title: "This enquiry was not sent.",
    body: "Enquiry delivery is not connected yet, so nothing was submitted. Rather than show a confirmation for a message nobody received, we are telling you plainly. Please contact Zoebar directly to make sure your enquiry reaches the team.",
  },
  "delivery-failed": {
    title: "This enquiry was not sent.",
    body: "We could not deliver your enquiry just now. Nothing was lost on your side — please try again, or contact Zoebar directly.",
  },
  "verification-failed": {
    title: "We could not verify this submission.",
    body: "An automated check could not confirm this came from a person. If you use a strict privacy extension or a VPN, try again — or contact Zoebar directly and we will pick it up from there.",
  },
  "rate-limited": {
    title: "This looks like a repeat submission.",
    body: "We have just received an enquiry from you. Give it a minute before sending another. If you did not submit one, please contact Zoebar directly.",
  },
};

const FIELD =
  "w-full rounded-[0.25rem] border bg-alabaster px-4 py-3.5 font-sans text-[0.9375rem] text-ink " +
  "transition-colors duration-[150ms] placeholder:text-faint " +
  "focus:outline-none focus:ring-2 focus:ring-emerald-mid focus:ring-offset-2 focus:ring-offset-alabaster";

function Field({
  idPrefix,
  label,
  name,
  type = "text",
  required = true,
  autoComplete,
  error,
  defaultValue,
  placeholder,
}: {
  /** Unique per form instance — see the useId note in EnquiryForm. */
  idPrefix: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  // `name` stays the plain field name — the server action reads it from
  // FormData. Only the DOM id is scoped.
  const inputId = `${idPrefix}${name}`;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#5a5f56]"
      >
        {label}
        {!required && <span className="ml-2 normal-case text-faint">Optional</span>}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={clsx(FIELD, error ? "border-[#8c3b32]" : "border-[#d9d0bf]")}
      />
      {error && (
        <p id={errorId} className="font-sans text-sm text-[#8c3b32]">
          {error}
        </p>
      )}
    </div>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center rounded-[999px] bg-emerald px-8 py-4 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-alabaster transition-colors duration-[200ms] hover:bg-[#043029] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : label}
    </button>
  );
}

/** Segmented email/WhatsApp control. JS-only: without it the buyer sees the
 *  email path, which is the only one that can work without JavaScript. */
function ChannelToggle({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: Channel;
  onChange: (next: Channel) => void;
}) {
  const options: Array<{ id: Channel; label: string }> = [
    { id: "email", label: "Email" },
    { id: "whatsapp", label: "WhatsApp" },
  ];
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#5a5f56]">
        How should we reply?
      </legend>
      <div className="flex gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className={clsx(
              "flex-1 cursor-pointer rounded-[0.25rem] border px-4 py-3 text-center font-sans text-[0.9375rem] transition-colors",
              "focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-mid focus-within:ring-offset-2 focus-within:ring-offset-alabaster",
              value === opt.id
                ? "border-emerald bg-emerald text-alabaster"
                : "border-[#d9d0bf] bg-alabaster text-ink hover:border-[#b8ad97]",
            )}
          >
            <input
              type="radio"
              name={`${idPrefix}channelChoice`}
              value={opt.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="sr-only"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <p className="font-sans text-sm leading-relaxed text-meta">
        {value === "whatsapp"
          ? "WhatsApp opens on your device with the enquiry pre-filled — you send it yourself."
          : "We reply by email, within one working day."}
      </p>
    </fieldset>
  );
}

export function EnquiryForm({
  kind = "quote",
  submitLabel = "Send enquiry",
  whatsappEnabled = false,
}: {
  kind?: "quote" | "sample";
  submitLabel?: string;
  /** Server-derived: is `WHATSAPP_NUMBER` set? Gates the WhatsApp toggle. */
  whatsappEnabled?: boolean;
}) {
  /**
   * /request-quote renders this form TWICE — once for a quote and once for a
   * sample at #sample — and /contact renders it again alongside the page's own
   * content. With hardcoded ids every duplicate produced a second element with
   * id="name", id="email" and so on, so each label in the second form pointed
   * at the FIRST form's input: clicking "Email" above the sample form focused
   * the quote form's field, and screen readers read the wrong association.
   *
   * useId() gives each instance its own stable, hydration-safe prefix. The
   * `name` attributes are deliberately untouched — the server action reads
   * those from FormData and they must stay exactly as `enquiry.ts` expects.
   */
  const uid = useId();
  const router = useRouter();
  const [state, formAction] = useActionState(submitEnquiry, INITIAL_STATE);
  const v = state?.values ?? {};
  const fieldErrors = state?.errors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const notice = state?.notice ? NOTICE_COPY[state.notice] : null;

  /**
   * The WhatsApp toggle is a progressive enhancement: it only renders on the
   * client, so a no-JS visitor never sees a control that cannot work for them.
   * `isClient` is false during SSR and the first hydration render (so they
   * match), then true — no setState-in-effect. The buyer's own channel state
   * persists across an action round-trip, so a failed submit keeps their choice.
   */
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [channel, setChannel] = useState<Channel>("email");

  const showToggle = isClient && whatsappEnabled;
  const activeChannel: Channel = showToggle ? channel : "email";

  /**
   * WhatsApp success: the action hands back a wa.me URL instead of redirecting,
   * because a server redirect cannot open an external app. Try to open it in a
   * new tab; if the browser allows it, move on to /thank-you. If it is blocked
   * (no transient activation survives the server round-trip), we stay put and
   * the fallback link below — a real click — takes over.
   */
  const openedUrl = useRef<string | null>(null);
  useEffect(() => {
    const url = state.whatsappUrl;
    if (!url || openedUrl.current === url) return;
    openedUrl.current = url;
    const opened = window.open(url, "_blank");
    if (opened) router.push(`/thank-you?kind=${kind}`);
  }, [state.whatsappUrl, kind, router]);

  /**
   * reCAPTCHA v3 needs a fresh token minted at submit time. `bypass` lets the
   * second, programmatic submit through untouched: first submit → preventDefault,
   * mint the token, then requestSubmit() → this handler runs again with bypass
   * set → React dispatches the server action normally.
   */
  const bypass = useRef(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    if (bypass.current || !RECAPTCHA_SITE_KEY) {
      bypass.current = false;
      return;
    }
    event.preventDefault();
    const form = event.currentTarget;
    const tokenInput = form.elements.namedItem("recaptchaToken") as HTMLInputElement | null;

    try {
      const { grecaptcha } = window;
      if (grecaptcha && tokenInput) {
        const token = await new Promise<string>((resolve, reject) => {
          grecaptcha.ready(() => {
            grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: RECAPTCHA_ACTION }).then(resolve, reject);
          });
        });
        tokenInput.value = token;
      }
    } catch {
      // Leave the token empty. The server rejects an empty token only when
      // reCAPTCHA is configured; otherwise the submission passes through.
    }

    bypass.current = true;
    form.requestSubmit();
  }

  return (
    <>
      {/* Loaded once per page regardless of how many forms render it —
          next/script dedupes by src. */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        noValidate
      >
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="channel" value={activeChannel} />
        <input type="hidden" name="recaptchaToken" defaultValue="" />

        {/* Honeypot. Positioned off-screen and clipped rather than display:none
            or visibility:hidden, both of which some bots skip. A real user
            never sees or tabs to it; anything that fills it is dropped
            server-side, silently. */}
        <div
          aria-hidden="true"
          className="absolute h-px w-px overflow-hidden"
          style={{
            clip: "rect(0 0 0 0)",
            clipPath: "inset(50%)",
            opacity: 0,
            left: "-9999px",
            top: "-9999px",
          }}
        >
          <label htmlFor={`${uid}website`}>Leave this field empty</label>
          <input
            id={`${uid}website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </div>

        {/* Live region: failures — and the WhatsApp hand-off — are announced,
            not just shown. */}
        <div aria-live="polite">
          {hasFieldErrors && (
            <p className="rounded-[0.25rem] border border-[#d9b9b4] bg-[#f7ecea] px-4 py-3 font-sans text-sm text-[#8c3b32]">
              Please check the highlighted fields.
            </p>
          )}

          {notice && (
            <div className="rounded-[0.25rem] border border-[#d9d0bf] bg-bone px-5 py-4">
              <p className="font-sans text-[0.9375rem] font-medium text-ink">
                {notice.title}
              </p>
              <p className="mt-2 max-w-[52ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
                {notice.body}
              </p>
            </div>
          )}

          {state.whatsappUrl && (
            <div className="rounded-[0.25rem] border border-[#d9d0bf] bg-bone px-5 py-4">
              <p className="font-sans text-[0.9375rem] font-medium text-ink">
                Your message is ready to send.
              </p>
              <p className="mt-2 max-w-[52ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
                WhatsApp should have opened with the enquiry pre-filled. If it
                did not,{" "}
                <a
                  href={state.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    window.setTimeout(() => router.push(`/thank-you?kind=${kind}`), 400);
                  }}
                  className="underline decoration-[0.5px] underline-offset-[3px] transition-colors hover:decoration-current"
                >
                  open WhatsApp to send it
                </a>
                .
              </p>
            </div>
          )}
        </div>

        {showToggle && (
          <ChannelToggle idPrefix={uid} value={channel} onChange={setChannel} />
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            idPrefix={uid}
            label="Name"
            name="name"
            autoComplete="name"
            error={fieldErrors.name}
            defaultValue={v.name}
          />
          <Field
            idPrefix={uid}
            label="Company"
            name="company"
            required={false}
            autoComplete="organization"
            error={fieldErrors.company}
            defaultValue={v.company}
          />
          {activeChannel === "whatsapp" ? (
            <Field
              idPrefix={uid}
              label="Phone / WhatsApp"
              name="phone"
              type="tel"
              autoComplete="tel"
              error={fieldErrors.phone}
              defaultValue={v.phone}
              placeholder="+971 50 123 4567"
            />
          ) : (
            <Field
              idPrefix={uid}
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              error={fieldErrors.email}
              defaultValue={v.email}
            />
          )}
          <Field
            idPrefix={uid}
            label="Country"
            name="country"
            autoComplete="country-name"
            error={fieldErrors.country}
            defaultValue={v.country}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${uid}volume`}
            className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#5a5f56]"
          >
            Volume
          </label>
          <select
            id={`${uid}volume`}
            name="volume"
            required
            defaultValue={v.volume ?? ""}
            aria-invalid={fieldErrors.volume ? true : undefined}
            aria-describedby={fieldErrors.volume ? `${uid}volume-error` : undefined}
            className={clsx(FIELD, fieldErrors.volume ? "border-[#8c3b32]" : "border-[#d9d0bf]")}
          >
            <option value="" disabled>
              Select a volume band
            </option>
            {VOLUME_BANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {fieldErrors.volume && (
            <p id={`${uid}volume-error`} className="font-sans text-sm text-[#8c3b32]">
              {fieldErrors.volume}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${uid}message`}
            className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#5a5f56]"
          >
            What do you need?
            <span className="ml-2 normal-case text-faint">Optional</span>
          </label>
          <textarea
            id={`${uid}message`}
            name="message"
            rows={5}
            defaultValue={v.message}
            placeholder="Grade, processing preference, target volume, destination port, timing."
            className={clsx(FIELD, "resize-y border-[#d9d0bf]")}
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Submit label={activeChannel === "whatsapp" ? "Send via WhatsApp" : submitLabel} />
          <p className="max-w-[34ch] font-sans text-sm leading-relaxed text-meta">
            We reply with confirmed specifications, or tell you when a figure will
            be confirmed.
          </p>
        </div>
      </form>
    </>
  );
}
