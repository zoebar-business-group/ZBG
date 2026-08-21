/**
 * LOTS — content model
 * ----------------------------------------------------------------------------
 * Lot pages are the QR destination printed on sacks and sample bags
 * (Strategy 5.4), and the template for programmatic lot pages at scale
 * (Strategy 10.1).
 *
 * A lot page is a record about physical coffee that a buyer can check against
 * the sack in front of them. An invented lot is therefore not a placeholder —
 * it is a false record. None are seeded. `LOTS` fills as the client confirms
 * traceability depth (Open Item #6) and per-lot specifications (Open Item #4).
 */

export interface Lot {
  /** URL slug and printed reference, e.g. "amaro-2026-042". */
  slug: string;
  /** Display identifier, e.g. "Lot 042". */
  lotId: string;
  harvestYear: number;
  /** "Washed" | "Natural" — recorded per lot, never assumed. */
  process: string;
  origin: string;
  zone: string;
  country: string;
  altitudeMin: number | null;
  altitudeMax: number | null;
  grade: string | null;
  screenSize: string | null;
  cuppingScore: string | null;
  moistureContent: string | null;
  packing: string | null;
  quantity: string | null;
  /** Slugs of producers who grew this lot, gated on their permission. */
  producerSlugs: string[];
  /** Set false while a lot is contracted or withdrawn. */
  available: boolean;
}

export const LOTS: readonly Lot[] = [];

export function publishedLots(): Lot[] {
  return [...LOTS];
}

export function lotBySlug(slug: string): Lot | undefined {
  return LOTS.find((l) => l.slug === slug);
}
