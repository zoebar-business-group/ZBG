"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { CONTACT_HREF, whatsappMessageFor } from "@/lib/site";
import { clsx } from "@/lib/clsx";

/**
 * CONTACT FAB
 * ----------------------------------------------------------------------------
 * A floating "talk to us" control, bottom right, on every page.
 *
 * Chosen over a second pill in the header (client, 15 September 2026). The
 * header already carries one conversion, Request a Quote, and a second pill
 * beside it would split attention between two buttons that look alike. The
 * header also collapses behind a menu on phones, which is exactly where
 * WhatsApp is used most; a floating control stays one tap away at any scroll
 * depth on any screen.
 *
 * It opens a small panel with two routes: WhatsApp, prefilled with the
 * page-aware message from `site.ts`, and the /contact page.
 *
 * `whatsappNumber` arrives as a prop from the root layout because the number
 * is a server-side value (see WHATSAPP_NUMBER in site.ts). When it is null the
 * WhatsApp row is withheld rather than pointed at a placeholder.
 */
export function ContactFab({ whatsappNumber }: { whatsappNumber: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const digits = whatsappNumber?.replace(/\D/g, "") || null;
  const waHref = digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessageFor(pathname))}`
    : null;

  // Escape closes and hands focus back to the trigger; a press outside closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 flex flex-col items-end sm:bottom-8 sm:right-8"
    >
      {/* --- Panel ---------------------------------------------------------- */}
      <div
        id={panelId}
        role="group"
        aria-label="Contact Zoebar"
        hidden={!open}
        className="fab-panel mb-4 w-[min(20rem,calc(100vw-2.5rem))] origin-bottom-right overflow-hidden rounded-[1.25rem] border border-[rgba(240,226,203,0.14)] bg-emerald text-alabaster shadow-[0_24px_60px_-18px_rgba(1,31,27,0.65)]"
      >
        <div className="story-atmosphere px-6 pb-5 pt-6">
          <p className="font-sans text-[0.625rem] font-medium uppercase tracking-[0.2em] text-sand">
            Talk to the team
          </p>
          <p className="mt-2 font-display text-[1.375rem] leading-[1.15]">
            Questions about the coffee?
          </p>
        </div>

        <ul className="flex flex-col gap-2 bg-alabaster p-3 text-ink">
          {waHref && (
            <li>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="group flex min-h-[64px] items-center gap-4 rounded-[0.875rem] px-3 py-3 transition-colors duration-[200ms] hover:bg-bone focus-visible:bg-bone"
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1f9e58] text-white"
                >
                  <WhatsAppGlyph className="h-[1.375rem] w-[1.375rem]" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="font-sans text-[0.9375rem] font-medium">WhatsApp</span>
                  <span className="font-sans text-[0.8125rem] text-[#5a5f56]">
                    Message us directly
                  </span>
                </span>
                <Arrow className="ml-auto" external />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          )}
          <li>
            <Link
              href={CONTACT_HREF}
              onClick={() => setOpen(false)}
              aria-current={pathname === "/contact" ? "page" : undefined}
              className="group flex min-h-[64px] items-center gap-4 rounded-[0.875rem] px-3 py-3 transition-colors duration-[200ms] hover:bg-bone focus-visible:bg-bone"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald text-sand"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
                </svg>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-sans text-[0.9375rem] font-medium">Contact us</span>
                <span className="font-sans text-[0.8125rem] text-[#5a5f56]">
                  Send the team a question
                </span>
              </span>
              <Arrow className="ml-auto" />
            </Link>
          </li>
        </ul>
      </div>

      {/* --- Trigger -------------------------------------------------------- */}
      <div className="group relative flex items-center">
        {/* Hover label, desktop only. Decorative: the button carries the
            accessible name itself. */}
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-emerald px-4 py-2 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-alabaster shadow-[0_10px_30px_-12px_rgba(1,31,27,0.6)] transition-all duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:block",
            open
              ? "translate-x-2 opacity-0"
              : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
          )}
        >
          Talk to us
        </span>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Close contact options" : "Contact us"}
          className="fab-trigger relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald text-sand shadow-[0_14px_36px_-10px_rgba(1,31,27,0.7)] ring-2 ring-[rgba(240,226,203,0.6)] transition-[transform,background-color] duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05] hover:bg-[#043029] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald motion-reduce:transition-none"
        >
          {/* Chat bubble and close cross, cross-faded. */}
          <svg
            viewBox="0 0 24 24"
            className={clsx(
              "absolute h-6 w-6 transition-all duration-[250ms] motion-reduce:transition-none",
              open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M20 12.5a7.5 7.5 0 0 1-11.1 6.6L4 20l1-4.4A7.5 7.5 0 1 1 20 12.5Z" />
            <path d="M9 11h6M9 14h4" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            className={clsx(
              "absolute h-5 w-5 transition-all duration-[250ms] motion-reduce:transition-none",
              open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 6 18 18" />
            <path d="M18 6 6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function Arrow({ className, external = false }: { className?: string; external?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={clsx(
        "h-4 w-4 shrink-0 text-[#5a5f56] transition-transform duration-[200ms] group-hover:translate-x-0.5 group-hover:text-ink motion-reduce:transition-none",
        external && "group-hover:-translate-y-0.5",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {external ? <path d="M5 11 11 5M6 5h5v5" /> : <path d="M3 8h10M9 4l4 4-4 4" />}
    </svg>
  );
}

/** The WhatsApp mark, so the row is recognisable at a glance. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
