import Image from "next/image";
import Link from "next/link";

import { ORIGIN, altitudeBand, harvestWindow } from "@/lib/org";
import { PRIMARY_CTA } from "@/lib/site";

/**
 * HERO
 * ----------------------------------------------------------------------------
 * Directive 7: the homepage opens with the story, not a welcome line. The
 * first screen states WHAT, WHERE and WHY IT MATTERS, and is expensive because
 * of composition rather than effects.
 *
 * Entrance sequence (Directive 8), CSS-driven with staged delays:
 *   0ms    image settles
 *   200ms  origin metadata
 *   380ms  headline line 1
 *   500ms  headline line 2
 *   820ms  supporting line
 *   980ms  actions
 *
 * The altitude rail on the left edge is the site's recurring origin device:
 * elevation drawn as a real vertical axis rather than stated as a number in a
 * card. It reappears on /amaro and on lot pages.
 */

/**
 * Real photograph, once supplied. Strategy Open Item #8 (hard blocker).
 * Needs a WIDE landscape frame of the Koore Zone slopes at altitude, no people
 * in frame — a harvest close-up or the washing station does not read as the
 * establishing shot. Until then, the CSS `.story-atmosphere` gradient stands in.
 */
const HERO_IMAGE: string | undefined = undefined;
const HERO_BRIEF =
  "Amaro landscape at altitude, the coffee-growing slopes of Koore Zone, shot wide, natural light, no people in frame.";

export function Hero() {
  return (
    <section
      data-density="story"
      aria-labelledby="hero-heading"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-emerald text-alabaster"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        {HERO_IMAGE ? (
          <div className="hero-settle absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt={HERO_BRIEF}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="story-atmosphere absolute inset-0" />
        )}
        {/* Legibility scrim, bottom-weighted so the type sits on the darkest
            part of the frame regardless of the photograph supplied. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/45 to-ink/25"
        />
      </div>

      {/* Altitude rail, the origin device: elevation drawn as a real vertical
          axis rather than stated as a number in a card.
          It sits on the RIGHT edge and is bounded to the upper band. The
          headline is bottom-anchored and left-aligned, so this is the one
          region of the frame that stays empty at every breakpoint, on the
          left it collided with the display type. Hidden below lg, where the
          frame is too narrow for a margin device. */}
      <div
        aria-hidden="true"
        data-rail="altitude"
        className="hero-fade pointer-events-none absolute bottom-[34%] right-6 top-[14%] hidden w-px lg:block xl:right-12"
        style={{ ["--animate-delay" as string]: "1200ms" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(240,226,203,0.3)] to-transparent" />
        {[
          { top: "18%", value: ORIGIN.altitudeMax },
          { top: "72%", value: ORIGIN.altitudeMin },
        ].map((mark) => (
          <div
            key={mark.value}
            /* Mirrored: the tick meets the rail, the numeral reads inward. */
            className="absolute right-0 flex -translate-y-1/2 flex-row-reverse items-center gap-3"
            style={{ top: mark.top }}
          >
            <span className="block h-px w-4 bg-[rgba(240,226,203,0.5)]" />
            <span
              data-numeric
              className="whitespace-nowrap font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]"
            >
              {mark.value.toLocaleString("en-US")} m
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      {/* Hero content is bottom-anchored (`justify-end` on the section). A
          moderate extra bottom pad on desktop lifts the whole block off the
          base line, tightening the space above the headline without touching
          the entrance sequence. Kept as fixed spacing-scale steps rather than
          a `vh` value. The section keeps its full 100svh — that height was
          right; only the type and these steps come down, by one step each, so
          the block reads a little tighter inside the same frame. Tune the
          `lg`/`xl` steps if the client wants it higher or lower. */}
      <div className="mx-auto w-full max-w-[96rem] px-6 pb-12 pt-28 sm:px-8 sm:pb-16 lg:px-12 lg:pb-28 xl:pb-32">
        <p
          className="hero-fade font-sans text-[0.6875rem] font-medium uppercase tracking-[0.24em] text-sand"
          style={{ ["--animate-delay" as string]: "200ms" }}
        >
          {ORIGIN.name}
          <span aria-hidden="true" className="mx-2.5 opacity-70">
            ·
          </span>
          {ORIGIN.zone}
          <span aria-hidden="true" className="mx-2.5 opacity-70">
            ·
          </span>
          {ORIGIN.country}
        </p>

        <h1
          id="hero-heading"
          className="mt-6 max-w-[16ch] font-display text-[clamp(2.75rem,7.7vw,7.5rem)] leading-[0.92] tracking-[-0.025em]"
        >
          <span className="hero-line block overflow-hidden">
            <span style={{ ["--animate-delay" as string]: "380ms" }}>
              Ethiopian coffee,
            </span>
          </span>
          <span className="hero-line block ">
            <span style={{ ["--animate-delay" as string]: "500ms" }}>
              closer to origin.
            </span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="hero-fade max-w-[46ch] font-sans text-[clamp(1rem,1.35vw,1.25rem)] leading-[1.6] text-[#cfd9d6]"
            style={{ ["--animate-delay" as string]: "820ms" }}
          >
            Washed and natural Arabica from {ORIGIN.name}, grown at{" "}
            <span data-numeric>{altitudeBand()}</span> metres above sea level and
            processed at an affiliated washing station with Zoebar&rsquo;s direct
            operational oversight.
          </p>

          <div
            className="hero-fade flex flex-wrap items-center gap-4"
            style={{ ["--animate-delay" as string]: "980ms" }}
          >
            <Link
              href={PRIMARY_CTA.href}
              className="inline-flex items-center gap-3 rounded-[999px] bg-sand px-7 py-4 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-[200ms] hover:bg-cream"
            >
              {PRIMARY_CTA.label}
            </Link>
            <Link
              href="/amaro"
              className="group inline-flex items-center gap-3 rounded-[999px] border border-[rgba(240,226,203,0.34)] px-7 py-4 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-alabaster transition-colors duration-[200ms] hover:border-sand hover:bg-sand hover:text-ink"
            >
              Explore {ORIGIN.name}
            </Link>
          </div>
        </div>

        {/* Metadata strip, verified facts, stated plainly at the point of
            first contact. Doubles as the first extractable passage. */}
        <dl
          className="hero-fade mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-[rgba(240,226,203,0.18)] pt-7 sm:grid-cols-4"
          style={{ ["--animate-delay" as string]: "1120ms" }}
        >
          {[
            { term: "Origin", detail: `${ORIGIN.name}, ${ORIGIN.country}` },
            { term: "Altitude", detail: `${altitudeBand()} masl` },
            { term: "Harvest", detail: harvestWindow() },
            { term: "Process", detail: ORIGIN.processing.join(" / ") },
          ].map((item) => (
            <div key={item.term} className="flex flex-col gap-2">
              <dt className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]">
                {item.term}
              </dt>
              <dd
                data-numeric
                className="font-sans text-[0.9375rem] text-alabaster"
              >
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
