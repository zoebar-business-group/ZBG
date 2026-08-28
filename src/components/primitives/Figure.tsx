import Image from "next/image";
import { clsx } from "@/lib/clsx";
import { ZoebarSymbol } from "@/components/brand/ZoebarSymbol";

/**
 * FIGURE - authentic photography, or a composed brand panel.
 *
 * Foundation Brief 6 prioritises real photographs from farms, the washing
 * station, processing and operations, and rules out building the identity on
 * stock imagery. Strategy Open Item #8 marks this a hard blocker.
 *
 * WHEN THERE IS NO PHOTOGRAPH the slot renders a composed panel rather than a
 * grey box captioned "Photography pending". That caption was addressed to the
 * client during the build; in front of the client's own customers it reads as
 * an unfinished site. The panel below is tonal, uses the brand symbol as a
 * quiet watermark, and is designed to sit in the layout as a deliberate
 * surface. It never implies a photograph exists.
 *
 * The `brief` prop is unchanged and still required. It no longer renders, but
 * it remains the shot list: grep for `brief=` to get every outstanding
 * photograph. Adding `src` swaps in a real optimised image with no layout
 * change.
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
  /** The photograph this slot is waiting for, in plain language. Not rendered;
   *  it is the standing shot list for Open Item #8. */
  brief: string;
  /** Real asset path once supplied. */
  src?: string;
  /** Descriptive alt text - required for every real image (Directive 28). */
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
          !src &&
            (onDark
              ? "bg-[#04231F] ring-1 ring-[rgba(240,226,203,0.14)]"
              : "bg-bone ring-1 ring-[#e2dbcd]"),
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
          /* Composed panel. Decorative by intent, so it is hidden from the
             accessibility tree - a screen reader announcing a description of a
             photograph that is not there would be a false statement. Any
             meaning the slot carries lives in the visible caption below. */
          <div aria-hidden="true" className="absolute inset-0">
            {/* Tonal ground: two soft washes, warm from the top-left and
                cooler at the foot, so the panel has depth rather than reading
                as a flat fill. */}
            <div
              className={clsx(
                "absolute inset-0",
                onDark
                  ? "bg-[radial-gradient(120%_90%_at_18%_8%,rgba(240,226,203,0.10)_0%,rgba(240,226,203,0)_55%),linear-gradient(168deg,#05271F_0%,#04231F_46%,#02191A_100%)]"
                  : "bg-[radial-gradient(120%_90%_at_18%_8%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_58%),linear-gradient(168deg,#F4EEE3_0%,#EBE4D6_52%,#E2DACA_100%)]",
              )}
            />

            {/* A single hairline rule set on the classical third. Quiet
                structure, the same device the page headers use. */}
            <div
              className={clsx(
                "absolute inset-y-0 left-1/3 w-px",
                onDark ? "bg-[rgba(240,226,203,0.07)]" : "bg-[rgba(1,58,51,0.06)]",
              )}
            />

            {/* The brand symbol, held well back. Sized to the panel so it
                scales with the slot instead of floating at a fixed size. */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ZoebarSymbol
                fill={onDark ? "#F0E2CB" : "#013A33"}
                className={clsx(
                  "w-[22%] max-w-[104px]",
                  onDark ? "opacity-[0.13]" : "opacity-[0.09]",
                )}
              />
            </div>
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
