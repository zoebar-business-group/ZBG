/**
 * CANONICAL ORGANISATION ENTITY
 * ----------------------------------------------------------------------------
 * Strategy 5.3: "One canonical entity module in the codebase; every
 * Organization block derives from it." Nothing about the company may be
 * hard-coded into a component. Import from here or it does not ship.
 *
 * THE TRUST RULE (Foundation Brief, section 5):
 *   "We would rather say 'we are verifying that information' than provide an
 *    unsupported claim."
 *
 * Enforced structurally: any field whose value is not verified is `null`.
 * Schema builders strip nulls, so an unverified fact can never reach
 * structured data, the footer, or a page. Do not replace a null with a
 * plausible value. Fill it only from a client-confirmed source.
 */

export type Verified<T> = T | null;

/** Facts confirmed by the Foundation Brief and Coffee-First Strategy. */
export const ORG = {
  /** Legal entity name. Foundation Brief 1. */
  legalName: "Zoebar Business Group FZE LLC",
  /** Trading/display name. "Business group" is integral to the wordmark and
   *  may never be removed (Brand Guideline, Logo). */
  name: "Zoebar Business Group",
  shortName: "Zoebar",

  /** Brand promise. Foundation Brief, header. */
  promise: "Origin. Quality. Trust.",

  /** Positioning principle. Foundation Brief 1. */
  positioning:
    "Zoebar succeeds by consistently reducing the distance between origin and the world.",

  description:
    "Zoebar Business Group is a UAE-registered international trading company connecting Ethiopia and international markets. Its flagship focus is Ethiopian Arabica green coffee from Amaro, brought closer to global buyers through quality, transparency and traceability.",

  url: "https://zoebarbusinessgroup.com",

  /** Country of registration. Foundation Brief 3. */
  country: "AE",

  /** ---------------------------------------------------------------------
   *  Strategy Open Item #10. Address, telephone and email were confirmed by
   *  the client on 28 August 2026 and are no longer pending. TRN and founding
   *  date were NOT supplied and stay null: they render as "Being verified"
   *  rather than as a plausible guess.
   *
   *  `postalCode` is optional because none was given, and most UAE addresses
   *  do not carry one. An invented code in Organization schema would be a
   *  machine-readable false claim about the legal entity.
   *  ------------------------------------------------------------------- */
  legalAddress: {
    streetAddress: "Al Rashidiya 1",
    addressLocality: "Ajman",
    addressRegion: "Ajman",
    addressCountry: "AE",
  } as Verified<{
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode?: string;
    addressCountry: string;
  }>,
  trn: null as Verified<string>,
  telephone: "+971 58 989 9564" as Verified<string>,
  email: "Info@zoebarbusinessgroup.com" as Verified<string>,
  foundingDate: null as Verified<string>,
  /** Social profiles feed schema `sameAs`. Strategy 4.5 requires one
   *  canonical record used verbatim everywhere — so these ship together. */
  sameAs: ["https://www.linkedin.com/company/zoebar-business-group/"] as string[],

  /** The company LinkedIn page. /journal points here until the journal carries
   *  its own entries (Open Item #12). Kept as a named constant so the redirect
   *  and the schema `sameAs` above cannot drift apart. */
  linkedin: "https://www.linkedin.com/company/zoebar-business-group/",
} as const;

/**
 * ORIGIN FACTS — Foundation Brief 2, "Current foundation".
 *
 * The Amaro / Sidama distinction is the single most important accuracy point
 * on the site (Strategy 4.1: "Accuracy becomes the ranking advantage").
 * Amaro is an administrative zone (Koore Zone). It is NOT administratively
 * part of the Sidama Region, but its coffee is commonly traded within the
 * broader Sidama category. Both halves must always appear together.
 */
export const ORIGIN = {
  name: "Amaro",
  zone: "Koore Zone",
  country: "Ethiopia",

  /** Verified altitude band, in metres above sea level. */
  altitudeMin: 1700,
  altitudeMax: 1800,

  /** Verified harvest window. */
  harvestStart: "September",
  harvestEnd: "December",

  /** Verified processing methods. Which applies depends on the lot. */
  processing: ["Washed", "Natural"] as const,

  species: "Ethiopian Arabica",

  /** The accuracy statement. Reused verbatim wherever the category is named,
   *  so the fact stays identical across the site (Strategy 5.1 —
   *  "corroborated"). */
  categoryNote:
    "Amaro is an administrative zone in Ethiopia, recently named as Koore Zone, and is not administratively part of the Sidama Region. In international coffee markets, coffee from Amaro is commonly presented within the broader Sidama coffee category.",

  /** PENDING — no coordinates confirmed. Blocks Place schema geo/elevation. */
  geo: null as Verified<{ latitude: number; longitude: number }>,
  /** PENDING — Open Item #4. Varieties are explicitly listed in the Foundation
   *  Brief as information to incorporate "when verified rather than assumed". */
  varieties: null as Verified<string[]>,
  cuppingScore: null as Verified<string>,
} as const;

