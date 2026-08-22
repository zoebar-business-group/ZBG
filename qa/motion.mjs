/**
 * Motion audit — Phase 9.
 *
 * Two specific risks in the current system:
 *
 * 1. [data-reveal-line] spans start at translate3d(0,105%,0) and are only
 *    brought back by a [data-visible="true"] ancestor. ScrollReveal observes
 *    [data-animate] ONLY. Any reveal-line that is not inside a [data-animate]
 *    can never be revealed, and its text sits permanently outside its own
 *    overflow:hidden box — invisible, but still present in innerText, so the
 *    existing QA checks would not catch it.
 *
 * 2. will-change: opacity, transform is held on every not-yet-revealed
 *    element at once. Count them; MDN warns against exactly this.
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3215";
const ROUTES = [
  "/", "/coffee", "/amaro", "/process", "/quality", "/traceability", "/farmers",
  "/journal", "/guides", "/guides/ethiopian-coffee-grading",
  "/guides/harvest-and-shipping-calendar", "/guides/import-documentation-checklist",
  "/guides/incoterms-green-coffee", "/about", "/about/founder", "/contact",
  "/request-quote", "/thank-you?kind=quote",
];

const run = async () => {
  const browser = await chromium.launch();
  let orphanTotal = 0;

  console.log("route".padEnd(42) + "animate  revealLine  orphaned  maxWillChange");
  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });

    const before = await page.evaluate(() => ({
      animate: document.querySelectorAll("[data-animate]").length,
      revealLine: document.querySelectorAll("[data-reveal-line]").length,
      // A reveal-line that has no [data-animate] ancestor AND is not itself
      // [data-animate] can never receive data-visible from the observer.
      orphaned: [...document.querySelectorAll("[data-reveal-line]")]
        .filter((el) => !el.closest("[data-animate]") && !el.hasAttribute("data-animate"))
        .map((el) => (el.innerText || "").trim().slice(0, 50)),
      willChange: [...document.querySelectorAll("*")]
        .filter((el) => {
          const wc = getComputedStyle(el).willChange;
          return wc && wc !== "auto";
        }).length,
    }));

    // Scroll the whole page so everything that CAN reveal, does.
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 55));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1400);

    // After a full scroll, is any reveal-line span still pushed out of frame?
    const stuck = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal-line] > span")]
        .filter((s) => {
          const t = getComputedStyle(s).transform;
          if (!t || t === "none") return false;
          const m = t.match(/matrix.*\((.+)\)/);
          if (!m) return false;
          const parts = m[1].split(", ").map(Number);
          const ty = parts.length === 6 ? parts[5] : parts[13];
          return Math.abs(ty) > 2; // still displaced
        })
        .map((s) => ({
          text: (s.innerText || "").trim().slice(0, 50),
          transform: getComputedStyle(s).transform,
          parentVisible: s.parentElement?.getAttribute("data-visible"),
        }))
    );

    const stillHidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-animate]")]
        .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
        .map((el) => (el.innerText || "").trim().slice(0, 40))
    );

    orphanTotal += before.orphaned.length + stuck.length;
    console.log(
      route.padEnd(42) +
        String(before.animate).padStart(7) +
        String(before.revealLine).padStart(12) +
        String(before.orphaned.length).padStart(10) +
        String(before.willChange).padStart(15)
    );
    if (before.orphaned.length) {
      console.log("      ORPHANED reveal-lines (no [data-animate] ancestor):");
      before.orphaned.forEach((t) => console.log(`         "${t}"`));
    }
    if (stuck.length) {
      console.log("      STUCK after full scroll:");
      stuck.forEach((s) => console.log(`         "${s.text}"  ${s.transform}  parent data-visible=${s.parentVisible}`));
    }
    if (stillHidden.length) {
      console.log("      [data-animate] STILL AT opacity<1 after full scroll:");
      stillHidden.forEach((t) => console.log(`         "${t}"`));
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`\nTotal orphaned / stuck reveal-lines: ${orphanTotal}`);
};
run().catch((e) => { console.error(e); process.exit(2); });
