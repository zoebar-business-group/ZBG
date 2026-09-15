/**
 * FARMER PHOTOGRAPHS — resolution and a shared grade.
 * ----------------------------------------------------------------------------
 * The two producer photographs arrived at different sizes and in different
 * edits. `farmer-one.jpg` is 1005x614 at 107KB, which is soft once
 * `object-cover` crops it to a portrait slot on a 2x display; the plot
 * photograph is larger but pushed hard on saturation and contrast. Side by
 * side they read as two sources rather than one body of documentation.
 *
 * This writes new files and leaves the originals in place:
 *
 *   1. Upscale with Lanczos-3, so the browser is not stretching a small
 *      source with its own bilinear filter. This is interpolation, not
 *      AI super-resolution — it cannot invent detail the camera did not
 *      record, but it keeps edges clean at the size the page shows.
 *   2. A light unsharp mask after the resize, to restore edge contrast the
 *      interpolation softens.
 *   3. One grade applied to both: saturation eased back from the neon greens,
 *      and a slight warm balance so the frames sit with the site's sand and
 *      alabaster rather than against them.
 *
 * It does not retouch the people. No faces, skin or bodies are altered beyond
 * the global grade that applies to every pixel of the frame.
 *
 *   node scripts/farmer-photos.cjs
 */

const sharp = require("sharp");

const JOBS = [
  { src: "public/farmer-one.jpg", out: "public/farmer-one-hd.jpg", scale: 2, saturation: 0.9 },
  { src: "public/zoebarfarmers1.jpeg", out: "public/farmers-plot-hd.jpg", scale: 1.5, saturation: 0.86 },
];

(async () => {
  for (const job of JOBS) {
    const meta = await sharp(job.src).metadata();
    const width = Math.round(meta.width * job.scale);

    const info = await sharp(job.src)
      .rotate()
      .resize({ width, kernel: sharp.kernel.lanczos3 })
      // Warm balance: a touch more red, a touch less blue.
      .recomb([
        [1.03, 0, 0],
        [0, 1.0, 0],
        [0, 0, 0.95],
      ])
      .modulate({ saturation: job.saturation, brightness: 1.01 })
      .sharpen({ sigma: 0.9, m1: 0.5, m2: 1.6 })
      .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: "4:4:4", progressive: true })
      .toFile(job.out);

    console.log(
      `${job.src} ${meta.width}x${meta.height} -> ${job.out} ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB`,
    );
  }
})();
