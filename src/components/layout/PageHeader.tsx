import Link from "next/link";
import type { ReactNode } from "react";

import { clsx } from "@/lib/clsx";

/**
 * Interior page header. Sits below the fixed navigation, so it carries its own
 * top padding. Density decides the surface: story pages open deep, spec pages
 * open light and get to the facts faster.
 */

export interface Crumb {
  name: string;
  path: string;
}

export function Breadcrumbs({
  trail,
  onDark = false,
}: {
  trail: ReadonlyArray<Crumb>;
  onDark?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span
                  aria-current="page"
                  className={clsx(
                    "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em]",
                    onDark ? "text-[#9db3b0]" : "text-meta",
                  )}
                >
                  {c.name}
                </span>
              ) : (
                <Link
                  href={c.path}
                  className={clsx(
                    "font-sans text-[0.6875rem] font-medium uppercase tracking-[0.18em] underline-offset-4 hover:underline",
                    onDark ? "text-sand" : "text-[#5a5f56]",
                  )}
                >
                  {c.name}
                </Link>
              )}
              {!last && (
                <span
                  aria-hidden="true"
                  className={clsx(
                    "text-[0.6875rem]",
                    onDark ? "text-meta-inverse" : "text-faint",
                  )}
                >
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
  trail,
  meta,
  surface = "light",
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  trail: ReadonlyArray<Crumb>;
  /** Verified metadata pairs shown as a strip beneath the lede. */
  meta?: Array<{ term: string; detail: ReactNode }>;
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
        <Breadcrumbs trail={trail} onDark={onDark} />

        <p
          className={clsx(
            "mt-10 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em]",
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
