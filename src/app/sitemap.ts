import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";
import { GUIDES } from "@/content/guides";
import { publishedEntries } from "@/content/journal";

/**
 * XML sitemap, auto-generated from the route table (Strategy 4.3).
 *
 * Only routes marked `built` and not `noindex` are included — a sitemap that
 * lists 404s, or thin pages, works against the "100% of pages indexed clean"
 * ninety-day target.
 *
 * Content-driven routes (/guides/[slug], /journal/[slug], /lots/[slug]) are
 * generated from their content modules rather than from the route table, so a
 * URL enters the sitemap at the same moment the page starts to exist. Lot pages
 * are deliberately absent: `LOTS` is empty and a lot URL is a record about
 * physical coffee, so none may be seeded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = ROUTES.filter((r) => r.built && !r.noindex).map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  /* Guides carry real revision dates, so `lastModified` is the date the guide
     was actually last revised — not the build timestamp. */
  const guideRoutes = GUIDES.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    lastModified: new Date(`${g.dateModified}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  const journalRoutes = publishedEntries().map((e) => ({
    url: `${SITE_URL}/journal/${e.slug}`,
    lastModified: new Date(`${e.dateModified}T00:00:00Z`),
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...guideRoutes, ...journalRoutes];
}
