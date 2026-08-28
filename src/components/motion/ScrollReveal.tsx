"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * One IntersectionObserver for every [data-animate] element on the page.
 *
 * Why a single global observer rather than a client component per section:
 * sections stay server-rendered, the client bundle stays near-zero, and the
 * content is complete in the HTML before this ever runs (Strategy 4.3).
 * This only ever toggles an attribute that drives opacity/transform.
 *
 * WHY THIS RE-RUNS ON `pathname`
 * -----------------------------------------------------------------------------
 * This component is mounted in the root layout, and the App Router does not
 * remount the root layout on a client-side navigation. With an empty dependency
 * array the effect ran exactly once per full page load, so every section on
 * every subsequently-navigated page was never observed and stayed pinned at
 * `opacity: 0` by the `[data-animate]` rule in globals.css. Section headings sit
 * outside the animated wrapper, which is why those pages rendered as a heading
 * above blank space, and why a second refresh "fixed" it: a refresh remounts the
 * layout and re-runs the effect.
 *
 * Keying the effect to `usePathname()` re-observes the new page's elements on
 * every navigation. The MutationObserver below covers the second half of the
 * same problem: nodes that arrive after the effect has run (streamed or
 * suspended content) were never in the initial querySelectorAll result.
 */
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const SELECTOR = "[data-animate], [data-reveal-line]";

    const reveal = (el: Element) => el.setAttribute("data-visible", "true");

    const revealAll = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach(reveal);
    };

    // No IntersectionObserver (very old browser, some embedded webviews) must
    // never mean invisible content. Show everything and stop.
    if (typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Reduced motion renders the final state instantly. The CSS already
    // neutralises the transform, but mark everything visible so any
    // descendant selector resolves too.
    if (reduced.matches) {
      revealAll();
      return;
    }

    /** Everything observed and not yet revealed. Drives the sweep below. */
    const pending = new Set<Element>();

    const settle = (el: Element) => {
      reveal(el);
      pending.delete(el);
      observer.unobserve(el);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          settle(entry.target);
        }
      },
      // Fire slightly before the element reaches the viewport so the motion
      // reads as the section settling into place, not as a late pop.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    /**
     * Observe [data-reveal-line] as well as [data-animate].
     *
     * A reveal-line's span starts at translate3d(0,105%,0) inside an
     * overflow:hidden box, and the CSS only brings it back when a
     * [data-visible="true"] ancestor, or the line itself, says so. Observing
     * [data-animate] alone meant a reveal-line only worked when it happened to
     * sit inside one. Observing both makes the mechanism self-sufficient.
     */
    const observe = (root: ParentNode) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        // Already revealed on a previous pass. Re-observing would be a no-op
        // that still costs an entry callback.
        if (el.getAttribute("data-visible") === "true") return;
        pending.add(el);
        observer.observe(el);
      });
    };

    observe(document);

    /**
     * THE SAFETY SWEEP - why an IntersectionObserver is not enough on its own.
     *
     * An observer only delivers an entry when the intersection state CHANGES
     * across a threshold, and it evaluates at rendering steps. On a fast scroll
     * (a trackpad flick, a mobile fling, an anchor jump) a section can travel
     * from below the viewport to above it between two sampled frames. Its state
     * reads "not intersecting" both times, nothing crosses the threshold, and
     * the callback never runs at all - so the section stays at `opacity: 0`
     * with the reader looking straight at it. This was reproducible: the three
     * commitment cards on /about never received `data-visible` under a
     * 500px/55ms scroll.
     *
     * The sweep makes revealing deterministic. It is rAF-throttled, only walks
     * elements still pending, and unhooks itself the moment the last one is
     * revealed, so a fully-revealed page carries no scroll listener.
     */
    const REVEAL_LINE = 0.88; // Matches the -12% bottom rootMargin above.
    let frame = 0;

    const sweep = () => {
      frame = 0;
      if (pending.size === 0) {
        detach();
        return;
      }
      const limit = window.innerHeight * REVEAL_LINE;
      for (const el of [...pending]) {
        if (el.getBoundingClientRect().top < limit) settle(el);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sweep);
    };

    const detach = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Catch elements added after this effect ran. Without this, anything
    // streamed in late keeps the hidden state with nothing left to reveal it.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (
            node.matches(SELECTOR) &&
            node.getAttribute("data-visible") !== "true"
          ) {
            pending.add(node);
            observer.observe(node);
          }
          observe(node);
          // A node added below the fold needs the sweep re-armed, or it waits
          // for a scroll event that may never come on a short page.
          onScroll();
        }
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    const onChange = () => reduced.matches && revealAll();
    reduced.addEventListener("change", onChange);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      detach();
      observer.disconnect();
      mutations.disconnect();
      reduced.removeEventListener("change", onChange);
    };
  }, [pathname]);

  return null;
}
