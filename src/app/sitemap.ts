import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/site";

/**
 * XML sitemap, auto-generated from the route table (Strategy 4.3).
 * Only routes marked `built` are included — a sitemap that lists 404s works
 * against the "100% of pages indexed clean" ninety-day target.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ROUTES.filter((r) => r.built && !r.noindex).map((r) => ({
    url: `${SITE_URL}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
