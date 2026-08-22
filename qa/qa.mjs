/**
 * Zoebar QA harness — Phase 8.
 *
 * Rebuilt after the session restart that lost the original (see BUILD-STATUS.md,
 * "Verification harness"). Carries forward every original check and adds the
 * Phase 8 scope: Core Web Vitals and accessibility.
 *
 * Usage:  node qa.mjs [baseURL]
 * Assumes the site is already being served (next start) on that origin.
 */
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3215";
const OUT = new URL("./report", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const ROUTES = [
  "/",
  "/coffee",
  "/amaro",
  "/process",
  "/quality",
  "/traceability",
  "/farmers",
  "/journal",
  "/guides",
  "/guides/ethiopian-coffee-grading",
  "/guides/harvest-and-shipping-calendar",
  "/guides/import-documentation-checklist",
  "/guides/incoterms-green-coffee",
  "/about",
  "/about/founder",
  "/contact",
  "/request-quote",
  "/thank-you?kind=quote",
];

const WIDTHS = [360, 390, 430, 768, 1024, 1280, 1440, 1920];

const results = [];
const fail = (route, check, detail) =>
  results.push({ route, check, detail, ok: false });
const pass = (route, check, detail = "") =>
  results.push({ route, check, detail, ok: true });

/* ------------------------------------------------------------------ *
 * In-page audits. Kept as strings evaluated in the browser so they can
 * use the live DOM + computed styles rather than parsed HTML.
 * ------------------------------------------------------------------ */

const domAudit = () => {
  const out = {};

  // --- structural ---
  out.h1Count = document.querySelectorAll("h1").length;
  out.h1Text = document.querySelector("h1")?.innerText?.trim() ?? null;
  out.lang = document.documentElement.getAttribute("lang");
  out.title = document.title;
  out.metaDescription =
    document.querySelector('meta[name="description"]')?.getAttribute("content") ?? null;
  out.canonical =
    document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
  out.robots =
    document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;

  // --- JSON-LD ---
  out.jsonld = [];
  out.jsonldBroken = [];
  for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const parsed = JSON.parse(s.textContent);
      const nodes = parsed["@graph"] ?? [parsed];
      out.jsonld.push(...nodes.map((n) => n["@type"]).flat());
    } catch (e) {
      out.jsonldBroken.push(String(e.message).slice(0, 120));
    }
  }

  // --- placeholder leakage (the trust rule, mechanically) ---
  const text = document.body.innerText;
  out.leaks = [];
  for (const bad of ["undefined", "NaN", "[object Object]"]) {
    if (text.includes(bad)) out.leaks.push(bad);
  }
  // "null" as a standalone word, not inside a legitimate word like "nullify".
  if (/\bnull\b/.test(text)) out.leaks.push("null");

  // --- accessibility ---
  const a11y = [];

  // Images without alt. (alt="" is valid and intentional for decorative.)
  for (const img of document.querySelectorAll("img")) {
    if (!img.hasAttribute("alt")) {
      a11y.push(`img missing alt: ${img.currentSrc || img.src || "(no src)"}`);
    }
  }

  // SVGs used as images need a label or aria-hidden.
  for (const svg of document.querySelectorAll("svg")) {
    const labelled =
      svg.getAttribute("aria-hidden") === "true" ||
      svg.getAttribute("role") === "presentation" ||
      svg.getAttribute("aria-label") ||
      svg.getAttribute("aria-labelledby") ||
      svg.querySelector("title");
    if (!labelled) a11y.push(`svg without aria-hidden or label`);
  }

  // Form controls need an accessible name.
  for (const el of document.querySelectorAll("input, select, textarea")) {
    if (el.type === "hidden") continue;
    const id = el.id;
    const named =
      (id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) ||
      el.closest("label") ||
      el.getAttribute("aria-label") ||
      el.getAttribute("aria-labelledby") ||
      el.getAttribute("title");
    if (!named) a11y.push(`unlabelled control: ${el.tagName}[name=${el.name || "?"}]`);
  }

  // Links and buttons need discernible text.
  for (const el of document.querySelectorAll("a, button")) {
    const t =
      (el.innerText || "").trim() ||
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      el.querySelector("img")?.getAttribute("alt") ||
      "";
    if (!t) a11y.push(`empty ${el.tagName.toLowerCase()}: ${el.outerHTML.slice(0, 90)}`);
  }

  // Anchors must have an href to be reachable by keyboard.
  for (const a of document.querySelectorAll("a")) {
    if (!a.hasAttribute("href")) a11y.push(`<a> without href`);
  }

  // Heading order must not skip a level.
  const levels = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) =>
    Number(h.tagName[1])
  );
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      a11y.push(`heading skip: h${levels[i - 1]} -> h${levels[i]}`);
    }
  }

  // Landmarks.
  out.landmarks = {
    main: document.querySelectorAll("main").length,
    nav: document.querySelectorAll("nav").length,
    footer: document.querySelectorAll("footer").length,
  };
  if (out.landmarks.main !== 1) a11y.push(`main count = ${out.landmarks.main}`);

  // Tables must have headers (Strategy 4.3 requires real spec tables).
  for (const t of document.querySelectorAll("table")) {
    if (!t.querySelector("th")) a11y.push("table without <th>");
  }

  // Positive tabindex breaks natural focus order.
  for (const el of document.querySelectorAll("[tabindex]")) {
    if (Number(el.getAttribute("tabindex")) > 0) a11y.push("positive tabindex");
  }

  out.a11y = [...new Set(a11y)];

  // --- contrast sampling on text nodes ---
  const srgb = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const bgOf = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const p = parse(bg);
      if (p.length === 3 && !/rgba\(.*,\s*0\)/.test(bg)) return p;
      n = n.parentElement;
    }
    return [255, 255, 255];
  };

  const contrast = [];
  const seen = new Set();
  const els = [...document.querySelectorAll("p,li,a,span,h1,h2,h3,h4,h5,h6,td,th,button,label,figcaption")];
  for (const el of els.slice(0, 600)) {
    const txt = (el.innerText || "").trim();
    if (!txt || el.children.length > 0) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
    const fg = parse(cs.color);
    const bg = bgOf(el);
    if (fg.length !== 3) continue;
    const l1 = lum(fg), l2 = lum(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const size = parseFloat(cs.fontSize);
    const bold = Number(cs.fontWeight) >= 700;
    const large = size >= 24 || (size >= 18.66 && bold);
    const need = large ? 3 : 4.5;
    if (ratio < need) {
      const key = `${cs.color}|${cs.fontSize}|${txt.slice(0, 24)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      contrast.push({
        text: txt.slice(0, 48),
        ratio: Number(ratio.toFixed(2)),
        need,
        color: cs.color,
        size: cs.fontSize,
      });
    }
  }
  out.contrast = contrast.slice(0, 15);

  return out;
};

/* ------------------------------------------------------------------ */

const cwvAudit = () =>
  new Promise((resolve) => {
    const data = { lcp: null, cls: 0, lcpElement: null, longTasks: 0 };
    try {
      new PerformanceObserver((l) => {
        const e = l.getEntries().at(-1);
        if (e) {
          data.lcp = e.startTime;
          data.lcpElement =
            e.element?.tagName +
            (e.element?.className ? "." + String(e.element.className).slice(0, 60) : "");
        }
      }).observe({ type: "largest-contentful-paint", buffered: true });

      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) data.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });

      new PerformanceObserver((l) => {
        data.longTasks += l.getEntries().length;
      }).observe({ type: "longtask", buffered: true });
    } catch {}

    setTimeout(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      data.ttfb = nav?.responseStart ?? null;
      data.domContentLoaded = nav?.domContentLoadedEventEnd ?? null;
      data.transferBytes = performance
        .getEntriesByType("resource")
        .reduce((a, r) => a + (r.transferSize || 0), 0);
      data.resourceCount = performance.getEntriesByType("resource").length;
      resolve(data);
    }, 3500);
  });

/* ------------------------------------------------------------------ */

const run = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  console.log(`\nZoebar QA — ${BASE}\n${"=".repeat(70)}\n`);

  for (const route of ROUTES) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();

    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
    });
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message.slice(0, 200)));

    let resp;
    try {
      resp = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 });
    } catch (e) {
      fail(route, "load", e.message.slice(0, 160));
      await ctx.close();
      continue;
    }

    const status = resp?.status() ?? 0;
    status === 200 ? pass(route, "status", "200") : fail(route, "status", String(status));

    // --- CWV ---
    const cwv = await page.evaluate(cwvAudit);
    const lcpOk = cwv.lcp !== null && cwv.lcp < 2500;
    lcpOk
      ? pass(route, "LCP", `${Math.round(cwv.lcp)}ms`)
      : fail(route, "LCP", `${cwv.lcp === null ? "not measured" : Math.round(cwv.lcp) + "ms"} (budget 2500ms) el=${cwv.lcpElement}`);

    cwv.cls < 0.1
      ? pass(route, "CLS", cwv.cls.toFixed(4))
      : fail(route, "CLS", `${cwv.cls.toFixed(4)} (budget 0.1)`);

    pass(route, "weight", `${(cwv.transferBytes / 1024).toFixed(0)}KB / ${cwv.resourceCount} reqs / TTFB ${Math.round(cwv.ttfb)}ms / longtasks ${cwv.longTasks}`);

    // --- DOM + a11y ---
    const d = await page.evaluate(domAudit);

    d.h1Count === 1 ? pass(route, "h1", d.h1Text?.slice(0, 60)) : fail(route, "h1", `count=${d.h1Count}`);
    d.lang === "en" ? pass(route, "lang") : fail(route, "lang", String(d.lang));
    d.title ? pass(route, "title", d.title.slice(0, 70)) : fail(route, "title", "missing");
    d.metaDescription ? pass(route, "description") : fail(route, "description", "missing");
    d.canonical ? pass(route, "canonical", d.canonical) : fail(route, "canonical", "missing");
    d.jsonldBroken.length === 0
      ? pass(route, "json-ld", d.jsonld.join(", "))
      : fail(route, "json-ld", d.jsonldBroken.join("; "));
    d.leaks.length === 0 ? pass(route, "no-leaks") : fail(route, "no-leaks", d.leaks.join(", "));
    d.a11y.length === 0 ? pass(route, "a11y") : fail(route, "a11y", d.a11y.join(" | "));
    // Contrast is NOT checked here. The hand-rolled version in this file
    // produced false positives it could not distinguish from real failures
    // (ancestor opacity, backdrop-filter behind the fixed nav, and subpixel
    // antialiasing when sampled from pixels). a11y.mjs runs axe-core instead,
    // which resolves stacking properly and reports "incomplete" rather than
    // guessing. Run both; axe owns contrast.

    consoleErrors.length === 0
      ? pass(route, "console")
      : fail(route, "console", consoleErrors.join(" | "));

    // --- overflow sweep ---
    const overflows = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(160);
      const m = await page.evaluate(() => ({
        s: document.documentElement.scrollWidth,
        c: document.documentElement.clientWidth,
      }));
      if (m.s > m.c) overflows.push(`${w}: ${m.s}>${m.c}`);
    }
    overflows.length === 0
      ? pass(route, "overflow")
      : fail(route, "overflow", overflows.join(", "));

    // --- keyboard: skip link must be first and focusable ---
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.keyboard.press("Tab");
    const firstFocus = await page.evaluate(() => {
      const a = document.activeElement;
      const cs = a ? getComputedStyle(a) : null;
      return {
        text: (a?.innerText || "").trim().slice(0, 40),
        href: a?.getAttribute?.("href") ?? null,
        outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth}` : null,
      };
    });
    firstFocus.href === "#main"
      ? pass(route, "skip-link", firstFocus.text)
      : fail(route, "skip-link", `first tab stop = ${firstFocus.text || firstFocus.href || "none"}`);

    // --- screenshot ---
    const name = route.replace(/[/?=]/g, "_") || "_root";
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });

    const bad = results.filter((r) => r.route === route && !r.ok);
    console.log(
      `${bad.length === 0 ? "PASS" : "FAIL"}  ${route.padEnd(42)} ${bad.length === 0 ? "" : bad.length + " issue(s)"}`
    );
    for (const b of bad) console.log(`        ${b.check}: ${b.detail}`);

    await ctx.close();
  }

  // --- reduced motion sanity: content must still be visible ---
  const rm = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const rmPage = await rm.newPage();
  await rmPage.goto(BASE + "/", { waitUntil: "networkidle" });
  const visible = await rmPage.evaluate(() => {
    const els = [...document.querySelectorAll("[data-animate]")];
    const hidden = els.filter((e) => Number(getComputedStyle(e).opacity) === 0);
    return { total: els.length, hidden: hidden.length };
  });
  visible.hidden === 0
    ? pass("/", "reduced-motion", `${visible.total} animated els all visible`)
    : fail("/", "reduced-motion", `${visible.hidden}/${visible.total} stuck at opacity 0`);
  console.log(
    `${visible.hidden === 0 ? "PASS" : "FAIL"}  reduced-motion: ${visible.hidden}/${visible.total} hidden`
  );
  await rm.close();

  // --- no-JS sanity: content must render without scripts ---
  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const nojsPage = await nojs.newPage();
  await nojsPage.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const nojsText = (await nojsPage.evaluate(() => document.body.innerText)).length;
  nojsText > 2000
    ? pass("/", "no-js", `${nojsText} chars render`)
    : fail("/", "no-js", `only ${nojsText} chars render`);
  console.log(`${nojsText > 2000 ? "PASS" : "FAIL"}  no-js: ${nojsText} chars`);
  await nojs.close();

  await browser.close();

  const failures = results.filter((r) => !r.ok);
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));

  console.log(`\n${"=".repeat(70)}`);
  console.log(`${results.length - failures.length} passed, ${failures.length} failed`);
  console.log(`screenshots + results.json -> ${OUT}`);

  if (failures.length) {
    console.log(`\nFAILURES BY CHECK:`);
    const byCheck = {};
    for (const f of failures) (byCheck[f.check] ??= []).push(f.route);
    for (const [k, v] of Object.entries(byCheck)) {
      console.log(`  ${k.padEnd(16)} ${v.length} route(s): ${v.join(", ")}`);
    }
  }
  process.exit(failures.length ? 1 : 0);
};

run().catch((e) => {
  console.error(e);
  process.exit(2);
});
