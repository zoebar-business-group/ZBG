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
 * serif with flared stems, set with WONK 0 and SOFT 0 to strip its quirk and
 * sit close to Canela's register. It is NOT the final face. When the licence
 * lands, drop the files into /public/fonts, declare the @font-face, and the
 * `--font-display` stack in globals.css picks Canela up ahead of this — no
 * component changes.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-fallback",
  axes: ["SOFT", "WONK", "opsz"],
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
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
