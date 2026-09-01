/**
 * SITE CONFIGURATION — routes, navigation, WhatsApp.
 * Architecture per Strategy 3. /produce, /produce/cold-chain and /hospitality
 * are removed, along with the three-division framing. Do not reintroduce them.
 */

import { ORG } from "./org";

/**
 * The origin this deployment is served from.
 *
 * `ORG.url` is the production canonical and is never changed. Preview and
 * branch deployments set `NEXT_PUBLIC_SITE_URL` to their own origin so that
 * absolute URLs — most importantly the lot QR codes, which get physically
 * scanned during review — point at the deployment under test rather than at
 * production. Unset (i.e. production), this is exactly `ORG.url`, so nothing
 * about production changes.
 *
 * A trailing slash on the env value is tolerated. The value must be a valid
 * absolute URL; a malformed one fails the build at `new URL(SITE_URL)` in the
 * root layout, which is the intended safety net.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || ORG.url).replace(
  /\/+$/,
  "",
);

export type Density = "story" | "spec";

export interface Route {
  path: string;
  label: string;
  /** Two-density system, Strategy 3.1. */
  density: Density;
  /** Excluded from sitemap and set to noindex. */
  noindex?: boolean;
  /**
   * Whether the route currently ships. Only built routes enter the sitemap —
   * submitting URLs that 404 damages the "100% of pages indexed clean" target
   * in Strategy 8. Flip to true as each phase lands.
   *
   * Shipping and indexing are separate decisions. A route that is linked in
   * the navigation must ship, or the link 404s; a route whose content is still
   * pending must not be indexed, or it is thin content in the sitemap. Such a
   * route carries `built: true` AND `noindex: true`, and the page sets the
   * matching `robots` metadata.
   */
  built?: boolean;
  /**
   * The page opens on a deep (emerald/ink) surface, so the navigation must
   * render inverted until the user scrolls. Without this the dark wordmark and
   * links sit on a dark header and fail contrast.
   */
  darkHeader?: boolean;
  /** Appears in the primary navigation. */
  inNav?: boolean;
  /**
   * Label used in the primary navigation only, where it differs from `label`.
   * `label` still drives breadcrumbs and schema, so changing what the header
   * reads does not rewrite the site's structured data.
   */
  navLabel?: string;
  /**
   * If set, the nav and footer links for this route point straight at this URL
   * and open in a new tab, rather than navigating to `path`. The route itself
   * still exists and 308-redirects (e.g. /journal → the company LinkedIn while
   * the journal has no entries) — this only changes the visible links so a
   * click leaves the site cleanly in a new tab instead of a same-tab redirect.
   */
  externalHref?: string;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
}

