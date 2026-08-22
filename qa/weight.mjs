/**
 * Where does the page weight go?
 *
 * Every route ships ~357KB with no photography on the page yet. That is
 * almost entirely typeface payload, and it is the one real performance lever
 * available before the client's images land.
 */
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3215";

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);

  const res = await page.evaluate(() =>
    performance.getEntriesByType("resource").map((r) => ({
      name: r.name,
      type: r.initiatorType,
      transfer: r.transferSize,
      decoded: r.decodedBodySize,
      dur: Math.round(r.duration),
    }))
  );

  const groups = {};
  for (const r of res) {
    let g = r.type;
    if (/\.woff2?(\?|$)/.test(r.name)) g = "font";
    else if (/\.css(\?|$)/.test(r.name)) g = "css";
    else if (/\.js(\?|$)/.test(r.name)) g = "js";
    (groups[g] ??= { n: 0, transfer: 0, items: [] });
    groups[g].n++;
    groups[g].transfer += r.transfer;
    groups[g].items.push(r);
  }

  console.log("PAGE WEIGHT BY TYPE (/)\n");
  const total = res.reduce((a, r) => a + r.transfer, 0);
  for (const [g, v] of Object.entries(groups).sort((a, b) => b[1].transfer - a[1].transfer)) {
    console.log(`  ${g.padEnd(10)} ${String(v.n).padStart(3)} files  ${(v.transfer / 1024).toFixed(1).padStart(8)} KB   ${((v.transfer / total) * 100).toFixed(0)}%`);
  }
  console.log(`  ${"TOTAL".padEnd(10)} ${String(res.length).padStart(3)} files  ${(total / 1024).toFixed(1).padStart(8)} KB`);

  console.log("\nFONTS (the biggest lever — no photography ships yet):");
  for (const f of (groups.font?.items ?? []).sort((a, b) => b.transfer - a.transfer)) {
    console.log(`  ${(f.transfer / 1024).toFixed(1).padStart(8)} KB  ${f.dur}ms  ${f.name.split("/").pop()}`);
  }

  console.log("\nJS:");
  for (const f of (groups.js?.items ?? []).sort((a, b) => b.transfer - a.transfer).slice(0, 10)) {
    console.log(`  ${(f.transfer / 1024).toFixed(1).padStart(8)} KB  ${f.name.split("/").pop().slice(0, 60)}`);
  }

  console.log("\nCSS:");
  for (const f of (groups.css?.items ?? [])) {
    console.log(`  ${(f.transfer / 1024).toFixed(1).padStart(8)} KB  ${f.name.split("/").pop().slice(0, 60)}`);
  }

  // Which font files does the browser actually USE to paint?
  const used = await page.evaluate(async () => {
    await document.fonts.ready;
    const out = new Set();
    for (const f of document.fonts) if (f.status === "loaded") out.add(`${f.family} ${f.weight} ${f.style}`);
    return [...out];
  });
  console.log("\nFONT FACES THE BROWSER LOADED:");
  used.forEach((u) => console.log("  " + u));

  await browser.close();
};
run().catch((e) => { console.error(e); process.exit(2); });
