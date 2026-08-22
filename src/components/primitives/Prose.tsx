import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { clsx } from "@/lib/clsx";
import type { Block } from "@/content/blocks";
import { Pending } from "./data";

/**
 * LONG-FORM RENDERER
 * ----------------------------------------------------------------------------
 * Renders the guide/journal block model. Three rules govern it:
 *
 *   1. Tables are real <table> elements with a caption and row headers
 *      (Strategy 4.3, mandatory — never images, never div grids).
 *   2. Nothing is behind an interaction. No accordions, no tabs: an answer
 *      engine has to be able to lift any paragraph out of the DOM as it stands
 *      (Directive 19).
 *   3. A table lives inside its own overflow-x container, and any grid item
 *      hosting one must carry `min-w-0` — a grid track defaults to
 *      `min-width: auto` and a table will otherwise push the whole page wider
 *      than the viewport.
 */

/* ============================================================================
   INLINE LINKS
   ----------------------------------------------------------------------------
   Content is authored with [label](/path). Kept deliberately minimal: this is
   a link parser, not a markdown engine, so there is no emphasis syntax to
   escape and no HTML passthrough to sanitise.
   ========================================================================== */

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export function RichText({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let cursor = 0;

  // `matchAll` on a fresh regex each call — a module-level /g regex carries
  // lastIndex between calls and would silently skip links on re-render.
  for (const match of text.matchAll(new RegExp(LINK.source, "g"))) {
    const [full, label, href] = match;
    const at = match.index ?? 0;

    if (at > cursor) out.push(text.slice(cursor, at));

    const external = href.startsWith("http");
    const className =
      "underline decoration-[0.5px] underline-offset-[3px] transition-colors duration-[200ms] " +
      "decoration-[#a8a294] hover:decoration-current";

    out.push(
      external ? (
        <a
          key={`${at}-${href}`}
          href={href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
        </a>
      ) : (
        <Link key={`${at}-${href}`} href={href} className={className}>
          {label}
        </Link>
      ),
    );

    cursor = at + full.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));

  return (
    <>
      {out.map((node, i) => (
        <Fragment key={i}>{node}</Fragment>
      ))}
    </>
  );
}

/* ============================================================================
   BLOCKS
   ========================================================================== */

const P = "max-w-[68ch] font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]";

function BlockNode({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return (
        <p className={P}>
          <RichText text={block.text} />
        </p>
      );

    case "h3":
      return (
        <h3 className="mt-4 max-w-[34ch] font-display text-[1.375rem] leading-snug tracking-[-0.01em] text-ink">
          <RichText text={block.text} />
        </h3>
      );

    case "ul":
      return (
        <ul className="flex max-w-[68ch] flex-col gap-3">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="grid grid-cols-[0.75rem_minmax(0,1fr)] gap-x-4 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]"
            >
              <span aria-hidden="true" className="pt-[0.7em] text-[#a8a294]">
                <span className="block h-px w-3 bg-current" />
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="flex max-w-[68ch] flex-col gap-3">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 font-sans text-[1.0625rem] leading-[1.72] text-[#3d423a]"
            >
              <span
                data-numeric
                aria-hidden="true"
                className="pt-[0.35em] font-sans text-[0.6875rem] font-medium tabular-nums tracking-[0.16em] text-[#a8a294]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case "table":
      return (
        // min-w-0 on the wrapper as well: this renders inside a flex column,
        // whose items also default to a content-derived minimum width.
        <div className="w-full min-w-0 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="mb-4 text-left font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#7b8079]">
              {block.caption}
            </caption>
            <thead>
              <tr className="border-t border-[#c9c0ae]">
                {block.head.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="whitespace-nowrap py-3 pr-6 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-[#7b8079]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-t border-[#e2dbcd] align-top">
                  {row.map((cell, j) =>
                    j === 0 ? (
                      <th
                        key={j}
                        scope="row"
                        className="py-4 pr-6 font-sans text-[0.9375rem] font-medium text-ink"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td
                        key={j}
                        className="py-4 pr-6 font-sans text-[0.9375rem] leading-[1.6] text-[#5a5f56]"
                      >
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "note":
      return (
        <aside className="max-w-[64ch] border-l border-[#c9c0ae] py-1 pl-6">
          <p className="font-sans text-[0.9375rem] leading-[1.7] text-[#5a5f56]">
            <RichText text={block.text} />
          </p>
        </aside>
      );

    case "pending":
      // The trust rule, inside the prose. Deliberately looks composed rather
      // than like a missing-data error (see Pending in primitives/data).
      return (
        <aside className="max-w-[64ch] border border-[#e2dbcd] bg-bone/60 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-[#7b8079]">
              {block.label}
            </p>
            <Pending />
          </div>
          <p className="mt-4 font-sans text-[0.9375rem] leading-[1.7] text-[#5a5f56]">
            <RichText text={block.text} />
          </p>
        </aside>
      );
  }
}

export function Blocks({
  blocks,
  className,
}: {
  blocks: readonly Block[];
  className?: string;
}) {
  return (
    <div className={clsx("flex min-w-0 flex-col gap-6", className)}>
      {blocks.map((block, i) => (
        <BlockNode key={i} block={block} />
      ))}
    </div>
  );
}
