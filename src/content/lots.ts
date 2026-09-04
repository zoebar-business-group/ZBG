import { client } from "@/sanity/lib/client";

/**
 * LOTS — content model
 * ----------------------------------------------------------------------------
 * Lot pages are the QR destination printed on sacks and sample bags
 * (Strategy 5.4), and the template for programmatic lot pages at scale
 * (Strategy 10.1).
 *
 * A lot page is a record about physical coffee that a buyer can check against
 * the sack in front of them. An invented lot is therefore a false record, not
 * a placeholder. Lots are authored in Sanity Studio (/studio) and read here
 * via GROQ; `publishedLots()` and `lotBySlug()` are the only accessors the
 * pages use. Nothing is seeded in code.
 *
 * The `Lot` shape below is unchanged: the GROQ projection maps a Sanity `lot`
 * document onto it exactly, so the /lots pages and the QR route need no other
 * changes. `isValidLotSlug()` and `lotSlug()` are also unchanged; the same
 * slug pattern is enforced again inside the Sanity `lot` schema as a
 * publish-blocking rule.
 */

export interface Lot {
  /** URL slug and printed reference, e.g. "amaro-washed-2026-01". See the slug
   *  convention below; validate a real slug with `isValidLotSlug()` before it
   *  is ever printed on a sack. */
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
  /** Slugs of producers who grew this lot, already filtered to those whose
   *  Sanity profile has permission granted. */
  producerSlugs: string[];
  /** Set false while a lot is contracted or withdrawn. */
  available: boolean;
  /**
   * A demonstration record, not a live commercial offer.
   *
   * Client instruction, 4 September 2026: the example lot used to review the
   * QR concept must be unmistakably a demo. A lot with this set carries a
   * banner saying so, is excluded from Product structured data and from the
   * enquiry call to action, and is noindex. Real lots leave it off.
   */
  isDemo: boolean;
}

/** Cache tag for every lot query. The Sanity webhook revalidates it on publish. */
export const LOTS_TAG = "lots";

/**
 * Projection from a Sanity `lot` document to the `Lot` interface. Optional
 * fields come back as `null` when unset (matching the `| null` on the type).
 * `producerSlugs` dereferences the `producers` array and keeps only producers
 * whose profile has `permissionGranted == true` — the dignity gate, applied
 * here as well as in `producerBySlug()`.
 *
 * `isDemo` coalesces to TRUE when the field is unset, so a lot document
 * created before the field existed is treated as a demonstration record until
 * someone says otherwise. The failure mode of a real lot briefly marked demo
 * is a caption; the failure mode the other way round is a demonstration
 * record published as a live commercial offer.
 */
const LOT_PROJECTION = /* groq */ `{
  "slug": slug.current,
  "lotId": lotId,
  "harvestYear": harvestYear,
  "process": process,
  "origin": origin,
  "zone": zone,
  "country": country,
  "altitudeMin": altitudeMin,
  "altitudeMax": altitudeMax,
  "grade": grade,
  "screenSize": screenSize,
  "cuppingScore": cuppingScore,
  "moistureContent": moistureContent,
  "packing": packing,
  "quantity": quantity,
  "available": available,
  "isDemo": coalesce(isDemo, true),
  "producerSlugs": coalesce(
    producers[@->permissionGranted == true && defined(@->slug.current)]->slug.current,
    []
  )
}`;

/**
 * Fetch options: cached and tagged, with a 1-hour backstop so content still
 * refreshes if the revalidation webhook is ever misconfigured. The webhook
 * (`/api/revalidate`) is the fast path.
 */
const FETCH_OPTS = { next: { revalidate: 3600, tags: [LOTS_TAG] } };

export async function publishedLots(): Promise<Lot[]> {
  const lots = await client.fetch<Lot[]>(
    /* groq */ `*[_type == "lot" && defined(slug.current)]
      | order(harvestYear desc, lotId asc) ${LOT_PROJECTION}`,
    {},
    FETCH_OPTS,
  );
  return lots ?? [];
}

export async function lotBySlug(slug: string): Promise<Lot | undefined> {
  const lot = await client.fetch<Lot | null>(
    /* groq */ `*[_type == "lot" && slug.current == $slug][0] ${LOT_PROJECTION}`,
    { slug },
    FETCH_OPTS,
  );
  return lot ?? undefined;
}

/**
 * SLUG CONVENTION — decided 29 August 2026, before any real lot existed.
 *
 *   Format:  {origin}-{process}-{harvestYear}-{seq}
 *   Example: amaro-washed-2026-01
 *
 *     origin       lowercase, letters only          "amaro"
 *     process      "washed" or "natural"
 *     harvestYear  four digits, this century        "2026"
 *     seq          two or more digits, zero-padded  "01"
 *
 * The slug is printed on the physical sack and becomes the permanent public
 * URL for that lot, so it has to be correct before it is printed. The Sanity
 * `lot` schema enforces this pattern as a publish-blocking validation rule;
 * `isValidLotSlug()` is the same check for use outside the Studio, and
 * `lotSlug()` builds a slug from its parts.
 */
const LOT_SLUG_RE = /^[a-z]+-(?:washed|natural)-20\d{2}-\d{2,}$/;

export function isValidLotSlug(slug: string): boolean {
  return LOT_SLUG_RE.test(slug);
}

export function lotSlug(
  origin: string,
  process: string,
  harvestYear: number,
  seq: number,
): string {
  const o = origin.trim().toLowerCase().replace(/[^a-z]/g, "");
  const p = process.trim().toLowerCase();
  return `${o}-${p}-${harvestYear}-${String(seq).padStart(2, "0")}`;
}
