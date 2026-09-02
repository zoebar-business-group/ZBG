"use client";

import { useActionState, useId, useRef } from "react";
import { useFormStatus } from "react-dom";
import Script from "next/script";

import { clsx } from "@/lib/clsx";
import { submitQuestion } from "@/app/contact/actions";
import { INITIAL_STATE, type FormState } from "@/lib/enquiry-state";

/**
 * CONTACT FORM — the lightweight "general question" form for /contact only.
 *
 * Deliberately separate from EnquiryForm (which stays exactly as-is on
 * /request-quote). Same conventions, fewer of them:
 *   - name, email, message — nothing commercial (no company / country / volume /
 *     WhatsApp path),
 *   - the same honeypot ("website"), the same reCAPTCHA v3 client flow
 *     (action "enquiry_submit"), the same useActionState + useId patterns,
 *   - server-side everything, and a plain POST that works without JavaScript.
 *
 * Bot hardening is enforced in `submitQuestion` (app/contact/actions.ts) using
 * the shared helpers in lib/enquiry.ts.
 */

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_ACTION = "enquiry_submit";

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
    title: "This question was not sent.",
    body: "The contact route is not connected yet, so nothing was submitted. Rather than show a confirmation for a message nobody received, we are telling you plainly. Please try again later.",
  },
  "delivery-failed": {
    title: "This question was not sent.",
    body: "We could not deliver your question just now. Nothing was lost on your side — please try again in a moment.",
  },
  "verification-failed": {
    title: "We could not verify this submission.",
    body: "An automated check could not confirm this came from a person. If you use a strict privacy extension or a VPN, try again.",
  },
  "rate-limited": {
    title: "This looks like a repeat submission.",
    body: "We have just received a message from you. Give it a minute before sending another.",
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
  autoComplete,
  error,
  defaultValue,
}: {
  idPrefix: string;
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  defaultValue?: string;
}) {
  const inputId = `${idPrefix}${name}`;
  const errorId = `${inputId}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#5a5f56]"
      >
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
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

export function ContactForm({ submitLabel = "Send question" }: { submitLabel?: string }) {
  // Scoped ids: /contact renders one instance today, but the same pattern as
  // EnquiryForm keeps it safe if the page ever renders it twice.
  const uid = useId();
  const [state, formAction] = useActionState(submitQuestion, INITIAL_STATE);
  const v = state?.values ?? {};
  const fieldErrors = state?.errors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const notice = state?.notice ? NOTICE_COPY[state.notice] : null;

  /**
   * reCAPTCHA v3 needs a fresh token minted at submit time. Same two-pass
   * pattern as EnquiryForm: first submit → preventDefault, mint the token,
   * requestSubmit() → this handler runs again with `bypass` set → React
   * dispatches the server action normally.
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
        <input type="hidden" name="recaptchaToken" defaultValue="" />

        {/* Honeypot — same field name and off-screen treatment as EnquiryForm.
            A real user never sees or tabs to it; anything that fills it is
            dropped server-side, silently. */}
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
        </div>

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
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            error={fieldErrors.email}
            defaultValue={v.email}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${uid}message`}
            className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#5a5f56]"
          >
            Your question
          </label>
          <textarea
            id={`${uid}message`}
            name="message"
            rows={6}
            required
            defaultValue={v.message}
            aria-invalid={fieldErrors.message ? true : undefined}
            aria-describedby={fieldErrors.message ? `${uid}message-error` : undefined}
            className={clsx(
              FIELD,
              "resize-y",
              fieldErrors.message ? "border-[#8c3b32]" : "border-[#d9d0bf]",
            )}
          />
          {fieldErrors.message && (
            <p id={`${uid}message-error`} className="font-sans text-sm text-[#8c3b32]">
              {fieldErrors.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <Submit label={submitLabel} />
          <p className="max-w-[34ch] font-sans text-sm leading-relaxed text-meta">
            We reply by email, usually within one working day.
          </p>
        </div>
      </form>
    </>
  );
}
