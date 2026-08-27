# Forms & Contact

Everything the site does to let a buyer reach Zoebar: one form, one server
action, one contact page, and the honesty rules that govern all three.

**Last updated:** 27 August 2026
**Related:** `BUILD-STATUS.md` (§"Enquiry delivery"), `AGENTS.md`, the trust
rule in `CLAUDE.md`.

---

## The shape of it

There is exactly **one form** on the site — `EnquiryForm` — and it is the
site's primary conversion (Strategy 6). It is mounted in three places:

| Where | Instance(s) | `kind` | Submit label |
|---|---|---|---|
| `/request-quote` | quote form | `quote` | "Request a quote" |
| `/request-quote#sample` | sample form (highest-intent action, Strategy 6.2) | `sample` | "Request a sample" |
| `/contact` | enquiry form | `quote` | "Send enquiry" |

Every instance posts to the **same** server action, `submitEnquiry`, and
delivers to the same place. `/request-quote` renders it **twice** on one page —
that is the reason DOM ids are scoped with `useId()` (see Traps).

There is no other form. No newsletter signup, no search, no login. The
telephone / email / WhatsApp / address channels on `/contact` are **not**
built out because their values are unverified (Open Item #10) — see
[Contact page](#contact-page-contact).

---

## Files

```
src/
  components/forms/EnquiryForm.tsx   The form. Client component. All markup + the
                                     client half of bot hardening.
  app/request-quote/
    actions.ts                       "use server" — submitEnquiry. The 8-step flow.
    page.tsx                         Quote + sample mounts; the "not connected" notice.
  app/contact/page.tsx               Enquiry mount + the contact-channel table + FAQ.
  app/thank-you/page.tsx             Post-submit destination. noindex.
  lib/
    enquiry.ts                       "server-only" — validation, reCAPTCHA verify,
                                     rate limiting, Resend send, sheet log, escaping.
    enquiry-state.ts                 FormState shape + INITIAL_STATE. Kept OUT of the
                                     "use server" module on purpose (see Traps).
    site.ts                          PRIMARY_CTA / SECONDARY_CTA, WHATSAPP_* (all null).
  content/
    coffee.ts                        VOLUME_BANDS — the volume <select> options.
    faqs.ts                          CONTACT_FAQS.
.env.local.example                   Every env var the form reads.
```

---

## The form — `EnquiryForm.tsx`

### Fields

The server action reads these from `FormData` by `name`. **The `name`
attributes are a contract — do not rename them** without changing
`submitEnquiry` and `validate()` in lockstep.

| `name` | Control | Required | Notes |
|---|---|---|---|
| `name` | text | yes | HTML-escaped before it reaches an email body |
| `company` | text | yes | HTML-escaped |
| `email` | email | yes | permissive regex only — the only real email test is delivery |
| `country` | text | yes | |
| `volume` | select | yes | must be one of `VOLUME_BANDS` (`content/coffee.ts`) |
| `message` | textarea | no | HTML-escaped |
| `kind` | hidden | — | `quote` \| `sample`; set by the mount, validated server-side |
| `recaptchaToken` | hidden | — | minted client-side just before submit (see below) |
| `website` | text, off-screen | — | **honeypot** — a real browser never fills it |

### Accessibility

- Every input has a real `<label>` (`htmlFor` → scoped id).
- Field errors are associated via `aria-describedby` and rendered in a
  `aria-live="polite"` region so failures are announced, not just coloured.
- Invalid fields carry `aria-invalid`.
- **Works with JavaScript disabled.** The form is a plain POST to a server
  action; validation is server-side. The only thing lost without JS is the
  reCAPTCHA token (the server then treats the submission as "not verified" —
  which only rejects it if reCAPTCHA is actually configured).

### Client-side bot hardening

1. **Honeypot** — `<input name="website">` inside a wrapper positioned
   off-screen (`left/top: -9999px`) and clipped (`clip` + `clipPath`), with
   `opacity: 0`, `tabIndex={-1}`, `autoComplete="off"`, `aria-hidden`.
   Deliberately **not** `display:none` / `visibility:hidden` — some bots skip
   those and would never trip the trap.
2. **reCAPTCHA v3 token** — on submit, `handleSubmit`:
   - `preventDefault()`, calls `grecaptcha.execute(SITE_KEY, { action: "enquiry_submit" })`,
   - writes the token into the hidden `recaptchaToken` input,
   - sets a `bypass` ref and calls `form.requestSubmit()`, which re-enters
     `handleSubmit`, sees `bypass`, and lets React dispatch the action.
   - The `api.js` script is loaded via `next/script` **inside the form
     component** (sibling to the `<form>` element), deduped by `src` so it
     loads once even with two forms on the page, and absent from the other
     21 routes.
   - If `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is unset, the whole dance is skipped.

---

## The server action — `submitEnquiry(prevState, formData)`

`app/request-quote/actions.ts`. A Server Action is a public POST endpoint
(Next.js Server Actions guide), so **every check runs server-side** and
`FormData` is treated as untrusted. Order is deliberate — cheap silent
rejections first, delivery last.

| # | Step | On failure |
|---|---|---|
| 1 | **Honeypot** — `website` non-empty? | `redirect("/thank-you")`. Silent. Nothing sent, nothing logged — indistinguishable from success. |
| 2 | **reCAPTCHA v3** — POST token to `siteverify` | `notice: "verification-failed"` if `success:false`, wrong `action`, or `score < 0.5`. **Fails open** (passes) if the verify request itself throws, or if `RECAPTCHA_SECRET_KEY` is unset — a Google outage must not cost a real enquiry. |
| 3 | **Rate limit** — email OR IP seen in the last 60s? | `notice: "rate-limited"`. In-memory `Map`, per-instance — best-effort, not a distributed quota. |
| 4 | **Validation** — `validate()` | `{ errors: {...}, values: <echoed> }` — field-level messages keyed by input name. |
| 5 | **Config check** — `RESEND_API_KEY` set? | `notice: "not-configured"` + `console.error`. Never a false confirmation. |
| 6 | **Resend** — internal notification + buyer autoresponder | Logged and swallowed. Never blocks the response. |
| 7 | **Sheet log** — POST full payload to `GOOGLE_SHEET_WEBHOOK_URL` | Logged and swallowed. Never blocks the response. |
| 8 | **Success** — `redirect("/thank-you?kind=…")` | — |

The IP is read from `x-forwarded-for` (first hop) then `x-real-ip`, via
`await headers()` (async in this Next.js version). The rate-limit slot is
claimed (`recordSubmission`) **after** validation passes and **before** the
slow I/O, so a double-click cannot produce two deliveries but a user fixing a
validation error is not locked out.

### Emails (`lib/enquiry.ts`)

- **Internal notification** → `ENQUIRY_TO_EMAIL` (default
  `eden@zoebarbusinessgroup.com`), from `Zoebar Enquiries
  <enquiries@zoebarbusinessgroup.com>`, `replyTo` the buyer, subject
  `New {quote|sample} enquiry — {company}`. Body carries every field plus the
  reCAPTCHA score for reference.
- **Autoresponder** → the buyer, from `Zoebar Business Group
  <enquiries@zoebarbusinessgroup.com>`: "Your enquiry reached our team in
  Dubai. You'll have a reply within one working day." Contains a
  `{{WHATSAPP_LINK}}` **placeholder** — no real link ships until
  `WHATSAPP_NUMBER` is verified (Directive 25).
- Field values are HTML-escaped (`escapeHtml`) before they touch a template;
  the subject line is stripped of CR/LF (`headerSafe`). A small helper, not a
  dependency (Directive 21).

### Sheet payload

`{ timestamp, name, company, email, country, volume, message, kind }` — the
honeypot and the reCAPTCHA token are deliberately **absent**.

---

## State — `enquiry-state.ts`

```ts
interface FormState {
  status: "idle" | "error";
  errors: Record<string, string>;          // field-level, keyed by input name
  notice?: "not-configured" | "delivery-failed"
         | "verification-failed" | "rate-limited";
  values?: Partial<Enquiry>;               // echoed back so a failed submit never wipes input
}
```

- **There is no `"success"` state.** Success is a `redirect()` to
  `/thank-you`, which throws control-flow before any state is returned. The
  form distinguishes outcomes as: redirect = success, `errors` non-empty =
  field errors, `notice` set = a non-field failure the buyer must see.
- `NOTICE_COPY` in `EnquiryForm.tsx` maps each `notice` value to a
  title + body rendered in the live region.
- `enquiry-state.ts` is imported by the **client** form, so it must stay free
  of runtime server code — it only `import type`s `Enquiry`.

---

## `/request-quote` (page)

- Quote form (section 01) and sample form (section 02, deep surface, id
  `#sample`).
- While `RESEND_API_KEY` is unset, a **"Enquiry delivery — Not connected"**
  notice renders above the forms. It is a build-time honesty notice, not a
  permanent design element — it disappears once the key is set.
- `SECONDARY_CTA` (`site.ts`) links to `/request-quote#sample`.

## `/thank-you`

- The one next-step ask (Strategy 6.1): a single onward action ("Read about
  Amaro"), not a menu.
- Reads `?kind=` to switch copy between "Enquiry received" and "Sample request
  received".
- `noindex`. The only dynamic (`ƒ`) route on the site — it reads
  `searchParams`.

## Contact page — `/contact`

Built around the one channel that works — the form — because the direct
channels are unverified:

| Channel | Status | Source |
|---|---|---|
| Enquiry form | Available on the page (anchor `#enquiry`) | — |
| Email | **Being verified** | `ORG.email` (null) |
| Telephone | **Being verified** | `ORG.telephone` (null) |
| WhatsApp | **Withheld** until a number is verified — not pointed at a placeholder | `WHATSAPP_NUMBER` (null) |
| Registered address | **Being verified** | Open Item #10 |
| TRN | **Being verified** | `ORG.trn` (null) |

Also on the page: an "what to include in your first message" list, links to
the Incoterms and documentation guides, and `CONTACT_FAQS`.

Schema: `contactPageSchema()` emits **no** `ContactPoint` while telephone and
email are null — an empty one is worse than none. `faqSchema(CONTACT_FAQS)` +
`breadcrumbSchema()`.

### `CONTACT_FAQS` (`content/faqs.ts`)

Two entries, both pointing at the form: "How do I contact Zoebar about green
coffee?" and "Can I request a sample?". Per the FAQ admissibility rule, a
question whose honest answer is "being verified" is **not** listed.

---

## Environment variables

Copy `.env.local.example` → `.env.local`.

| Var | Scope | Effect if unset |
|---|---|---|
| `RESEND_API_KEY` | server | The delivery gate. Unset → `notice: "not-configured"`, form tells the buyer plainly. |
| `ENQUIRY_TO_EMAIL` | server | Falls back to `eden@zoebarbusinessgroup.com`. |
| `GOOGLE_SHEET_WEBHOOK_URL` | server | No fallback log; emails still send. |
| `RECAPTCHA_SECRET_KEY` | server | reCAPTCHA verification skipped (fails open), warned in logs. |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | client | Token dance skipped; `api.js` not loaded. |

`.env*` is gitignored except `.env.local.example` (an explicit `!` negation).

---

## Honesty rules that apply here

These come from the client's documents — breaking one is a correctness bug.

- **Never show a confirmation for a message nobody received.** If delivery is
  unconfigured or fails at the "not sent" stage, the buyer is told plainly and
  pointed at contacting Zoebar directly.
- **No invented contact details.** Telephone, email, address, WhatsApp are
  `null` until the client confirms them, and render as "Being verified" /
  are withheld. Do not fill them with a plausible value or a generic
  `info@` address.
- **The honeypot path is truly silent** — no send, no log, no distinct
  response. A bot cannot learn the field is a trap.

---

## Not done / owed

- **No end-to-end test against live Resend / reCAPTCHA keys.** Code paths and
  the unconfigured path are in place; a run with real keys is still owed.
- **INP unmeasured.** The form is the only meaningful interaction on the site;
  measure it with real keys in place (`BUILD-STATUS.md` §"Next steps").
- **WhatsApp** — `{{WHATSAPP_LINK}}` in the autoresponder and the whole
  `/contact` WhatsApp row wait on a verified `WHATSAPP_NUMBER` (Directive 25).

---

## Testing locally

```bash
# 1. Unconfigured path (no env): the form must say "This enquiry was not sent"
#    and must NOT redirect to /thank-you.
npm run build && npx next start -p 3215

# 2. Configured path: put real keys in .env.local, submit a test enquiry,
#    confirm the redirect to /thank-you?kind=quote, the two emails, and a row
#    in the sheet.

# 3. Honeypot: submit with the `website` field forced non-empty (devtools) —
#    expect a redirect to /thank-you and NOTHING in logs / inbox / sheet.

# 4. Rate limit: submit twice within 60s from the same email — the second
#    must return the "repeat submission" notice.
```

The static QA harness (`qa/qa.mjs`) covers `/request-quote`, `/contact` and
`/thank-you` for structure, a11y and no-JS render, but does not exercise
submission.
