import type { ReactNode, ElementType } from "react";
import { clsx } from "@/lib/clsx";
import type { Density } from "@/lib/site";

/* ============================================================================
   CONTAINER
   ========================================================================== */

/* Backed by the `--container-*` tokens in globals.css. */
const WIDTHS = {
  narrow: "max-w-narrow", // long-form reading measure
  text: "max-w-text",
  wide: "max-w-wide",
  page: "max-w-page",
} as const;

export function Container({
  children,
  width = "wide",
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
  as?: ElementType;
}) {
  return (
    <Tag className={clsx("mx-auto w-full px-6 sm:px-8 lg:px-12", WIDTHS[width], className)}>
      {children}
    </Tag>
  );
}

/* ============================================================================
   SECTION
   ----------------------------------------------------------------------------
   Density drives spacing and surface, not a different design language
   (Strategy 3.1). Story sections breathe; spec sections stack tight.
   ========================================================================== */

const SURFACES = {
  /** Alabaster — the site base. */
  light: "bg-alabaster text-ink",
  /** Warm neutral break, for rhythm between two light sections. */
  bone: "bg-bone text-ink",
  /** Deep emerald with atmospheric wash — story surfaces. */
  deep: "story-atmosphere text-alabaster",
  /** Earth black — the heaviest surface, used once or twice per page. */
  ink: "bg-ink text-alabaster",
} as const;

/** Vertical rhythm. Sections deliberately differ in height (Directive 35). */
const RHYTHM = {
  tight: "py-14 sm:py-16",
  base: "py-20 sm:py-28",
  loose: "py-28 sm:py-36 lg:py-44",
  cinematic: "py-32 sm:py-44 lg:py-56",
} as const;

export function Section({
  children,
  surface = "light",
  rhythm = "base",
  density = "story",
  className,
  id,
  as: Tag = "section",
  "aria-labelledby": labelledBy,
}: {
  children: ReactNode;
  surface?: keyof typeof SURFACES;
  rhythm?: keyof typeof RHYTHM;
  density?: Density;
  className?: string;
  id?: string;
  as?: ElementType;
  "aria-labelledby"?: string;
}) {
  return (
    <Tag
      id={id}
      data-density={density}
      aria-labelledby={labelledBy}
      className={clsx("relative", SURFACES[surface], RHYTHM[rhythm], className)}
    >
      {children}
    </Tag>
  );
}

/* ============================================================================
   EYEBROW — small uppercase metadata (Directive 5)
   ========================================================================== */

export function Eyebrow({
  children,
  className,
  index,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  /** Chapter index, e.g. "01". Renders as `01 — ORIGIN`. */
  index?: string;
  as?: ElementType;
}) {
  return (
    <Tag
      className={clsx(
        "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em]",
        className,
      )}
    >
      {index && (
        <>
          <span data-numeric className="tabular-nums opacity-70">
            {index}
          </span>
          <span aria-hidden="true" className="mx-2 opacity-40">
            —
          </span>
        </>
      )}
      {children}
    </Tag>
  );
}

/* ============================================================================
   RULE — hairline divider, the connective tissue of the layout
   ========================================================================== */

export function Rule({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <hr
      className={clsx(
        "border-0 border-t",
        inverse ? "border-t-[rgba(240,226,203,0.18)]" : "border-t-[#e2dbcd]",
        className,
      )}
    />
  );
}
