"use client";

import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import { VOLUME_BANDS } from "@/content/coffee";
import { clsx } from "@/lib/clsx";
import { submitEnquiry } from "@/app/request-quote/actions";
import { INITIAL_STATE } from "@/lib/enquiry-state";

/**
 * ENQUIRY FORM — the site's primary conversion (Strategy 6).
 *
 * Capture fields are exactly those the funnel specifies: name, company,
 * country, volume band, email (Strategy 6.1).
 *
 * Accessibility: every input has a real <label>, errors are associated via
 * aria-describedby and announced through a live region, and invalid fields
 * carry aria-invalid. The form works without JavaScript — it is a plain POST
 * to a server action, and validation is server-side.
 */

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

export function EnquiryForm({
  kind = "quote",
  submitLabel = "Send enquiry",
}: {
  kind?: "quote" | "sample";
  submitLabel?: string;
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
  const [state, formAction] = useActionState(submitEnquiry, INITIAL_STATE);
  const v = state?.values ?? {};
  const fieldErrors = state?.errors ?? {};
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <input type="hidden" name="kind" value={kind} />

      {/* Live region: failures are announced, not just coloured. */}
      <div aria-live="polite">
        {hasFieldErrors && (
          <p className="rounded-[0.25rem] border border-[#d9b9b4] bg-[#f7ecea] px-4 py-3 font-sans text-sm text-[#8c3b32]">
            Please check the highlighted fields.
          </p>
        )}

        {state?.notice && (
          <div className="rounded-[0.25rem] border border-[#d9d0bf] bg-bone px-5 py-4">
            <p className="font-sans text-[0.9375rem] font-medium text-ink">
              This enquiry was not sent.
            </p>
            <p className="mt-2 max-w-[52ch] font-sans text-sm leading-relaxed text-[#5a5f56]">
              {state?.notice === "not-configured"
                ? "Enquiry delivery is not connected yet, so nothing was submitted. Rather than show a confirmation for a message nobody received, we are telling you plainly. Please contact Zoebar directly to make sure your enquiry reaches the team."
                : "We could not deliver your enquiry just now. Nothing was lost on your side — please try again, or contact Zoebar directly."}
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
          label="Company"
          name="company"
          autoComplete="organization"
          error={fieldErrors.company}
          defaultValue={v.company}
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
        <Submit label={submitLabel} />
        <p className="max-w-[34ch] font-sans text-sm leading-relaxed text-meta">
          We reply with confirmed specifications, or tell you when a figure will
          be confirmed.
        </p>
      </div>
    </form>
  );
}
