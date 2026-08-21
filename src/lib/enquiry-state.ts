import type { Enquiry } from "./enquiry";

/**
 * Form state shared between the server action and the client form.
 *
 * This lives OUTSIDE the "use server" module on purpose: every export from a
 * "use server" file must be an async function. Exporting a plain object from
 * there compiles, but the value arrives as `undefined` at runtime and the
 * first `state.errors` read throws during prerender.
 */
export interface FormState {
  status: "idle" | "error";
  /** Field-level messages, keyed by input name. */
  errors: Record<string, string>;
  /** Non-field failure the buyer needs to see. */
  notice?: "not-configured" | "delivery-failed";
  /** Echoed back so a failed submit never wipes what was typed. */
  values?: Partial<Enquiry>;
}

export const INITIAL_STATE: FormState = { status: "idle", errors: {} };
