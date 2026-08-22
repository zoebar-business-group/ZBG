import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/* ============================================================================
   PENDING — the trust rule, made visible
   ----------------------------------------------------------------------------
   Foundation Brief 5: "We would rather say 'we are verifying that information'
   than provide an unsupported claim."

   This is not an error state and must never look like one. A buyer seeing
   "being verified" where a competitor shows a confident invented number is
   the entire trust proposition, rendered. It is designed to look deliberate.
   ========================================================================== */

export function Pending({
  children = "Being verified",
  onDark = false,
  className,
}: {
  children?: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 whitespace-nowrap rounded-[2px] border px-2.5 py-1",
        "font-sans text-[0.625rem] font-medium uppercase tracking-[0.16em]",
        /* Defaults resolve from the surface (see --pending-* in globals.css),
           so a chip on a deep surface adapts without the caller passing
           anything. `onDark` remains an explicit override for a dark panel
           nested inside a light section, where the cascade cannot know. */
        onDark
          ? "border-[rgba(240,226,203,0.28)] text-[#9db3b0]"
          : "border-[var(--pending-border)] text-[var(--pending-fg)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "h-1 w-1 rounded-full",
          onDark ? "bg-sage" : "bg-[var(--pending-dot)]",
        )}
      />
      {children}
    </span>
  );
}

/* ============================================================================
   STAT — oversized numerals (Directive 6)
   ----------------------------------------------------------------------------
   Altitude, harvest window, lot counts. The number carries the weight; the
   label stays quiet beneath it.
   ========================================================================== */

export function Stat({
  value,
  unit,
  label,
  footnote,
  onDark = false,
  size = "base",
  className,
}: {
  value: ReactNode;
  unit?: string;
  label: string;
  footnote?: string;
  onDark?: boolean;
  size?: "base" | "large";
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <p
        data-numeric
        className={clsx(
          "font-display leading-[0.86] tracking-[-0.03em]",
          size === "large"
            ? "text-[clamp(2.75rem,7vw,6.5rem)]"
            : "text-[clamp(2.25rem,4.5vw,4rem)]",
        )}
      >
        {value}
        {unit && (
          <span
            className={clsx(
              "ml-2 align-baseline font-sans text-[0.3em] font-medium uppercase tracking-[0.16em]",
              onDark ? "text-sage" : "text-meta",
            )}
          >
            {unit}
          </span>
        )}
      </p>
      <div className="flex flex-col gap-1">
        <p
          className={clsx(
            "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em]",
            onDark ? "text-[#9db3b0]" : "text-meta",
          )}
        >
          {label}
        </p>
        {footnote && (
          <p
            className={clsx(
              "font-sans text-sm",
              onDark ? "text-[#9db3b0]" : "text-[#5a5f56]",
            )}
          >
            {footnote}
          </p>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   SPEC TABLE — real HTML tables, never images (Strategy 4.3, mandatory)
   ----------------------------------------------------------------------------
   Specification surfaces are a buyer tool, not a marketing layout. Near-sharp
   corners, tight rows, tabular numerals, scrollable on small screens without
   the page ever scrolling horizontally.
   ========================================================================== */

export interface SpecRow {
  label: string;
  /** `null` renders the Pending marker — never a plausible placeholder value. */
  value: ReactNode | null;
  note?: string;
}

export function SpecTable({
  caption,
  rows,
  className,
}: {
  caption: string;
  rows: SpecRow[];
  className?: string;
}) {
  return (
    <div className={clsx("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse text-left">
        <caption className="mb-4 text-left font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-meta">
          {caption}
        </caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-[#e2dbcd] align-top">
              <th
                scope="row"
                className="w-[42%] py-4 pr-6 font-sans text-sm font-medium text-[#5a5f56]"
              >
                {row.label}
              </th>
              <td className="py-4 font-sans text-[0.9375rem] text-ink">
                {row.value === null ? <Pending /> : row.value}
                {row.note && (
                  <span className="mt-1 block text-sm text-meta">{row.note}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