export const ROUTES: Route[] = [
  { path: "/", label: "Home", density: "story", built: true, darkHeader: true, changeFrequency: "weekly", priority: 1 },
  { path: "/coffee", label: "Coffee", density: "spec", built: true, inNav: true, changeFrequency: "weekly", priority: 0.9 },
  { path: "/amaro", label: "Amaro", density: "story", built: true, darkHeader: true, inNav: true, changeFrequency: "monthly", priority: 0.9 },
  { path: "/process", label: "Process", density: "spec", built: true, changeFrequency: "monthly", priority: 0.8 },
  { path: "/quality", label: "Quality", density: "spec", built: true, changeFrequency: "monthly", priority: 0.8 },
  { path: "/traceability", label: "Traceability", density: "spec", built: true, changeFrequency: "monthly", priority: 0.8 },
  /* The lot index and template ship; lot pages are the QR destination and a
     404 there would be a visible defect. DELIBERATELY UNLINKED: no primary nav
     (no `inNav`) and no footer entry either. The only routes in are a scanned
     QR code, which lands on /lots/[slug] directly, and an explicit link from an
     enquiry or a page referencing a specific lot. The entry stays here so
     sitemap.ts can pick /lots up automatically once it is populated.
     noindex while LOTS is empty (a one-line empty state is thin content), same
     pattern as /journal. Remove `noindex` here and the `robots` block in
     app/lots/page.tsx once real lots exist; the index can then be indexed even
     though it is not in any nav. */
  { path: "/lots", label: "Lots", density: "spec", built: true, noindex: true, changeFrequency: "weekly", priority: 0.8 },
  { path: "/farmers", label: "Farmers", density: "story", built: true, darkHeader: true, changeFrequency: "monthly", priority: 0.7 },
  /* Ships (it is in the primary navigation, and a 404 there is a visible
     defect) but is noindex while ENTRIES is empty — a section with no entries
     is thin content. Remove `noindex` here and the `robots` block in
     app/journal/page.tsx when the first entry is published.
     While it has no entries, the nav/footer links go straight to the company
     LinkedIn in a new tab (`externalHref`); the /journal route still 308s
     there for direct hits and crawlers. Drop `externalHref` when the journal
     carries its own entries. */
  { path: "/journal", label: "Journal", density: "story", built: true, noindex: true, inNav: true, externalHref: ORG.linkedin, changeFrequency: "weekly", priority: 0.7 },
  { path: "/guides", label: "Guides", density: "spec", built: true, inNav: true, changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", label: "About", navLabel: "About Us", density: "story", built: true, darkHeader: true, inNav: true, changeFrequency: "yearly", priority: 0.6 },
  /* Same reasoning as /journal: linked from the footer and from /about, so it
     ships, but noindex until it carries the founder's own account (Open Item
     #7) rather than a page about the absence of one. */
  { path: "/about/founder", label: "Founder", density: "story", built: true, noindex: true, darkHeader: true, changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", label: "Contact", density: "spec", built: true, changeFrequency: "yearly", priority: 0.6 },
  { path: "/request-quote", label: "Request Quote", density: "spec", built: true, changeFrequency: "monthly", priority: 0.9 },
  { path: "/thank-you", label: "Thank you", density: "spec", noindex: true },
];

/** Routes whose header opens on a deep surface. */
export function hasDarkHeader(pathname: string): boolean {
  return ROUTES.some((r) => r.path === pathname && r.darkHeader === true);
}

/**
 * Primary navigation, in the order the header renders it. Declared explicitly
 * rather than taken from ROUTES order: ROUTES is sequenced for the sitemap by
 * priority, which would put Journal ahead of Guides. Any path listed here must
 * also carry `inNav` so the two cannot drift apart unnoticed.
 */
const NAV_ORDER = ["/coffee", "/amaro", "/guides", "/journal", "/about"] as const;

export const NAV_ITEMS = NAV_ORDER.map((path) => {
  const route = ROUTES.find((r) => r.path === path && r.inNav);
  if (!route) {
    throw new Error(
      `NAV_ORDER lists ${path}, which is missing from ROUTES or not marked inNav.`,
    );
  }
  return route;
});

/** What the header prints for a route. */
export function navLabelFor(route: Route): string {
  return route.navLabel ?? route.label;
}

/** External URL a route's nav/footer link should open (in a new tab), if any. */
export function externalHrefFor(path: string): string | undefined {
  return ROUTES.find((r) => r.path === path)?.externalHref;
}

/** Primary conversion, Strategy 6 / Directive 24. */
export const PRIMARY_CTA = { label: "Request a Quote", href: "/request-quote#quote" } as const;
export const SECONDARY_CTA = { label: "Request a Sample", href: "/request-quote#sample" } as const;

/**
 * WhatsApp — a first-class commercial channel (Strategy 6.1), with
 * page-aware prefilled messages.
 *
 * The client confirmed the WhatsApp number on 28 August 2026, and it is the
 * same line as `ORG.telephone`, so that verified value is the default. The
 * `WHATSAPP_NUMBER` env var still overrides it, which is what a separate
 * business line would need. The withheld-rather-than-placeholder behaviour is
 * retained for the case where both are absent: no affordance is ever pointed
 * at a number nobody has confirmed.
 *
 * It is a server-side value (no `NEXT_PUBLIC_` prefix), so `process.env`
 * resolves it in Server Components and the server action; on the client it
 * reads as `null`. Client components must receive `WHATSAPP_ENABLED` as a prop
 * from a Server Component rather than importing it here.
 */
export const WHATSAPP_NUMBER: string | null =
  process.env.WHATSAPP_NUMBER ?? ORG.telephone;

/** Whether the WhatsApp channel is configured. Server-only — see above. */
export const WHATSAPP_ENABLED = Boolean(WHATSAPP_NUMBER);

export function whatsappHref(message: string): string | null {
  // Forgiving of "+", spaces and dashes in the env value — wa.me wants digits.
  const number = WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Page-aware prefilled messages. Directive 25. */
export const WHATSAPP_MESSAGES: Record<string, string> = {
  "/": "Hello Zoebar, I'd like to discuss Ethiopian green coffee.",
  "/coffee": "Hello Zoebar, I'd like specifications and availability for your green coffee.",
  "/amaro": "Hello Zoebar, I'd like to discuss Amaro green coffee.",
  "/process": "Hello Zoebar, I have a question about your processing and lead times.",
  "/quality": "Hello Zoebar, I'd like to discuss grading and cupping.",
  "/traceability": "Hello Zoebar, I'd like to understand your lot traceability.",
  "/request-quote": "Hello Zoebar, I'd like to request a quote.",
  "/guides": "Hello Zoebar, I have a question about buying Ethiopian green coffee.",
  "/journal": "Hello Zoebar, I'd like to hear about the current harvest.",
  "/about": "Hello Zoebar, I'd like to know more about your company.",
  "/contact": "Hello Zoebar, I'd like to speak to someone about green coffee.",
};

export function whatsappMessageFor(pathname: string): string {
  if (WHATSAPP_MESSAGES[pathname]) return WHATSAPP_MESSAGES[pathname];
  if (pathname.startsWith("/guides/")) {
    return "Hello Zoebar, I have a question about buying Ethiopian green coffee.";
  }
  if (pathname.startsWith("/lots/")) {
    const id = pathname.split("/")[2]?.toUpperCase() ?? "";
    return `Hello Zoebar, I'd like more information about Lot ${id}.`;
  }
  return WHATSAPP_MESSAGES["/"];
}
