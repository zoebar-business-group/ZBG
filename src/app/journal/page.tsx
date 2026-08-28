import { permanentRedirect } from "next/navigation";

import { ORG } from "@/lib/org";

/**
 * JOURNAL -> LINKEDIN
 * ----------------------------------------------------------------------------
 * The journal has no entries of its own yet (Open Item #12), and the client
 * publishes to the company LinkedIn page in the meantime. Rather than show a
 * page explaining an absence, /journal forwards there.
 *
 * This is a temporary arrangement. When the LinkedIn API is connected and posts
 * are mirrored into `content/journal.ts`, delete this file, restore the page
 * from git history, and drop `noindex` from the /journal route in lib/site.ts.
 *
 * `permanentRedirect` is deliberate over `redirect`: a 308 tells crawlers the
 * LinkedIn page is the canonical destination for now, and /journal is already
 * `noindex` and excluded from the sitemap, so no ranking signal is being
 * handed away from an indexed URL.
 *
 * No `metadata` export here. Metadata on a route that never renders is dead
 * code, and the redirect fires before any of it would be used.
 */
export default function JournalPage(): never {
  permanentRedirect(ORG.linkedin);
}
