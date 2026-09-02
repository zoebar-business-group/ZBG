"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { NAV_ITEMS, PRIMARY_CTA, hasDarkHeader, navLabelFor } from "@/lib/site";
import { clsx } from "@/lib/clsx";
import { Logo } from "./Logo";

/**
 * NAVIGATION
 * ----------------------------------------------------------------------------
 * Directive 23: the navigation stays visually quiet while the page content
 * carries the emotion. No mega-menu, no hamburger choreography.
 *
 * It begins transparent over the hero and resolves to a solid alabaster bar
 * once scrolled — the only state change, and it communicates position rather
 * than decorating.
 */
export function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Every page that opens on a deep surface — the homepage hero and the
  // story-density page headers — starts with an inverted bar. Driven by the
  // route table so a new deep-header page cannot be added without deciding
  // this, rather than being hard-coded to "/".
  const overHero = hasDarkHeader(pathname) && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The sheet closes on navigation intent (the link press below) rather than
  // in an effect reacting to `pathname` — no cascading render.

  // Lock scroll behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      data-density={overHero ? "story" : "spec"}
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        scrolled || open
          ? "border-b border-[#e2dbcd] bg-alabaster/92 backdrop-blur-[6px]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav
        aria-label="Primary"
        /* More vertical room than the original py-4, which sat the bar tight
           against the top edge. The extra padding both opens the bar up and
           carries its contents further down the frame. */
        className="mx-auto flex w-full max-w-[96rem] items-center justify-between px-6 py-7 sm:px-8 sm:py-8 lg:px-12"
      >
        <Link
          href="/"
          className="shrink-0"
          aria-label="Zoebar Business Group, home"
        >
          <Logo onDark={overHero} />
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.path || pathname.startsWith(`${item.path}/`);
            const linkClass = clsx(
              "group relative block py-1 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] transition-colors duration-[200ms]",
              overHero
                ? "text-[#cfd9d6] hover:text-alabaster"
                : "text-[#5a5f56] hover:text-ink",
              active && (overHero ? "text-alabaster" : "text-ink"),
            );
            const inner = (
              <>
                {navLabelFor(item)}
                <span
                  aria-hidden="true"
                  className={clsx(
                    "absolute -bottom-0.5 left-0 block h-px w-full origin-left bg-current transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </>
            );
            return (
              <li key={item.path}>
                {item.externalHref ? (
                  <a
                    href={item.externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link
                    href={item.path}
                    aria-current={active ? "page" : undefined}
                    className={linkClass}
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
          <li>
            <Link
              href={PRIMARY_CTA.href}
              className={clsx(
                "inline-flex items-center rounded-[999px] px-5 py-2.5 font-sans text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-colors duration-[200ms]",
                overHero
                  ? "bg-sand text-ink hover:bg-cream"
                  : "bg-emerald text-alabaster hover:bg-[#043029]",
              )}
            >
              {PRIMARY_CTA.label}
            </Link>
          </li>
        </ul>

        {/* Mobile trigger. An icon rather than the words "Menu"/"Close", so the
            accessible name now comes from aria-label - without it the control
            would be unnamed to a screen reader. Two quiet rules and a cross,
            drawn with currentColor so the bar's light/dark state carries. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className={clsx(
            "-mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-2 lg:hidden",
            open || scrolled ? "text-ink" : overHero ? "text-alabaster" : "text-ink",
          )}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            {open ? (
              <>
                <path d="M5 5 19 19" />
                <path d="M19 5 5 19" />
              </>
            ) : (
              <>
                <path d="M3 8h18" />
                <path d="M3 16h18" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile sheet, large tap targets, clear hierarchy, prominent CTA. */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t border-[#e2dbcd] bg-alabaster lg:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[96rem] flex-col px-6 py-2 sm:px-8">
            {NAV_ITEMS.map((item) => {
              const mobileClass =
                "flex min-h-[56px] items-center font-display text-[1.375rem] text-ink";
              return (
                <li key={item.path} className="border-b border-[#efe9de] last:border-0">
                  {item.externalHref ? (
                    <a
                      href={item.externalHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={mobileClass}
                    >
                      {navLabelFor(item)}
                    </a>
                  ) : (
                    <Link
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className={mobileClass}
                    >
                      {navLabelFor(item)}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="mx-auto w-full max-w-[96rem] px-6 pb-8 pt-4 sm:px-8">
            <Link
              href={PRIMARY_CTA.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[56px] w-full items-center justify-center rounded-[999px] bg-emerald px-6 font-sans text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-alabaster"
            >
              {PRIMARY_CTA.label}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
