import { clsx } from "@/lib/clsx";

/**
 * LOGO
 * ----------------------------------------------------------------------------
 * The supplied logo is composed of the Badge and the Wordmark. The Brand
 * Guideline is explicit on three points, all binding:
 *   - "Business group" is an integral part of the brand name; removal in any
 *     context is strictly prohibited.
 *   - Proportions may not be altered.
 *   - It must only be used in its original form as provided in the brand
 *     asset files.
 *
 * No brand asset files have been supplied yet — the guideline references a
 * "CPE brand assets folder" that is not in this repository. The badge is
 * therefore NOT redrawn or approximated here: inventing a mark would breach
 * the guideline more seriously than omitting one.
 *
 * Until the official SVG arrives at /public/brand/zoebar-wordmark.svg, this
 * renders the wordmark typographically with the full, unabridged name and the
 * guideline's letterspacing. Drop the asset in and swap the branch below.
 */

export function Logo({
  onDark = false,
  className,
}: {
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx("inline-flex flex-col leading-none", className)}
      aria-hidden="true"
    >
      <span
        className={clsx(
          "font-display text-[1.0625rem] tracking-[0.16em] sm:text-[1.125rem]",
          onDark ? "text-alabaster" : "text-ink",
        )}
      >
        ZOEBAR
      </span>
      {/* Never remove — integral to the brand name, not a descriptor. */}
      <span
        className={clsx(
          "mt-[0.3em] font-sans text-[0.5rem] font-medium uppercase tracking-[0.34em] sm:text-[0.5625rem]",
          onDark ? "text-[#9db3b0]" : "text-meta",
        )}
      >
        Business Group
      </span>
    </span>
  );
}
