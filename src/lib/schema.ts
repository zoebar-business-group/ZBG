/**
 * STRUCTURED DATA BUILDERS
 * ----------------------------------------------------------------------------
 * Strategy 5.3. Every Organization block derives from the canonical entity in
 * `org.ts`. `prune()` removes null/undefined/empty values recursively, so a
 * fact that has not been verified cannot reach the page — the trust rule is
 * enforced by the serialiser, not by reviewer discipline.
 */

import { ORG, ORIGIN, altitudeBand } from "./org";

type Json = Record<string, unknown>;

/** Recursively strip null, undefined, empty strings, empty arrays/objects. */
export function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const arr = value.map(prune).filter((v) => v !== undefined && v !== null);
    return (arr.length ? arr : undefined) as T;
  }
  if (value && typeof value === "object") {
    const out: Json = {};
    for (const [k, v] of Object.entries(value as Json)) {
      const cleaned = prune(v);
      if (cleaned !== undefined && cleaned !== null && cleaned !== "") {
        out[k] = cleaned;
      }
    }
    return (Object.keys(out).length ? out : undefined) as T;
  }
  return value;
}

const ORG_ID = `${ORG.url}/#organization`;
const SITE_ID = `${ORG.url}/#website`;

/** The one Organization node. Everything else references it by @id. */
export function organizationSchema(): Json {
  return prune({
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG.name,
    legalName: ORG.legalName,
    alternateName: ORG.shortName,
    description: ORG.description,
    url: ORG.url,
    slogan: ORG.promise,
    // Null until Open Item #10 is answered; pruned out entirely until then.
    address: ORG.legalAddress
      ? { "@type": "PostalAddress", ...ORG.legalAddress }
      : null,
    vatID: ORG.trn,
    telephone: ORG.telephone,
    email: ORG.email,
    foundingDate: ORG.foundingDate,
    sameAs: ORG.sameAs.length ? [...ORG.sameAs] : null,
  });
}

export function websiteSchema(): Json {
  return prune({
    "@type": "WebSite",
    "@id": SITE_ID,
    url: ORG.url,
    name: ORG.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  });
}

/** Place schema for Amaro. geo/elevation appear only once confirmed. */
export function originPlaceSchema(): Json {
  return prune({
    "@type": "Place",
    "@id": `${ORG.url}/amaro#place`,
    name: `${ORIGIN.name}, ${ORIGIN.country}`,
    alternateName: ORIGIN.zone,
    description: ORIGIN.categoryNote,
    address: {
      "@type": "PostalAddress",
      addressRegion: ORIGIN.zone,
      addressCountry: "ET",
    },
    geo: ORIGIN.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: ORIGIN.geo.latitude,
          longitude: ORIGIN.geo.longitude,
          elevation: `${ORIGIN.altitudeMin}-${ORIGIN.altitudeMax} m`,
        }
      : null,
  });
}

export function breadcrumbSchema(
  trail: ReadonlyArray<{ name: string; path: string }>,
): Json {
  return prune({
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${ORG.url}${t.path}`,
    })),
  });
}

/**
 * FAQPage. Answers must be self-contained (Strategy 5.2) — they are quoted
 * without surrounding context by answer engines.
 */
export function faqSchema(
  faqs: ReadonlyArray<{ question: string; answer: string }>,
): Json | undefined {
  if (!faqs.length) return undefined;
  return prune({
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  });
}

/**
 * Article. `datePublished` / `dateModified` are required by Strategy 5.3 for
 * journal entries; pass real dates only — an invented publication date is a
 * fabricated record.
 */
export function articleSchema(a: {
  headline: string;
  description: string;
  path: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}): Json {
  return prune({
    "@type": "Article",
    "@id": `${ORG.url}${a.path}#article`,
    headline: a.headline,
    description: a.description,
    url: `${ORG.url}${a.path}`,
    datePublished: a.datePublished,
    dateModified: a.dateModified,
    author: a.author ? { "@type": "Organization", name: a.author } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
  });
}

/**
 * Product with additionalProperty per spec (Strategy 5.3).
 *
 * No `offers` node is emitted: Strategy 5.3 permits Offer only "where terms
 * are public", and no price, MOQ or Incoterms have been confirmed. Emitting an
 * Offer with no price would advertise availability Zoebar has not stated.
 */
export function productSchema(p: {
  name: string;
  description: string;
  path: string;
  properties: ReadonlyArray<{ name: string; value: string }>;
}): Json {
  return prune({
    "@type": "Product",
    "@id": `${ORG.url}${p.path}#product`,
    name: p.name,
    description: p.description,
    url: `${ORG.url}${p.path}`,
    category: "Green coffee",
    brand: { "@id": ORG_ID },
    manufacturer: { "@id": ORG_ID },
    countryOfOrigin: { "@type": "Country", name: ORIGIN.country },
    additionalProperty: p.properties.map((x) => ({
      "@type": "PropertyValue",
      name: x.name,
      value: x.value,
    })),
  });
}

/** Wraps nodes in a single @graph so one script tag carries the page. */
export function graph(...nodes: Array<Json | undefined>): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  });
}

/**
 * CollectionPage with an embedded ItemList — for /guides and /journal.
 *
 * The list carries only entries that actually exist. An empty index emits the
 * page node without a list rather than an ItemList of length zero, which would
 * assert a collection that has nothing in it.
 */
export function collectionSchema(c: {
  name: string;
  description: string;
  path: string;
  items: ReadonlyArray<{ name: string; path: string }>;
}): Json {
  return prune({
    "@type": "CollectionPage",
    "@id": `${ORG.url}${c.path}#collection`,
    name: c.name,
    description: c.description,
    url: `${ORG.url}${c.path}`,
    isPartOf: { "@id": SITE_ID },
    publisher: { "@id": ORG_ID },
    mainEntity: c.items.length
      ? {
          "@type": "ItemList",
          numberOfItems: c.items.length,
          itemListElement: c.items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            url: `${ORG.url}${item.path}`,
          })),
        }
      : null,
  });
}

/**
 * ContactPage. No ContactPoint is emitted while telephone and email are
 * unverified (Open Item #10) — prune() removes the node entirely rather than
 * publishing an empty contact method, which would read as a broken record.
 */
export function contactPageSchema(path: string): Json {
  const point =
    ORG.telephone || ORG.email
      ? {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: ORG.telephone,
          email: ORG.email,
          areaServed: "Worldwide",
          availableLanguage: "English",
        }
      : null;

  return prune({
    "@type": "ContactPage",
    "@id": `${ORG.url}${path}#contact`,
    url: `${ORG.url}${path}`,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    mainEntity: point,
  });
}

/** AboutPage, pointing at the one Organization node. */
export function aboutPageSchema(a: {
  name: string;
  description: string;
  path: string;
}): Json {
  return prune({
    "@type": "AboutPage",
    "@id": `${ORG.url}${a.path}#about`,
    name: a.name,
    description: a.description,
    url: `${ORG.url}${a.path}`,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  });
}

/**
 * A verified, self-contained sentence about the offer. Reused verbatim so the
 * same fact appears identically everywhere (Strategy 5.1 — "corroborated").
 * Strategy 5.2 cites this construction as the citable example.
 */
export function citableSummary(): string {
  return `Zoebar supplies washed and natural Ethiopian Arabica green coffee from ${ORIGIN.name} (${ORIGIN.zone}), Ethiopia, grown at ${altitudeBand()} metres above sea level, harvested ${ORIGIN.harvestStart} to ${ORIGIN.harvestEnd} and processed at an affiliated washing station in ${ORIGIN.name} with Zoebar's direct operational oversight.`;
}
