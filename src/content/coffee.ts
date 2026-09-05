import { ORIGIN, OPERATIONS } from "@/lib/org";

/**
 * COFFEE OFFER — content model
 * ----------------------------------------------------------------------------
 * Strategy Open Item #4: "Coffee specifications (grades, screens, cupping
 * bands, MOQ, packing, yields, lead times, Incoterms, port)" — needed day 1–2,
 * blocks /coffee, /process and /lots. Nothing below is invented.
 *
 * `null` means the client has not yet confirmed it. It renders as a Pending
 * marker and is stripped from Product schema. Do not substitute a "typical"
 * industry value: a buyer comparing suppliers on MOQ or lead time would be
 * making a purchasing decision on a number Zoebar never stated.
 */

export interface SpecField {
  label: string;
  value: string | null;
  /** Short clarifier shown beneath the value. */
  note?: string;
  /** Include in Product schema additionalProperty when confirmed. */
  schemaName?: string;
  /**
   * Recorded on each lot rather than published as a standing origin figure.
   * A null value on one of these reads "Confirmed per lot", not "Being
   * verified" (grade, screen size, cupping score, moisture).
   */
  perLot?: boolean;
}

/** Verified origin and product identity. */
export const IDENTITY: SpecField[] = [
  {
    label: "Origin",
    value: `${ORIGIN.name} (${ORIGIN.zone}), ${ORIGIN.country}`,
    schemaName: "origin",
  },
  {
    label: "Trade category",
    value: "Commonly presented within the Sidama category",
    note: "Amaro is an administrative zone and is not part of the Sidama Region.",
    schemaName: "tradeCategory",
  },
  { label: "Species", value: ORIGIN.species, schemaName: "species" },
  {
    label: "Altitude",
    value: `${ORIGIN.altitudeMin.toLocaleString("en-US")}–${ORIGIN.altitudeMax.toLocaleString("en-US")} masl`,
    schemaName: "altitude",
  },
  {
    label: "Harvest",
    value: `${ORIGIN.harvestStart} – ${ORIGIN.harvestEnd}`,
    schemaName: "harvestPeriod",
  },
  {
    label: "Processing",
    value: ORIGIN.processing.join(" / "),
    note: "Method is recorded per lot.",
    schemaName: "processingMethod",
  },
  {
    label: "Washing station",
    value: `Affiliated, ${OPERATIONS.washingStationLocation}`,
    note: "An affiliated washing station run with Zoebar's direct operational oversight, set to transfer to Zoebar Ethiopia once the legal transfer is complete.",
    schemaName: "washingStation",
  },
];

/**
 * Quality specification.
 *
 * Client decision, 4 September 2026: grade, screen size, cupping score,
 * moisture and the rest of the raw evaluation are LOT-SPECIFIC information,
 * not standing Zoebar specifications. They stay on the table, carry
 * `perLot: true`, and read "Confirmed per lot" — which is what they are —
 * rather than being hidden or presented as a permanent claim.
 *
 * Varieties is not a per-lot measurement; it is an origin fact that has not
 * been confirmed. Under the same instruction it stays `null` and the row is
 * withheld from the published table until it is confirmed (see
 * `visibleSpecRows` in components/primitives/data).
 */
export const QUALITY_SPEC: SpecField[] = [
  { label: "Grade", value: null, schemaName: "grade", perLot: true },
  { label: "Screen size", value: null, schemaName: "screenSize", perLot: true },
  { label: "Cupping score", value: null, schemaName: "cuppingScore", perLot: true },
  { label: "Defect count", value: null, schemaName: "defectCount", perLot: true },
  { label: "Moisture content", value: null, schemaName: "moistureContent", perLot: true },
  { label: "Varieties", value: null, schemaName: "varieties" },
];

/**
 * Commercial terms — none confirmed, and none of them is a per-lot
 * measurement, so every row is withheld until it is fixed. The tables render
 * their `emptyNote` instead of a column of pending markers.
 */
export const COMMERCIAL_SPEC: SpecField[] = [
  { label: "Packing", value: null, schemaName: "packing" },
  { label: "Minimum order quantity", value: null, schemaName: "minimumOrderQuantity" },
  { label: "Lead time", value: null, schemaName: "leadTime" },
  { label: "Incoterms", value: null, schemaName: "incoterms" },
  { label: "Port of loading", value: null, schemaName: "portOfLoading" },
  { label: "Inspection", value: null, schemaName: "inspection" },
  { label: "Certifications", value: null, schemaName: "certifications" },
];

export const ALL_SPECS = [...IDENTITY, ...QUALITY_SPEC, ...COMMERCIAL_SPEC];

/** Only confirmed fields reach structured data. */
export function confirmedSpecs(): SpecField[] {
  return ALL_SPECS.filter((s) => s.value !== null && s.schemaName);
}

/**
 * Volume bands for the enquiry form. These describe the enquiry, not a
 * Zoebar commitment, so they are safe to publish ahead of MOQ confirmation.
 */
export const VOLUME_BANDS = [
  "Under 1 container",
  "1–5 containers",
  "6–20 containers",
  "Over 20 containers",
  "Not yet determined",
] as const;
