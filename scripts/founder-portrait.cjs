/**
 * FOUNDER PORTRAIT — studio grey out, site cream in.
 * ----------------------------------------------------------------------------
 * The supplied headshot (`docs/founder eden.jpeg`) sits on a cool studio grey
 * and is cropped close to the shoulders. The client asked for a soft cream /
 * warm neutral ground matching the site palette, and for a little breathing
 * room around the shoulders.
 *
 * This script is the record of how `public/founder-eden.jpg` was produced, so
 * a re-supplied photograph can be treated the same way rather than by hand:
 *
 *   node scripts/founder-portrait.cjs "docs/founder eden.jpeg" public/founder-eden.jpg
 *
 * It does not retouch the person. It replaces the ground behind them and
 * enlarges the canvas; the subject's own pixels are untouched.
 */

const sharp = require("sharp");
const path = require("path");

const SRC = process.argv[2] ?? "docs/founder eden.jpeg";
const OUT = process.argv[3] ?? "public/founder-eden.jpg";

/* Sides and top only. Padding the foot would leave the torso — which the
   original already cuts at the frame edge — floating above the bottom of the
   picture. 1024x1280 + these pads lands on exactly 4:5, which is the slot
   ratio on /about and /about/founder, so nothing is cropped back off. */
const PAD_SIDE = 80;
const PAD_TOP = 200;

/* Warm neutral from the site palette: alabaster #fffaf4 → bone #efe9de →
   sand #f0e2cb. Never the cool grey it replaces. */
const STOPS = [
  [0.0, [251, 246, 236]],
  [0.55, [242, 234, 219]],
  [1.0, [231, 221, 202]],
];

function gradientAt(u) {
  for (let i = 1; i < STOPS.length; i++) {
    if (u <= STOPS[i][0]) {
      const [p0, c0] = STOPS[i - 1];
      const [p1, c1] = STOPS[i];
      const t = (u - p0) / (p1 - p0);
      return [0, 1, 2].map((k) => c0[k] + (c1[k] - c0[k]) * t);
    }
  }
  return STOPS[STOPS.length - 1][1];
}

(async () => {
  const base = sharp(SRC).removeAlpha();
  const { data: raw, info } = await base.raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const C = info.channels;
  const N = W * H;

  /* ---- 1. Flood-fill the studio ground ----------------------------------
     Seeded from the top edge and the upper half of the side edges only: the
     white top reaches the bottom edge of the frame, and a seed down there
     would leak the fill straight into the subject. Each step compares a pixel
     to its neighbour rather than to a fixed colour, so the fill follows the
     studio's own gradient without a tolerance wide enough to eat the hair. */
  const isGroundTone = (i) => {
    const r = raw[i * C], g = raw[i * C + 1], b = raw[i * C + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mx - mn <= 26 && (r + g + b) / 3 >= 112;
  };

  const ground = new Uint8Array(N);
  const queue = new Int32Array(N);
  let head = 0, tail = 0;
  const seed = (x, y) => {
    const i = y * W + x;
    if (!ground[i] && isGroundTone(i)) { ground[i] = 1; queue[tail++] = i; }
  };
  for (let x = 0; x < W; x++) seed(x, 0);
  for (let y = 0; y < Math.floor(H * 0.55); y++) { seed(0, y); seed(W - 1, y); }

  while (head < tail) {
    const i = queue[head++];
    const x = i % W, y = (i / W) | 0;
    const r0 = raw[i * C], g0 = raw[i * C + 1], b0 = raw[i * C + 2];
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const j = ny * W + nx;
      if (ground[j] || !isGroundTone(j)) continue;
      const d = Math.abs(raw[j * C] - r0) + Math.abs(raw[j * C + 1] - g0) +
                Math.abs(raw[j * C + 2] - b0);
      if (d > 30) continue;
      ground[j] = 1; queue[tail++] = j;
    }
  }

  let covered = 0;
  for (let i = 0; i < N; i++) covered += ground[i];
  console.log(`ground mask: ${((100 * covered) / N).toFixed(1)}% of the frame`);

  /* ---- 2. Grow the mask 2px into the subject ----------------------------
     The last two pixels of any hair edge are part grey. Left in, they read as
     a cool halo once the ground behind them is cream. */
  let grown = ground;
  for (let pass = 0; pass < 2; pass++) {
    const next = Uint8Array.from(grown);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (grown[i]) continue;
        if ((x > 0 && grown[i - 1]) || (x < W - 1 && grown[i + 1]) ||
            (y > 0 && grown[i - W]) || (y < H - 1 && grown[i + W])) next[i] = 1;
      }
    }
    grown = next;
  }

  /* ---- 3. Feather, so the cut is not a stencil --------------------------
     NOTE: sharp promotes a 1-channel raw input to 3 channels on blur, so the
     result is read back at its reported stride, not assumed to be 1. */
  const hard = Buffer.alloc(N);
  for (let i = 0; i < N; i++) hard[i] = grown[i] ? 0 : 255;
  const soft = await sharp(hard, { raw: { width: W, height: H, channels: 1 } })
    .blur(1.1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const sc = soft.info.channels;

  const subject = Buffer.alloc(N * 4);
  for (let i = 0; i < N; i++) {
    subject[i * 4] = raw[i * C];
    subject[i * 4 + 1] = raw[i * C + 1];
    subject[i * 4 + 2] = raw[i * C + 2];
    subject[i * 4 + 3] = soft.data[i * sc];
  }

  /* ---- 4. Cream ground, drawn across the whole padded canvas ------------ */
  const FW = W + 2 * PAD_SIDE;
  const FH = H + PAD_TOP;
  const canvas = Buffer.alloc(FW * FH * 3);
  for (let y = 0; y < FH; y++) {
    for (let x = 0; x < FW; x++) {
      const u = 0.34 * (x / FW) + 0.66 * (y / FH);
      const c = gradientAt(Math.min(1, Math.max(0, u)));
      /* A soft lift off the upper left, so the ground has depth rather than
         reading as a flat fill behind the shoulders. */
      const dx = x / FW - 0.24;
      const dy = y / FH - 0.1;
      const lift = 7 * Math.exp(-(dx * dx + dy * dy) / 0.16);
      const o = (y * FW + x) * 3;
      canvas[o] = Math.min(255, Math.round(c[0] + lift));
      canvas[o + 1] = Math.min(255, Math.round(c[1] + lift));
      canvas[o + 2] = Math.min(255, Math.round(c[2] + lift));
    }
  }

  await sharp(canvas, { raw: { width: FW, height: FH, channels: 3 } })
    .composite([
      {
        input: subject,
        raw: { width: W, height: H, channels: 4 },
        left: PAD_SIDE,
        top: PAD_TOP,
      },
    ])
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(OUT);

  const m = await sharp(OUT).metadata();
  console.log(
    `wrote ${path.basename(OUT)} ${m.width}x${m.height}, ratio ${(m.width / m.height).toFixed(3)}`,
  );
})();
