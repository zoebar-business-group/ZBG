import type { ReactNode } from "react";

import { clsx } from "@/lib/clsx";

/**
 * Interior page header. Sits below the fixed navigation, so it carries its own
 * top padding. Density decides the surface: story pages open deep, spec pages
 * open light and get to the facts faster.
 *
 * NO VISIBLE BREADCRUMB TRAIL. It was removed on the client's instruction. The
 * `Crumb` type and each page's TRAIL constant stay, because they still feed
 * `breadcrumbSchema()` - the BreadcrumbList JSON-LD is invisible to visitors
 * and is what lets Google render the site hierarchy in a result. Removing the
 * markup as well would have cost that for no visual gain.
 */

export interface Crumb {
  name: string;
  path: string;
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  meta,
  aside,
  surface = "light",
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Verified metadata pairs shown as a strip beneath the lede. */
  meta?: Array<{ term: string; detail: ReactNode }>;
  /** Optional panel set beside the title on the right. The title and lede are
   *  held to 16ch and 54ch, so on a wide viewport the right of the header is
   *  empty; this fills it without touching the reading measure. Stacks under
   *  the lede on narrow screens, where there is no room alongside. */
  aside?: ReactNode;
  surface?: "light" | "deep";
  children?: ReactNode;
}) {
  const onDark = surface === "deep";

  return (
    <section
      data-density={onDark ? "story" : "spec"}
      className={clsx(
        "relative",
        onDark ? "story-atmosphere text-alabaster" : "bg-alabaster text-ink",
        onDark ? "pb-24 pt-36 sm:pb-32 sm:pt-44" : "pb-16 pt-32 sm:pb-20 sm:pt-40",
      )}
    >
      <div className="mx-auto w-full max-w-wide px-6 sm:px-8 lg:px-12">
        <div className={clsx(aside ? "lg:grid lg:grid-cols-12 lg:items-start lg:gap-12" : null)}>
          <div className={clsx(aside ? "lg:col-span-7" : null)}>
            <p
              className={clsx(
                "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em]",
                onDark ? "text-sand" : "text-meta",
              )}
            >
              {eyebrow}
            </p>

            <h1
              className={clsx(
                "mt-6 max-w-[16ch] tracking-[-0.02em]",
                onDark
                  ? "text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.96]"
                  : "text-[clamp(2.25rem,5vw,4.5rem)] leading-[1]",
              )}
            >
              {title}
            </h1>

            {lede && (
              <p
                className={clsx(
                  "mt-8 max-w-[54ch] font-sans text-[clamp(1.0625rem,1.4vw,1.3rem)] leading-[1.6]",
                  onDark ? "text-[#cfd9d6]" : "text-[#3d423a]",
                )}
              >
                {lede}
              </p>
            )}
          </div>

          {/* Columns 8-11 of 12: set in from the right edge rather than flush
              to it, so the panel reads as part of the header block. */}
          {aside && (
            <div className="mt-14 max-w-[19rem] lg:col-span-4 lg:col-start-8 lg:mt-0 lg:max-w-none">
              {aside}
            </div>
          )}
        </div>

        {meta && meta.length > 0 && (
          <dl
            className={clsx(
              "mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-4",
              onDark ? "border-[rgba(240,226,203,0.18)]" : "border-[#e2dbcd]",
            )}
          >
            {meta.map((m) => (
              <div key={m.term} className="flex flex-col gap-2">
                <dt
                  className={clsx(
                    "font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em]",
                    onDark ? "text-[#9db3b0]" : "text-meta",
                  )}
                >
                  {m.term}
                </dt>
                <dd
                  data-numeric
                  className={clsx(
                    "font-sans text-[0.9375rem]",
                    onDark ? "text-alabaster" : "text-ink",
                  )}
                >
                  {m.detail}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {children}
      </div>
    </section>
  );
}
