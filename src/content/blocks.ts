/**
 * LONG-FORM BLOCK MODEL
 * ----------------------------------------------------------------------------
 * Shared by guides and journal entries. Long-form content is data rather than
 * MDX so that there is one renderer, one set of type rules, and specification
 * tables that are guaranteed to be real table elements (Strategy 4.3,
 * mandatory) rather than whatever a markdown pipeline decides to emit.
 *
 * Inline links use [label](/path) and are parsed by RichText in
 * `components/primitives/Prose`. Internal paths render as next/link; anything
 * starting with http renders as an external anchor with rel="noopener".
 */

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "table"; caption: string; head: string[]; rows: string[][] }
  /** A caveat set apart from the prose. Used for "verify this yourself". */
  | { kind: "note"; text: string }
  /**
   * A Zoebar specification that has not been confirmed. Renders the marker.
   * `perLot` swaps "Being verified" for "Confirmed per lot" where the figure is
   * recorded on each individual lot rather than published for the origin.
   */
  | { kind: "pending"; label: string; text: string; perLot?: boolean };

export interface Section {
  /** Anchor id, also used for the on-page contents list. */
  id: string;
  heading: string;
  blocks: Block[];
}

/** Word count of rendered prose. Derived, never asserted. */
export function countWords(sections: readonly Section[], ...extra: string[]): number {
  let words = 0;
  const add = (s: string) => {
    words += s.trim().split(/\s+/).filter(Boolean).length;
  };

  extra.forEach(add);

  for (const section of sections) {
    add(section.heading);
    for (const block of section.blocks) {
      switch (block.kind) {
        case "p":
        case "h3":
        case "note":
          add(block.text);
          break;
        case "ul":
        case "ol":
          block.items.forEach(add);
          break;
        case "pending":
          add(block.text);
          break;
        case "table":
          block.rows.forEach((row) => row.forEach(add));
          break;
      }
    }
  }

  return words;
}

/** Reading time in whole minutes, floored at one. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}
