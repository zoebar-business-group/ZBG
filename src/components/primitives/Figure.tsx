import Image from "next/image";
import { clsx } from "@/lib/clsx";

/**
 * FIGURE — authentic photography, or an honest placeholder.
 *
 * Foundation Brief 6 prioritises real photographs from farms, the washing
 * station, processing and operations, and rules out building the identity on
 * stock imagery. Strategy Open Item #8 marks this a hard blocker.
 *
 * Until real assets arrive, `src` is omitted and this renders a marked
 * placeholder that names the exact photograph required — so the placeholder
 * doubles as the shot list for the client, and no stock image ever enters the
 * design. Adding `src` swaps in a real optimised image with no layout change.
 */

const RATIOS = {
  portrait: "aspect-[3/4]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  cinematic: "aspect-[21/9]",
  tall: "aspect-[9/16]",
} as const;

export interface FigureProps {
  /** Required photograph, in plain language. Becomes the placeholder brief. */
  brief: string;
  /** Real asset path once supplied. */
  src?: string;
  /** Descriptive alt text — required for every real image (Directive 28). */
  alt?: string;
  /** Visible caption. Truthful captions are a brand requirement. */
  caption?: string;
  ratio?: keyof typeof RATIOS;
  /** Hexagon-derived corner cut, from the badge geometry. Use sparingly. */
  cut?: boolean;
  rounded?: "none" | "card" | "panel";
  priority?: boolean;
  sizes?: string;
  onDark?: boolean;
  className?: string;
}

export function Figure({
  brief,
  src,
  alt,
  caption,
  ratio = "landscape",
  cut = false,
  rounded = "card",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  onDark = false,
  className,
}: FigureProps) {
  const radius =
    rounded === "panel"
      ? "rounded-[2rem]"
      : rounded === "card"
        ? "rounded-[1rem]"
        : "rounded-none";

  return (
    <figure className={clsx("flex flex-col gap-3", className)}>
      <div
        className={clsx(
          "relative w-full overflow-hidden",
          RATIOS[ratio],
          radius,
          cut && "cut-hex",
          !src && (onDark ? "bg-[#04231F]" : "bg-bone"),
          !src && (onDark ? "ring-1 ring-[rgba(240,226,203,0.14)]" : "ring-1 ring-[#e2dbcd]"),
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt ?? brief}
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-start justify-end gap-2 p-5 sm:p-7">
            <span
              className={clsx(
                "inline-flex items-center gap-2 rounded-[2px] border px-2.5 py-1",
                "font-sans text-[0.625rem] font-medium uppercase tracking-[0.16em]",
                onDark
                  ? "border-[rgba(240,226,203,0.28)] text-[#9db3b0]"
                  : "border-[#d9d0bf] text-meta",
              )}
            >
              Photography pending
            </span>
            <p
              className={clsx(
                "max-w-[36ch] font-sans text-sm leading-relaxed",
                onDark ? "text-[#9db3b0]" : "text-meta",
              )}
            >
              {brief}
            </p>
          </div>
        )}
      </div>

      {caption && (
        <figcaption
          className={clsx(
            "font-sans text-sm leading-relaxed",
            onDark ? "text-[#9db3b0]" : "text-[#5a5f56]",
          )}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
