/**
 * Contrast matrix for the Zoebar palette + replacement search.
 *
 * For every text colour actually used in src/, against every surface it can
 * sit on, compute the WCAG ratio. Where it fails AA for normal text (4.5:1),
 * search for the nearest colour of the SAME HUE AND SATURATION that passes —
 * darkening (or lightening, on deep surfaces) only the lightness, so the
 * design intent survives the fix.
 */

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = ([r, g, b]) =>
  "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
const srgb = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

// --- rgb <-> hsl so we can move lightness while holding hue/saturation ---
const rgb2hsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  const d = mx - mn;
  if (d) {
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
};
const hue2rgb = (p, q, t) => {
  if (t < 0) t += 1; if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
};
const hsl2rgb = ([h, s, l]) => {
  if (!s) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
};

const SURFACES = {
  alabaster: "#fffaf4",
  bone: "#efe9de",
  sand: "#f0e2cb",
  emerald: "#011f1b",
  "emerald-deep": "#04231f",
  ink: "#11120d",
  "emerald-mid": "#2e5954",
};

const TEXT = {
  "#7b8079": "muted (73 uses) — eyebrows, metadata, captions",
  "#a8a294": "faint (27 uses) — separators, indices, 'Optional'",
  "#5a5f56": "text-muted token (57 uses) — body secondary",
  "#3d423a": "lede secondary (12 uses)",
  "#6f7a72": "muted on dark (4 uses)",
  "#9db3b0": "text-inverse-muted token (34 uses)",
  "#cfd9d6": "inverse secondary (16 uses)",
  "#8c3b32": "accent / alert (5 uses)",
};

/** Nearest passing colour along the lightness axis only. */
const fix = (fgHex, bgHexes, need = 4.5) => {
  const [h, s, l0] = rgb2hsl(hex(fgHex));
  const bgs = bgHexes.map(hex);
  const light = lum(bgs[0]) > 0.4; // dark text on light surface -> darken
  for (let step = 0; step <= 1000; step++) {
    const l = light ? l0 - step / 1000 : l0 + step / 1000;
    if (l < 0 || l > 1) break;
    const c = hsl2rgb([h, s, l]);
    if (bgs.every((bg) => ratio(c, bg) >= need)) {
      return { hex: toHex(c), ratios: bgs.map((bg) => Number(ratio(c, bg).toFixed(2))) };
    }
  }
  return null;
};

console.log("CONTRAST MATRIX (text x surface), AA normal text needs 4.5:1\n");
const surfNames = Object.keys(SURFACES);
console.log("".padEnd(11) + surfNames.map((s) => s.slice(0, 11).padStart(13)).join(""));
for (const [t, note] of Object.entries(TEXT)) {
  const row = surfNames.map((s) => {
    const r = ratio(hex(t), hex(SURFACES[s]));
    const mark = r >= 4.5 ? " " : r >= 3 ? "~" : "!";
    return (r.toFixed(2) + mark).padStart(13);
  });
  console.log(t.padEnd(11) + row.join("") + "   " + note);
}

console.log("\n\nREPLACEMENTS (same hue + saturation, lightness moved until AA passes)\n");

const jobs = [
  { fg: "#7b8079", on: ["#efe9de", "#fffaf4"], label: "muted on light surfaces (must clear the DARKER bone too)" },
  { fg: "#a8a294", on: ["#efe9de", "#fffaf4"], label: "faint on light surfaces" },
  { fg: "#5a5f56", on: ["#efe9de", "#fffaf4"], label: "text-muted token on light surfaces" },
  { fg: "#3d423a", on: ["#efe9de", "#fffaf4"], label: "lede secondary on light surfaces" },
  { fg: "#6f7a72", on: ["#011f1b", "#11120d"], label: "muted on deep surfaces" },
  { fg: "#9db3b0", on: ["#011f1b", "#11120d", "#04231f"], label: "inverse-muted on deep surfaces" },
  { fg: "#cfd9d6", on: ["#011f1b", "#11120d", "#04231f"], label: "inverse secondary on deep surfaces" },
  { fg: "#8c3b32", on: ["#fffaf4", "#efe9de"], label: "accent on light surfaces" },
];

for (const j of jobs) {
  const current = j.on.map((b) => Number(ratio(hex(j.fg), hex(b)).toFixed(2)));
  const ok = current.every((r) => r >= 4.5);
  if (ok) {
    console.log(`OK    ${j.fg}  ${current.join(" / ")}  — ${j.label}`);
    continue;
  }
  const f = fix(j.fg, j.on);
  console.log(`FIX   ${j.fg} (${current.join(" / ")})  ->  ${f ? f.hex + "  (" + f.ratios.join(" / ") + ")" : "NO SOLUTION"}`);
  console.log(`        ${j.label}`);
  console.log(`        surfaces: ${j.on.join(", ")}`);
}

// The opacity trap: muted at 70% over alabaster is what axe measured as #a3a59e.
console.log("\n\nOPACITY COMPOUNDING (why `opacity-70` on a muted colour fails)\n");
const blend = (fg, bg, a) => fg.map((c, i) => c * a + bg[i] * (1 - a));
for (const base of ["#7b8079", "#656a63", "#5a5f56"]) {
  for (const a of [1, 0.7, 0.55, 0.4]) {
    const eff = blend(hex(base), hex("#fffaf4"), a);
    console.log(`  ${base} @ ${String(a).padEnd(5)} -> ${toHex(eff)}  ${ratio(eff, hex("#fffaf4")).toFixed(2)}:1 on alabaster`);
  }
  console.log("");
}
