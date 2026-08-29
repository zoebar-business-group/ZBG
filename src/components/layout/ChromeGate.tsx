"use client";

import { usePathname } from "next/navigation";

/**
 * Renders its children on every route except the embedded Sanity Studio at
 * /studio, which needs the full viewport with none of the site's fixed
 * navigation or footer over it. `usePathname()` resolves during SSR too, so the
 * Studio's HTML never contains the site chrome and there is no hydration flash.
 */
export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;
  return <>{children}</>;
}
