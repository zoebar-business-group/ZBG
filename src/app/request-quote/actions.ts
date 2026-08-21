"use server";

import { redirect } from "next/navigation";

import { deliverEnquiry, type Enquiry } from "@/lib/enquiry";
import type { FormState } from "@/lib/enquiry-state";

/**
 * Every export from this module must be an async function — that is the
 * "use server" contract. The FormState shape and its initial value live in
 * `@/lib/enquiry-state` for that reason.
 */
export async function submitEnquiry(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const enquiry: Enquiry = {
    name: String(formData.get("name") ?? ""),
    company: String(formData.get("company") ?? ""),
    email: String(formData.get("email") ?? ""),
    country: String(formData.get("country") ?? ""),
    volume: String(formData.get("volume") ?? ""),
    message: String(formData.get("message") ?? ""),
    kind: String(formData.get("kind") ?? "quote"),
  };

  const result = await deliverEnquiry(enquiry);

  if (result.ok) {
    redirect(`/thank-you?kind=${encodeURIComponent(enquiry.kind)}`);
  }

  if (result.reason === "validation") {
    return { status: "error", errors: result.errors, values: enquiry };
  }

  // Delivery is not configured, or the endpoint failed. Never show a success
  // screen for a message nobody received.
  return { status: "error", errors: {}, notice: result.reason, values: enquiry };
}
