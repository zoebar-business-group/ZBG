/**
 * SITE CONFIGURATION — routes, navigation, WhatsApp.
 * Architecture per Strategy 3. /produce, /produce/cold-chain and /hospitality
 * are removed, along with the three-division framing. Do not reintroduce them.
 */

import { ORG } from "./org";

export const SITE_URL = ORG.url;

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
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
}

export const ROUTES: Route[] = [
  { path: "/", label: "Home", density: "story", built: true, darkHeader: true, changeFrequency: "weekly", priority: 1 },
  { path: "/coffee", label: "Coffee", density: "spec", built: true, inNav: true, changeFrequency: "weekly", priority: 0.9 },
  { path: "/amaro", label: "Amaro", density: "story", built: true, darkHeader: true, inNav: true, changeFrequency: "monthly", priority: 0.9 },
  { path: "/process", label: "Process", density: "spec", built: true, inNav: true, changeFrequency: "monthly", priority: 0.8 },
  { path: "/quality", label: "Quality", density: "spec", changeFrequency: "monthly", priority: 0.8 },
  { path: "/traceability", label: "Traceability", density: "spec", built: true, inNav: true, changeFrequency: "monthly", priority: 0.8 },
  { path: "/farmers", label: "Farmers", density: "story", built: true, darkHeader: true, changeFrequency: "monthly", priority: 0.7 },
  { path: "/journal", label: "Journal", density: "story", inNav: true, changeFrequency: "weekly", priority: 0.7 },
  { path: "/guides", label: "Guides", density: "spec", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", label: "About", density: "story", inNav: true, changeFrequency: "yearly", priority: 0.6 },
  { path: "/about/founder", label: "Founder", density: "story", changeFrequency: "yearly", priority: 0.5 },
  { path: "/contact", label: "Contact", density: "spec", changeFrequency: "yearly", priority: 0.6 },
  { path: "/request-quote", label: "Request Quote", density: "spec", built: true, changeFrequency: "monthly", priority: 0.9 },
  { path: "/thank-you", label: "Thank you", density: "spec", noindex: true },
];

/** Routes whose header opens on a deep surface. */
export function hasDarkHeader(pathname: string): boolean {
  return ROUTES.some((r) => r.path === pathname && r.darkHeader === true);
}

export const NAV_ITEMS = ROUTES.filter((r) => r.inNav);

/** Primary conversion, Strategy 6 / Directive 24. */
export const PRIMARY_CTA = { label: "Request a Quote", href: "/request-quote" } as const;
export const SECONDARY_CTA = { label: "Request a Sample", href: "/request-quote#sample" } as const;

/**
 * WhatsApp — a first-class commercial channel (Strategy 6.1), with
 * page-aware prefilled messages. PENDING: no number is verified yet, so the
 * action is withheld rather than pointed at a placeholder number.
 */
export const WHATSAPP_NUMBER: string | null = null;

export function whatsappHref(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Page-aware prefilled messages. Directive 25. */
export const WHATSAPP_MESSAGES: Record<string, string> = {
  "/": "Hello Zoebar — I'd like to discuss Ethiopian green coffee.",
  "/coffee": "Hello Zoebar — I'd like specifications and availability for your green coffee.",
  "/amaro": "Hello Zoebar — I'd like to discuss Amaro green coffee.",
  "/process": "Hello Zoebar — I have a question about your processing and lead times.",
  "/quality": "Hello Zoebar — I'd like to discuss grading and cupping.",
  "/traceability": "Hello Zoebar — I'd like to understand your lot traceability.",
  "/request-quote": "Hello Zoebar — I'd like to request a quote.",
};

export function whatsappMessageFor(pathname: string): string {
  if (WHATSAPP_MESSAGES[pathname]) return WHATSAPP_MESSAGES[pathname];
  if (pathname.startsWith("/lots/")) {
    const id = pathname.split("/")[2]?.toUpperCase() ?? "";
    return `Hello Zoebar — I'd like more information about Lot ${id}.`;
  }
  return WHATSAPP_MESSAGES["/"];
}
