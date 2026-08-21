"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for every [data-animate] element on the page.
 *
 * Why a single global observer rather than a client component per section:
 * sections stay server-rendered, the client bundle stays near-zero, and the
 * content is complete in the HTML before this ever runs (Strategy 4.3).
 * This only ever toggles an attribute that drives opacity/transform.
 */
export function ScrollReveal() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Reduced motion renders the final state instantly — the CSS already
    // neutralises the transform, but mark everything visible so any
    // descendant selector resolves too.
    const revealAll = () => {
      document
        .querySelectorAll<HTMLElement>("[data-animate], [data-reveal-line]")
        .forEach((el) => el.setAttribute("data-visible", "true"));
    };

    if (reduced.matches) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      },
      // Fire slightly before the element reaches the viewport so the motion
      // reads as the section settling into place, not as a late pop.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    const targets = document.querySelectorAll<HTMLElement>("[data-animate]");
    targets.forEach((el) => observer.observe(el));

    const onChange = () => reduced.matches && revealAll();
    reduced.addEventListener("change", onChange);

    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", onChange);
    };
  }, []);

  return null;
}
