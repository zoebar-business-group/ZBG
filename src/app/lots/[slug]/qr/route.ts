import QRCode from "qrcode";

import { SITE_URL } from "@/lib/site";
import { lotBySlug } from "@/content/lots";

/**
 * QR CODE FOR A LOT PAGE
 * ----------------------------------------------------------------------------
 * Generated server-side with the `qrcode` package, not a third-party API, so it
 * works offline and does not depend on an external service being up.
 *
 *   GET /lots/{slug}/qr?format=svg   vector, scales cleanly
 *   GET /lots/{slug}/qr?format=png   raster, 2048px, ample for a 300 DPI label
 *                                    at any realistic sack or sample-bag size
 *
 * Both formats encode the lot's full URL, built from `SITE_URL` — the
 * production canonical unless `NEXT_PUBLIC_SITE_URL` overrides it for a preview
 * deployment, so a QR scanned during review resolves to the deployment under
 * test. `qrcode` has no PDF output, so SVG plus a high-resolution PNG is what
 * is offered; commercial label printers take one of these.
 *
 * Physical printing (sending the file to a print shop or label supplier, and
 * applying the printed code to sacks and sample bags) happens outside this
 * codebase. The app's responsibility ends at producing a correct, print-ready
 * file.
 */

const PNG_WIDTH = 2048;
const QR_MARGIN = 2;
const CACHE = "public, max-age=31536000, immutable";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const lot = await lotBySlug(slug);
  if (!lot) {
    return new Response("Lot not found", { status: 404 });
  }

  const format =
    new URL(request.url).searchParams.get("format") === "png" ? "png" : "svg";
  const target = `${SITE_URL}/lots/${lot.slug}`;
  const filename = `zoebar-${lot.slug}-qr.${format}`;

  if (format === "png") {
    const png = await QRCode.toBuffer(target, {
      type: "png",
      width: PNG_WIDTH,
      margin: QR_MARGIN,
      errorCorrectionLevel: "M",
    });
    return new Response(new Uint8Array(png), {
      headers: {
        "content-type": "image/png",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": CACHE,
      },
    });
  }

  const svg = await QRCode.toString(target, {
    type: "svg",
    margin: QR_MARGIN,
    errorCorrectionLevel: "M",
  });
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": CACHE,
    },
  });
}
