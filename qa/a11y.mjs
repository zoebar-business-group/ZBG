/**
 * Accessibility audit — axe-core, the reference implementation.
 *
 * Replaces the hand-rolled contrast maths in qa.mjs. Three earlier attempts to
 * model contrast from the DOM or from rendered pixels each produced their own
 * class of false positive (ancestor opacity, backdrop-filter, and Chrome's
 * subpixel antialiasing fringes respectively). axe-core resolves stacking,
 * opacity and overlap properly and, critically, reports "incomplete" rather
 * than guessing when a background genuinely cannot be determined.
 *
 * Run against a production build. Usage: node a11y.mjs [baseURL]
 */
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3215";
const ROUTES = [
  "/", "/coffee", "/amaro", "/process", "/quality", "/traceability", "/farmers",
  "/journal", "/guides", "/guides/ethiopian-coffee-grading",
  "/guides/harvest-and-shipping-calendar", "/guides/import-documentation-checklist",
  "/guides/incoterms-green-coffee", "/about", "/about/founder", "/contact",
  "/request-quote", "/thank-you?kind=quote",
];

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

const run = async () => {
  const browser = await chromium.launch();
  const report = {};
  let totalViolations = 0;
  let totalIncomplete = 0;

  console.log(`\naxe-core audit — ${BASE}\n${"=".repeat(74)}\n`);

  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    // Scroll to the bottom and back so every scroll-reveal element has settled
    // into its final painted state before axe samples colours.
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(700);

    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();

    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      wcag: v.tags.filter((t) => t.startsWith("wcag")),
      count: v.nodes.length,
      nodes: v.nodes.slice(0, 6).map((n) => ({
        target: n.target.join(" "),
        summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 220),
        html: n.html.slice(0, 150),
      })),
    }));

    const incomplete = results.incomplete.map((v) => ({
      id: v.id,
      count: v.nodes.length,
      nodes: v.nodes.slice(0, 4).map((n) => ({
        target: n.target.join(" "),
        summary: (n.failureSummary || "").replace(/\s+/g, " ").slice(0, 200),
      })),
    }));

    report[route] = { violations, incomplete, passes: results.passes.length };
    totalViolations += violations.reduce((a, v) => a + v.count, 0);
    totalIncomplete += incomplete.reduce((a, v) => a + v.count, 0);

    const vCount = violations.reduce((a, v) => a + v.count, 0);
    console.log(
      `${vCount === 0 ? "PASS" : "FAIL"}  ${route.padEnd(42)} ${vCount} violation(s), ${incomplete.reduce((a, v) => a + v.count, 0)} incomplete, ${results.passes.length} rules passed`
    );
    for (const v of violations) {
      console.log(`      [${v.impact}] ${v.id} (${v.count}) — ${v.help}  ${v.wcag.join(",")}`);
      for (const n of v.nodes) {
        console.log(`          ${n.target}`);
        console.log(`            ${n.summary}`);
      }
    }
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(new URL("./a11y.json", import.meta.url), JSON.stringify(report, null, 2));

  // Roll up by rule so the fix targets a token, not an instance.
  const byRule = {};
  for (const [route, r] of Object.entries(report)) {
    for (const v of r.violations) {
      (byRule[v.id] ??= { impact: v.impact, help: v.help, total: 0, routes: new Set() });
      byRule[v.id].total += v.count;
      byRule[v.id].routes.add(route);
    }
  }
  console.log(`\n${"=".repeat(74)}`);
  console.log(`TOTAL: ${totalViolations} violations, ${totalIncomplete} incomplete\n`);
  if (Object.keys(byRule).length) {
    console.log("BY RULE:");
    for (const [id, v] of Object.entries(byRule).sort((a, b) => b[1].total - a[1].total)) {
      console.log(`  [${v.impact}] ${id.padEnd(26)} ${String(v.total).padStart(4)} node(s) across ${v.routes.size} route(s)`);
      console.log(`      ${v.help}`);
    }
  }
  const incompleteRules = {};
  for (const r of Object.values(report))
    for (const i of r.incomplete) incompleteRules[i.id] = (incompleteRules[i.id] || 0) + i.count;
  if (Object.keys(incompleteRules).length) {
    console.log("\nINCOMPLETE (needs a human decision):");
    for (const [id, n] of Object.entries(incompleteRules)) console.log(`  ${id.padEnd(26)} ${n}`);
  }
  process.exit(totalViolations ? 1 : 0);
};

run().catch((e) => { console.error(e); process.exit(2); });
