/**
 * The story-atmosphere gradient, rendered in isolation.
 *
 * Sampling it from a live page kept catching the sand and alabaster buttons
 * that sit inside the hero. Render the exact declaration on a blank page
 * instead and measure the lightest pixel it can produce, across the viewport
 * sizes the site supports — the radials are sized in rem, so how much they
 * overlap changes with the viewport.
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";

const srgb = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

const HTML = `<!doctype html><html><head><style>
html,body{margin:0;padding:0}
.s{width:100vw;height:100vh;
  background-color:#011f1b;
  background-image:
    radial-gradient(62rem 40rem at 78% 12%, rgba(240,226,203,0.09), transparent 62%),
    radial-gradient(50rem 38rem at 8% 88%, rgba(46,89,84,0.42), transparent 66%);
}
</style></head><body><div class="s"></div></body></html>`;

const SIZES = [[360, 740], [390, 844], [430, 932], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080], [2560, 1440]];

const run = async () => {
  const browser = await chromium.launch();
  let best = 0, bestPx = null, bestAt = "";
  for (const [w, h] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.setContent(HTML);
    await page.waitForTimeout(120);
    const png = PNG.sync.read(await page.screenshot({ type: "png" }));
    let max = 0, px = null;
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const i = (png.width * y + x) << 2;
        const L = lum(png.data[i], png.data[i + 1], png.data[i + 2]);
        if (L > max) { max = L; px = [png.data[i], png.data[i + 1], png.data[i + 2]]; }
      }
    }
    console.log(`${String(w).padStart(5)}x${String(h).padEnd(6)} lightest rgb(${px.join(",")})  L=${max.toFixed(5)}`);
    if (max > best) { best = max; bestPx = px; bestAt = `${w}x${h}`; }
    await ctx.close();
  }
  await browser.close();

  console.log(`\nLIGHTEST the story surface can ever be: rgb(${bestPx.join(",")}) at ${bestAt}\n`);
  // Keep this list in step with the deep-surface colours in globals.css.
  // #879389 is listed on purpose as a REGRESSION GUARD, not as a live token:
  // it is the value that was chosen against flat emerald (#011f1b), where it
  // measures a comfortable 5.41:1, and it is exactly the kind of value that
  // looks safe until it meets the wash. It must keep failing here.
  const texts = {
    "alabaster #fffaf4": "#fffaf4",
    "sand #f0e2cb": "#f0e2cb",
    "inverse-muted #9db3b0": "#9db3b0",
    "inverse-2nd #cfd9d6": "#cfd9d6",
    "meta-inverse #96a299": "#96a299",
    "sage #87a4a1 (decorative)": "#87a4a1",
    "[guard] rejected #879389": "#879389",
  };
  for (const [n, c] of Object.entries(texts)) {
    const r = ratio(lum(...hex(c)), best);
    console.log(`  ${n.padEnd(24)} ${r.toFixed(2)}:1  ${r >= 4.5 ? "PASS" : "FAIL"}`);
  }
};
run().catch((e) => { console.error(e); process.exit(2); });
