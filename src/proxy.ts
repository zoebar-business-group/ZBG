import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * STAGING / PREVIEW noindex SAFETY NET
 * ----------------------------------------------------------------------------
 * This is the Next.js 16 `proxy` file convention. `middleware.ts` was
 * deprecated in v16 and renamed to `proxy.ts` — same behaviour, new name (see
 * node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md).
 * It lives at `src/proxy.ts` because `app/` is under `src/`.
 *
 * Every response gets `X-Robots-Tag: noindex, nofollow` UNLESS the request
 * arrives on the production host. Production (`zoebarbusinessgroup.com`, apex
 * or `www`) is left completely untouched and stays fully indexable — Vercel
 * preview URLs, `localhost`, and any other host do not.
 *
 * It is a backstop, not a security boundary: no redirect, no blocking, just
 * the header. The primary indexing controls are still the per-route `robots`
 * metadata and `public/robots.txt`.
 */

const PRODUCTION_HOST = "zoebarbusinessgroup.com";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isProduction = host.includes(PRODUCTION_HOST);

  const response = NextResponse.next();

  if (!isProduction) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every path except the ones that are never indexed anyway:
     * - _next/static  (build assets)
     * - _next/image   (image optimiser)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
