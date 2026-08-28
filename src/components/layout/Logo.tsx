import { clsx } from "@/lib/clsx";
import { ZoebarSymbol } from "@/components/brand/ZoebarSymbol";

/**
 * LOGO
 * ----------------------------------------------------------------------------
 * The supplied logo is composed of the Symbol and the Wordmark. The Brand
 * Guideline is explicit on three points, all binding:
 *   - "Business group" is an integral part of the brand name; removal in any
 *     context is strictly prohibited.
 *   - Proportions may not be altered.
 *   - It must only be used in its original form as provided in the brand
 *     asset files.
 *
 * THE SYMBOL is now supplied, in two variants that differ only in fill:
 *   Logo-Zoebar-Symbol-separate-dark-background.svg   -> #F0E2CB (on deep)
 *   Logo-Zoebar-Symbol-separate-white-background.svg  -> #013A33 (on light)
 * The path below is those files' path verbatim, at their original 117x102
 * viewBox, so proportions are preserved and only the fill switches. Inlining
 * rather than loading two .svg files keeps the mark from flashing in late on
 * the first paint, which is the same class of defect as the blank sections.
 *
 * THE WORDMARK is still typographic. No wordmark asset has been supplied, and
 * inventing one would breach the guideline more seriously than setting the full
 * name in the display face. Drop a real wordmark at
 * /public/brand/zoebar-wordmark.svg and swap the second half of this component.
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
      className={clsx("inline-flex items-center gap-2.5 sm:gap-3", className)}
      aria-hidden="true"
    >
      {/* Symbol sits left of the name, on desktop and mobile alike. Height is
          tied to the wordmark block so the pair stays optically balanced; the
          117:102 ratio is preserved by width:auto. */}
      <ZoebarSymbol
        onDark={onDark}
        className="h-[1.75rem] w-auto shrink-0 sm:h-[1.9375rem]"
      />

      <span className="inline-flex flex-col leading-none">
        <span
          className={clsx(
            "font-display text-[1.0625rem] tracking-[0.16em] sm:text-[1.125rem]",
            onDark ? "text-alabaster" : "text-ink",
          )}
        >
          ZOEBAR
        </span>
        {/* Never remove - integral to the brand name, not a descriptor. */}
        <span
          className={clsx(
            "mt-[0.3em] font-sans text-[0.5rem] font-medium uppercase tracking-[0.34em] sm:text-[0.5625rem]",
            onDark ? "text-[#9db3b0]" : "text-meta",
          )}
        >
          Business Group
        </span>
      </span>
    </span>
  );
}
