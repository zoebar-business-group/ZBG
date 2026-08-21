/**
 * PRODUCER PROFILES — content model
 * ----------------------------------------------------------------------------
 * Strategy 3.2: "A farmer profile content type: name, plot, altitude, years
 * with Zoebar, photograph, their own words where possible, and a permission
 * field without which a profile cannot publish."
 *
 * The permission gate is enforced in code, not by editorial discipline:
 * `publishedProfiles()` filters on it and is the only accessor the pages use.
 *
 * Framing rule, from the client's own brief and absolute: producers are
 * presented as skilled producers. Never charity, poverty or rescue framing.
 */

export interface Producer {
  slug: string;
  name: string;
  /** Plot or kebele name within Amaro. */
  plot: string;
  /** Metres above sea level for this specific plot. */
  altitude: number | null;
  /** Years working with Zoebar. */
  yearsWithZoebar: number | null;
  /** The producer's own words, where given. */
  quote: string | null;
  /** Path to a supplied photograph. */
  photo: string | null;
  photoAlt: string | null;
  /** Lot slugs this producer contributed to. */
  lots: string[];
  /**
   * Documented permission from the producer to publish their name, photograph
   * and words. Without this the profile cannot be published — no exceptions.
   */
  permissionGranted: boolean;
  /** When permission was recorded, for the audit trail. */
  permissionRecordedOn: string | null;
}

/**
 * No profiles yet. Strategy Open Item #9 — "Farmer names, photos, documented
 * permissions" — is marked progressive and post-launch. Profiles are added
 * here as each permission is recorded; nothing is seeded with placeholder
 * people, because an invented producer would be a fabricated record about a
 * real community.
 */
export const PRODUCERS: readonly Producer[] = [];

/** The only accessor pages may use. Enforces the permission gate. */
export function publishedProducers(): Producer[] {
  return PRODUCERS.filter((p) => p.permissionGranted);
}

export function producerBySlug(slug: string): Producer | undefined {
  return publishedProducers().find((p) => p.slug === slug);
}
