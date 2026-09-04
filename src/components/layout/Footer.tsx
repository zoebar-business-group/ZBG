import Link from "next/link";

import { ORG, OPERATIONS } from "@/lib/org";
import { ROUTES, PRIMARY_CTA, externalHrefFor } from "@/lib/site";
import { Logo } from "./Logo";

/**
 * FOOTER
 * ----------------------------------------------------------------------------
 * Directive 36: the footer communicates credibility. It shows only confirmed
 * legal facts: the legal entity name and the copyright line. TRN and a
 * rendered registered address (Strategy Open Item #10) are held back until
 * confirmed rather than shown as a blank or pending field.
 */

const COLUMNS: Array<{ heading: string; paths: string[] }> = [
  { heading: "Coffee", paths: ["/coffee", "/amaro", "/process", "/quality"] },
  { heading: "Origin", paths: ["/traceability", "/farmers", "/journal", "/guides"] },
  { heading: "Company", paths: ["/about", "/about/founder", "/contact", "/request-quote"] },
];

function label(path: string): string {
  return ROUTES.find((r) => r.path === path)?.label ?? path;
}

/**
 * Lower-cases only the leading character, so a sentence-cased fact can be
 * dropped mid-sentence without flattening the proper nouns inside it.
 * `"Being established in Addis Ababa".toLowerCase()` produced "addis ababa".
 */
function sentenceMerge(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

export function Footer() {
  return (
    <footer className="bg-ink text-alabaster" data-density="story">
      <div className="mx-auto w-full max-w-[96rem] px-6 sm:px-8 lg:px-12">
        {/* Closing CTA, every page leads toward enquiry (Directive 24). */}
        <div className="flex flex-col gap-8 border-b border-[rgba(240,226,203,0.18)] py-16 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[20ch] font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.04] tracking-[-0.015em]">
            Bring origin closer.
          </p>
          <Link
            href={PRIMARY_CTA.href}
            className="inline-flex shrink-0 items-center justify-center rounded-[999px] bg-sand px-7 py-4 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-ink transition-colors duration-[200ms] hover:bg-cream"
          >
            {PRIMARY_CTA.label}
          </Link>
        </div>

        <div className="grid gap-12 py-16 md:grid-cols-12">
          <div className="flex flex-col gap-6 md:col-span-4">
            <Logo onDark />
            <p className="max-w-[34ch] font-sans text-sm leading-relaxed text-[#9db3b0]">
              {ORG.promise}
            </p>
            <p className="max-w-[38ch] font-sans text-sm leading-relaxed text-[#9db3b0]">
              {OPERATIONS.ethiopiaEntity} is {sentenceMerge(OPERATIONS.ethiopiaStatus)}.
              Coffee is processed at an affiliated washing station in{" "}
              {OPERATIONS.washingStationLocation} with direct operational oversight.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:col-span-8"
          >
            {COLUMNS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-4">
                <h2 className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#9db3b0]">
                  {col.heading}
                </h2>
                <ul className="flex flex-col gap-3">
                  {col.paths.map((p) => {
                    const external = externalHrefFor(p);
                    const linkClass =
                      "font-sans text-sm text-[#cfd9d6] transition-colors duration-[200ms] hover:text-sand";
                    return (
                      <li key={p}>
                        {external ? (
                          <a
                            href={external}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={linkClass}
                          >
                            {label(p)}
                          </a>
                        ) : (
                          <Link href={p} className={linkClass}>
                            {label(p)}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Legal, confirmed facts only. TRN and a rendered registered address
            are held back until confirmed rather than shown as a blank field. */}
        <div className="flex flex-col gap-6 border-t border-[rgba(240,226,203,0.18)] py-10 lg:flex-row lg:items-start lg:justify-between">
          <p className="font-sans text-sm text-[#9db3b0]">{ORG.legalName}</p>

          <p className="font-sans text-sm text-[#9db3b0]">
            © {new Date().getFullYear()} {ORG.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
