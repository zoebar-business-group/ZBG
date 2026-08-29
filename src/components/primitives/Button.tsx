import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

/**
 * Button / CTA.
 *
 * Geometry note: the primary action is a squared-off pill with a single
 * hexagon-derived corner cut on hover-capable devices — the badge geometry
 * showing up at the point of commitment, rather than as decoration.
 * Motion is transform/opacity only.
 */

const BASE =
  "group relative inline-flex items-center justify-center gap-3 " +
  "font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] " +
  "px-7 py-4 rounded-[999px] " +
  "transition-[transform,background-color,color,border-color] duration-[200ms] " +
  "ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "active:translate-y-[1px] motion-reduce:active:translate-y-0";

const VARIANTS = {
  /** Primary conversion. Emerald on light, sand on dark. */
  primary:
    "bg-emerald text-alabaster hover:bg-[#043029] " +
    "data-[on-dark=true]:bg-sand data-[on-dark=true]:text-ink " +
    "data-[on-dark=true]:hover:bg-cream",
  secondary:
    "border border-[#c9c0ae] text-ink hover:border-emerald hover:bg-emerald hover:text-alabaster " +
    "data-[on-dark=true]:border-[rgba(240,226,203,0.34)] data-[on-dark=true]:text-alabaster " +
    "data-[on-dark=true]:hover:bg-sand data-[on-dark=true]:hover:text-ink data-[on-dark=true]:hover:border-sand",
  /** Inline text action with a rule that extends on hover. */
  quiet:
    "px-0 py-2 rounded-none text-ink hover:text-emerald-mid " +
    "data-[on-dark=true]:text-alabaster data-[on-dark=true]:hover:text-sand",
} as const;

export function Button({
  href,
  children,
  variant = "primary",
  onDark = false,
  className,
  ariaLabel,
  download = false,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  onDark?: boolean;
  className?: string;
  ariaLabel?: string;
  /** Render a plain `<a download>` (for file endpoints) rather than next/link.
   *  Same visual as any other button. */
  download?: boolean;
}) {
  const external = href.startsWith("http");

  const content = (
    <>
      <span>{children}</span>
      {variant === "quiet" ? (
        <span
          aria-hidden="true"
          className="relative block h-px w-8 overflow-hidden bg-current opacity-40"
        >
          <span className="absolute inset-0 block origin-left scale-x-0 bg-current transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transition-none" />
        </span>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3 w-3 shrink-0 transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          <path
            d="M1 8h13M9 3l5 5-5 5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="square"
          />
        </svg>
      )}
    </>
  );

  const cls = clsx(BASE, VARIANTS[variant], className);

  if (download) {
    return (
      <a href={href} download data-on-dark={onDark} className={cls} aria-label={ariaLabel}>
        {content}
      </a>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        data-on-dark={onDark}
        className={cls}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} data-on-dark={onDark} className={cls} aria-label={ariaLabel}>
      {content}
    </Link>
  );
}
