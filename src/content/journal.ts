import type { QA } from "@/components/primitives/Answer";
import { countWords, readingMinutes, type Section } from "./blocks";

/**
 * JOURNAL — content model
 * ----------------------------------------------------------------------------
 * The journal is the editorial record: harvest notes, station updates, market
 * observations and origin reporting. Strategy 5.3 requires Article schema with
 * a real `datePublished`, a real `dateModified` and a named author on every
 * entry.
 *
 * NO ENTRIES ARE SEEDED, AND NONE MAY BE INVENTED.
 *
 * A journal entry is a dated statement about something that happened at a real
 * washing station in a real harvest. A plausible-looking seeded post — "Harvest
 * update: first cherry intake" — is a fabricated record with a fabricated date
 * attached, published under the company's name. It is exactly the class of
 * claim the trust rule exists to prevent, and Article schema would broadcast
 * the invented date to every engine that reads the page.
 *
 * The seed material is the client's LinkedIn archive (Strategy Open Item #12),
 * which has not been supplied. Until it is, `ENTRIES` stays empty, the index
 * renders an honest empty state, and /journal/* correctly 404s.
 *
 * WHEN THE FIRST ENTRY LANDS:
 *   1. Add it here with the dates it was actually written and last revised.
 *   2. Set `built: true` and remove `noindex` on /journal in `lib/site.ts`.
 *   3. Add /journal to the Pages list in `public/llms.txt`.
 */

export interface JournalEntry {
  slug: string;
  /** H1 and Article headline. */
  title: string;
  /** Short label for indexes and cross-links. */
  navTitle: string;
  /** Meta description and index summary. */
  description: string;
  /** Answer-first H2 — the question the entry actually answers. */
  question: string;
  /** 40-60 words, self-contained, quotable without surrounding context. */
  answer: string;
  /** Editorial category, e.g. "Harvest", "Station", "Market". */
  topic: string;
  sections: Section[];
  faqs: QA[];
  /**
   * ISO dates. These must be the real dates the entry was written and last
   * substantively revised. Never backdated to look established, never
   * refreshed to look current.
   */
  datePublished: string;
  dateModified: string;
  /**
   * Named author. Strategy 5.3 requires a named author on journal entries; an
   * entry attributed to the organisation alone is acceptable, an entry
   * attributed to an invented person is not.
   */
  author: string;
}

export const ENTRIES: readonly JournalEntry[] = [];

/** The only accessor pages may use. */
export function publishedEntries(): JournalEntry[] {
  return [...ENTRIES].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished),
  );
}

export function entryBySlug(slug: string): JournalEntry | undefined {
  return ENTRIES.find((e) => e.slug === slug);
}

export function entryWordCount(entry: JournalEntry): number {
  return countWords(
    entry.sections,
    entry.answer,
    ...entry.faqs.flatMap((f) => [f.question, f.answer]),
  );
}

export function entryReadingTime(entry: JournalEntry): number {
  return readingMinutes(entryWordCount(entry));
}

/**
 * What the journal will carry, stated in advance. This is a publishing
 * standard rather than a content promise — it describes the editorial rules an
 * entry must satisfy, which is a real answer to "what is this section for?"
 * even while the section is empty.
 */
export const EDITORIAL_STANDARD: ReadonlyArray<{ term: string; detail: string }> = [
  {
    term: "Dated, and honestly dated",
    detail:
      "Every entry carries the date it was written and the date it was last revised. Neither is backdated to look established, and neither is refreshed to look current.",
  },
  {
    term: "Attributed",
    detail:
      "Every entry names its author. An entry may be attributed to Zoebar Business Group; it will never be attributed to a person who did not write it.",
  },
  {
    term: "About something that happened",
    detail:
      "Harvest notes, washing station updates and origin reporting describe events at a real station in a real season. Entries are not written to fill a publishing calendar.",
  },
  {
    term: "Corrected in public",
    detail:
      "If an entry turns out to be wrong, the correction is made on the entry with its revision date changed, rather than the entry quietly disappearing.",
  },
];
