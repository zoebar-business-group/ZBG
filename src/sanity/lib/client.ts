import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

/**
 * Read-only client for published content.
 *
 * The `production` dataset is private, so `SANITY_API_TOKEN` (Viewer role, no
 * NEXT_PUBLIC_ prefix, server-only) is required to read it. `perspective:
 * "published"` keeps drafts out.
 *
 * `useCdn: false` because the /lots pages are statically generated and
 * refreshed with on-demand revalidation (`src/app/api/revalidate/route.ts`)
 * plus a 1-hour ISR backstop, not by polling the CDN. Fetches pass
 * `next: { revalidate, tags }` (see `src/content/lots.ts`).
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_TOKEN,
});
