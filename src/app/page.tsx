import type { Metadata } from "next";

import { Hero } from "@/components/home/Hero";
import {
  WhyZoebar,
  Amaro,
  WashingStation,
  CherryToContainer,
  Quality,
  Traceability,
  Farmers,
  AvailableCoffee,
  FromOrigin,
  RequestSection,
} from "@/components/home/sections";
import { ORG } from "@/lib/org";

export const metadata: Metadata = {
  title: "Ethiopian Green Coffee from Amaro",
  description: ORG.description,
  alternates: { canonical: "/" },
};

/**
 * HOMEPAGE
 * ----------------------------------------------------------------------------
 * Story-led (Strategy 0: "The homepage opens with the story, not keywords").
 *
 * Rhythm is deliberate — no two consecutive sections share a height or a
 * surface (Directive 35):
 *   hero        cinematic   emerald
 *   why         base        alabaster   ← contracts hard after the hero
 *   amaro       cinematic   emerald     ← immersive
 *   station     base        alabaster
 *   journey     base        bone        ← technical
 *   quality     base        alabaster   ← technical
 *   trace       loose       ink         ← the heaviest surface, used once
 *   farmers     base        alabaster   ← editorial
 *   coffee      base        bone        ← technical
 *   journal     base        alabaster   ← editorial
 *   request     loose       emerald     ← close
 *
 * Home carries Organization and WebSite schema only (Strategy 5.3); both are
 * emitted once in the root layout from the canonical entity module.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyZoebar />
      <Amaro />
      <WashingStation />
      <CherryToContainer />
      <Quality />
      <Traceability />
      <Farmers />
      <AvailableCoffee />
      {/* <FromOrigin /> */}
      <RequestSection />
    </>
  );
}
