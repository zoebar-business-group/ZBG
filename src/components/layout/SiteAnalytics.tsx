"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics, minus the embedded Sanity Studio. /studio is editors
 * working, not visitors, so its events are dropped before they are sent.
 *
 * Filtering on the event's URL rather than unmounting via ChromeGate matters:
 * the Studio routes internally with pushState, and a direct landing on /studio
 * would otherwise race the gate. `beforeSend` sees every event, whatever its
 * origin. It is a function, which is why this is a client component — the
 * root layout is a server component and cannot pass one across.
 */
function dropStudio(event: BeforeSendEvent): BeforeSendEvent | null {
  const { pathname } = new URL(event.url, window.location.origin);
  if (pathname === "/studio" || pathname.startsWith("/studio/")) return null;
  return event;
}

export function SiteAnalytics() {
  return <Analytics beforeSend={dropStudio} />;
}