/**
 * OPERATIONS — Foundation Brief 3.
 * The washing station is "an operational asset and a credibility anchor",
 * to be shown through accurate information and authentic field documentation,
 * never as decorative background.
 */
export const OPERATIONS = {
  uaeEntity: "Zoebar Business Group FZE LLC",
  uaeStatus: "Operating",
  ethiopiaEntity: "Zoebar Ethiopia",
  /** Verified: "is being established in Addis Ababa". Present tense matters —
   *  do not upgrade this to "established" without confirmation. */
  ethiopiaStatus: "Being established in Addis Ababa",
  /**
   * Washing-station tenure. CLIENT INSTRUCTION, 4 September 2026, and absolute
   * until the legal transfer completes:
   *
   *   "Until the legal transfer to Zoebar is complete, please avoid wording
   *    such as 'Zoebar-owned washing station'. Please use wording such as
   *    'our affiliated washing station in Amaro, Ethiopia' or 'processed at an
   *    affiliated washing station in Amaro with direct operational oversight'."
   *
   * So: never "Zoebar-owned", never "our own", never "owned and operated", and
   * never any phrasing that places the station inside Zoebar's ownership —
   * "within Zoebar's ownership structure" is out for the same reason. Use
   * "affiliated" plus "direct operational oversight", and nothing stronger.
   */
  washingStationTenure:
    "an affiliated washing station in Amaro, Ethiopia, run with Zoebar's direct operational oversight and set to transfer to Zoebar Ethiopia once the legal transfer is complete",
  washingStationLocation: "Amaro, Ethiopia",

  /** PENDING — Open Item #6, traceability depth. */
  traceabilityDepth: null as Verified<string>,
  /** PENDING — Open Item #4. */
  annualVolume: null as Verified<string>,
  certifications: null as Verified<string[]>,
} as const;

/**
 * FOUNDER — supplied by the client on 4 September 2026, together with the
 * portrait and the working text of the founder story.
 *
 * Only what the client actually wrote is here. No title beyond "Founder" is
 * asserted, no dates, no prior employers: the brief named the background as
 * "monitoring, evaluation, research and learning" and "learning- and
 * evidence-focused organizations", and that is as far as the record goes.
 *
 * The client has said they may refine the story text before publication, so
 * `STORY` below is the working copy and is expected to be replaced verbatim
 * when the final version arrives.
 */
export const FOUNDER = {
  name: "Eden Mengistu",
  role: "Founder",
  /** Supplied headshot, cut out onto a transparent ground and faded at the
   *  foot by `scripts/founder-portrait.cjs`, so the page shows through behind
   *  her rather than a baked-in panel that never quite matches the surface.
   *  WebP because it carries the alpha channel that blend depends on. */
  portrait: "/founder-eden.webp",
  portraitAlt:
    "Eden Mengistu, founder of Zoebar Business Group, photographed against a soft cream background.",
  /** The founder's account, as supplied. Not paraphrased. */
  story: [
    "Eden Mengistu brings a background in monitoring, evaluation, research and learning to the way Zoebar approaches coffee and international trade. After years working in learning- and evidence-focused organizations, she entered the coffee business with a strong belief that commercial success should be built on knowledge, relationships, transparency and continuous improvement.",
    "Through Zoebar, Eden is building a business that stays close to origin: learning directly from producers, understanding how coffee is grown and processed, and developing transparent relationships with international buyers.",
    "This learning mindset shapes Zoebar's approach: verify before claiming, understand before selling, and keep improving from one season to the next.",
  ] as const,
  /** The closing line, set apart in the layout. */
  refrain: "Always learning. Always improving.",
} as const;

/** Priority buyers. Foundation Brief 4. */
export const BUYERS = [
  "Specialty and quality-focused coffee roasters",
  "Medium-sized and family-owned coffee companies",
  "Green coffee buyers and importers",
  "Businesses seeking dependable Ethiopian sourcing relationships",
] as const;

/** Formatted altitude band, e.g. "1,700–1,800". Single source for display. */
export function altitudeBand(): string {
  return `${ORIGIN.altitudeMin.toLocaleString("en-US")}–${ORIGIN.altitudeMax.toLocaleString("en-US")}`;
}

/** Formatted harvest window, e.g. "September – December". */
export function harvestWindow(): string {
  return `${ORIGIN.harvestStart} – ${ORIGIN.harvestEnd}`;
}
