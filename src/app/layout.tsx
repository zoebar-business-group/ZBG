import type { Metadata, Viewport } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";

import { ORG } from "@/lib/org";
import { SITE_URL } from "@/lib/site";
import { graph, organizationSchema, websiteSchema } from "@/lib/schema";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

/**
 * TYPEFACES
 * ----------------------------------------------------------------------------
 * Primary display: Canela Deck (Brand Guideline). Web licence pending —
 * Strategy Open Item #3. See docs/TYPEFACE.md for the substitution record.
 *
 * Fraunces is the documented stand-in: a warm, moderately-contrasted editorial
 * serif with flared stems, sitting close to Canela's register at its default
 * WONK 0 / SOFT 0. It is NOT the final face. When the licence lands, drop the
 * files into /public/fonts, declare the @font-face, and the `--font-display`
 * stack in globals.css picks Canela up ahead of this — no component changes.
 *
 * AXES: `opsz` only.
 * next/font ships the weight axis alone by default, and every extra axis
 * enlarges the file. SOFT and WONK were previously requested so they could be
 * described as "set to 0" — but nothing in this codebase has ever set
 * font-variation-settings, and 0 is already each axis's default in Fraunces.
 * The two of them cost 118KB of the homepage's 357KB and changed nothing on
 * screen.
 *
 * `opsz` stays: it is the one axis actually exercised here, because browsers
 * apply optical sizing on their own (font-optical-sizing defaults to auto) and
 * the display scale runs to 8.5rem, which is where it earns its weight.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-fallback",
  axes: ["opsz"],
});

/*
 * Weights 300 and 600 were declared and downloaded on every page, and neither
 * appears anywhere in the codebase — there is no `font-light` and no
 * `font-semibold`. Only 400 (default) and 500 (`font-medium`) are used.
 */
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Zoebar Business Group — Ethiopian Green Coffee from Amaro",
    // "Business group" is integral to the wordmark and is never dropped.
    template: "%s — Zoebar Business Group",
  },
  description: ORG.description,
  applicationName: ORG.name,
  alternates: {
    canonical: "/",
    // hreflang scaffolding for en and ar from day one (Strategy 4.3).
    // Arabic routes are not built yet; the scaffolding exists so adding them
    // is a routing change, not an SEO migration.
    languages: {
      en: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: ORG.name,
    title: "Ethiopian Green Coffee from Amaro",
    description: ORG.description,
    url: SITE_URL,
    locale: "en",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#011F1B",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${poppins.variable}`}>
      <head>
        {/* One @graph per page. Organization is the canonical entity that every
            other node references by @id (Strategy 5.3). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: graph(organizationSchema(), websiteSchema()),
          }}
        />
      </head>
      <body className="bg-alabaster text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-[100] focus:rounded-[2px] focus:bg-emerald focus:px-5 focus:py-3 focus:font-sans focus:text-[0.75rem] focus:font-medium focus:uppercase focus:tracking-[0.16em] focus:text-alabaster"
        >
          Skip to content
        </a>

        <Navigation />

        <main id="main">{children}</main>

        <Footer />

        <ScrollReveal />
      </body>
    </html>
  );
}
