import { ImageResponse } from "next/og";

import { ORG, ORIGIN, altitudeBand } from "@/lib/org";

/**
 * SOCIAL PREVIEW CARD
 * ----------------------------------------------------------------------------
 * The root layout declares `twitter: { card: "summary_large_image" }` and a
 * full openGraph block, but no image existed — so every share of this site
 * rendered a large card with an empty image well. This fills it.
 *
 * Built with ImageResponse, so it is generated once at build time and served
 * as a static PNG. Nothing here is fetched at runtime.
 *
 * TYPEFACE: deliberately the renderer's default sans, not a brand face.
 * Canela is unlicensed (Open Item #3) and Fraunces is only a documented
 * stand-in, so committing either into a cached social card would put a
 * placeholder typeface on every share of the brand. The card carries the brand
 * through colour, geometry and the wordmark's structure instead, exactly as
 * Logo.tsx does while the brand asset files are missing.
 *
 * TRUST RULE: every value here comes from ORG/ORIGIN. There are no
 * specifications, no scores and no claims that are not already verified.
 */

export const alt = `${ORG.name}, Ethiopian green coffee from ${ORIGIN.name}, ${ORIGIN.country}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#011f1b",
          // The story-atmosphere wash, restated. radial-gradient is supported
          // by Satori; the layered declaration in globals.css is not portable,
          // so this is the single dominant wash rather than both radials.
          backgroundImage:
            "radial-gradient(900px 620px at 82% 8%, rgba(46,89,84,0.55), transparent 70%)",
          padding: "72px 80px",
        }}
      >
        {/* Wordmark. "Business Group" is integral to the name and is never
            dropped, Brand Guideline, and rule 6 in BUILD-STATUS.md. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 34,
              letterSpacing: "0.18em",
              color: "#fffaf4",
              display: "flex",
            }}
          >
            ZOEBAR
          </div>
          <div
            style={{
              fontSize: 15,
              letterSpacing: "0.34em",
              color: "#9db3b0",
              marginTop: 10,
              display: "flex",
            }}
          >
            BUSINESS GROUP
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 21,
              letterSpacing: "0.22em",
              color: "#f0e2cb",
              display: "flex",
            }}
          >
            {ORIGIN.name.toUpperCase()} · {ORIGIN.zone.toUpperCase()} ·{" "}
            {ORIGIN.country.toUpperCase()}
          </div>

          <div
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              color: "#fffaf4",
              marginTop: 26,
              maxWidth: 900,
              display: "flex",
            }}
          >
            Ethiopian coffee, closer to origin.
          </div>

          <div
            style={{
              height: 1,
              width: "100%",
              backgroundColor: "rgba(240,226,203,0.34)",
              marginTop: 44,
              display: "flex",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 26,
              fontSize: 22,
              color: "#cfd9d6",
            }}
          >
            <div style={{ display: "flex" }}>
              Washed and natural Arabica · {altitudeBand()} masl
            </div>
            <div style={{ display: "flex", color: "#9db3b0" }}>
              {ORG.url.replace(/^https:\/\//, "")}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
