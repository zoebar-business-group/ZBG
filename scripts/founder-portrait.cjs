/**
 * FOUNDER PORTRAIT — studio grey out, page background through.
 * ----------------------------------------------------------------------------
 * The supplied headshot (`docs/founder eden.jpeg`) sits on a cool studio grey
 * and is cropped close to the shoulders.
 *
 * FIRST ATTEMPT (4 Sep) baked a warm cream ground into a JPEG. It was rejected,
 * and correctly: a baked ground is a *different* cream from the page's
 * alabaster no matter how carefully it is mixed, so the picture read as a card
 * floating on the page — a visible rounded box with a hard bottom edge.
 *
 * THIS VERSION writes a cut-out with a real alpha channel. There is no ground
 * at all: the page shows through, so it blends with whatever surface it is
 * placed on and cannot mismatch. Three things follow from that:
 *
 *   1. No side padding. The frame is cropped in until the shoulders reach both
 *      edges, so she is flush left and right rather than inset.
 *   2. The bottom dissolves. Alpha ramps to zero across the lower third, so
 *      she emerges out of the page instead of ending on a cut line.
 *   3. No rounding, no panel, no caption frame in the component.
 *
 * The output ratio is not a round number — it falls out of the crop — so the
 * `portraitSoft` entry in `components/primitives/Figure` is set to exactly the
 * pixel ratio printed at the end of this run. **If you re-run this with a new
 * photograph, update that class to whatever it prints**, or `object-cover`
 * will crop the fade back off.
 *
 *   node scripts/founder-portrait.cjs "docs/founder eden.jpeg" public/founder-eden.webp
 *
 * It does not retouch the person. It removes the ground behind her, crops the
 * frame and fades the foot; her own pixels are untouched.
 */

const sharp = require("sharp");
const path = require("path");

const SRC = process.argv[2] ?? "docs/founder eden.jpeg";
const OUT = process.argv[3] ?? "public/founder-eden.webp";

/** Target shape of the finished frame. Portrait, a little taller than 3:4. */
const TARGET_ASPECT = 0.7;
/** Never crowd the top of the head, whatever the crop maths wants. */
const MIN_PAD_TOP = 40;
/** How much of the finished height dissolves into the page at the foot. */
const FADE_FRACTION = 0.25;

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
     a cool halo once the page shows through behind them. */
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
  const alphaAt = (i) => soft.data[i * sc];

  /* ---- 4. Find the crop that puts the shoulders on both edges -----------
     Measured across the lower band, where the shoulders are widest. The
     narrower of the two margins governs, so neither side is cut into. */
  const band = Math.floor(H * 0.82);
  let leftMost = W, rightMost = 0;
  for (let y = band; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (alphaAt(y * W + x) > 128) {
        if (x < leftMost) leftMost = x;
        if (x > rightMost) rightMost = x;
      }
    }
  }
  const cropSide = Math.max(0, Math.min(leftMost, W - 1 - rightMost));
  console.log(
    `shoulders span x=${leftMost}..${rightMost} in the lower band → crop ${cropSide}px per side`,
  );

  /* ---- 5. Derive the finished frame ------------------------------------- */
  const FW = W - 2 * cropSide;
  let padTop = Math.round(FW / TARGET_ASPECT) - H;
  if (padTop < MIN_PAD_TOP) padTop = MIN_PAD_TOP;
  const FH = H + padTop;
  const fadeStart = Math.round(FH * (1 - FADE_FRACTION));

  /* ---- 6. Compose: subject on transparency, dissolving at the foot ------ */
  const out = Buffer.alloc(FW * FH * 4); // zero-filled = fully transparent
  for (let y = 0; y < FH; y++) {
    const sy = y - padTop;
    if (sy < 0 || sy >= H) continue;

    /* Smoothstep rather than a linear ramp: a straight fade still reads as an
       edge because the eye catches the kink where it starts. */
    let fade = 1;
    if (y >= fadeStart) {
      const t = (y - fadeStart) / (FH - fadeStart);
      fade = 1 - (3 * t * t - 2 * t * t * t);
    }

    for (let x = 0; x < FW; x++) {
      const si = sy * W + (x + cropSide);
      const a = alphaAt(si) * fade;
      if (a <= 0) continue;
      const o = (y * FW + x) * 4;
      out[o] = raw[si * C];
      out[o + 1] = raw[si * C + 1];
      out[o + 2] = raw[si * C + 2];
      out[o + 3] = Math.round(a);
    }
  }

  await sharp(out, { raw: { width: FW, height: FH, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(OUT);

  const m = await sharp(OUT).metadata();
  console.log(
    `wrote ${path.basename(OUT)} ${m.width}x${m.height}, ratio ${(m.width / m.height).toFixed(4)}`,
  );
  console.log(`   Figure ratio class must be:  aspect-[${m.width}/${m.height}]`);
})();
