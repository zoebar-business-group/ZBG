import { defineField, defineType } from "sanity";

/**
 * CUPPING NOTE — a recorded cup evaluation of a lot.
 *
 * Kept separate from the lot document so a lot can carry more than one cupping
 * (offer sample, pre-shipment sample, a buyer's own table) without overwriting.
 * Not yet consumed by the public site; available for when per-lot cup records
 * are published.
 */
export const cuppingNoteType = defineType({
  name: "cuppingNote",
  title: "Cupping note",
  type: "document",
  fields: [
    defineField({
      name: "lot",
      title: "Lot",
      type: "reference",
      to: [{ type: "lot" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "score",
      title: "Score",
      type: "number",
      description: "SCA-style 100-point score, e.g. 86.5.",
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "tastingNotes",
      title: "Tasting notes",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cupper",
      title: "Cupper",
      type: "string",
      description: "Who cupped it.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date cupped",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { lotId: "lot.lotId", score: "score", date: "date" },
    prepare({ lotId, score, date }) {
      return {
        title: lotId ? `${lotId}` : "Cupping note",
        subtitle: [score != null ? `${score}` : null, date].filter(Boolean).join("  ·  "),
      };
    },
  },
});
