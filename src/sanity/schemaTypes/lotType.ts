import { defineField, defineType } from "sanity";

/**
 * LOT — a record about a specific batch of green coffee.
 *
 * Mirrors the `Lot` interface in `src/content/lots.ts` field for field, so the
 * GROQ projection there can produce a value the /lots pages already expect
 * without any component changes.
 *
 * The slug is printed on the physical sack and becomes the permanent public
 * URL, so the same `origin-process-year-seq` pattern that `isValidLotSlug()`
 * checks is enforced here as a publish-blocking validation rule.
 */

const LOT_SLUG_RE = /^[a-z]+-(?:washed|natural)-20\d{2}-\d{2,}$/;

export const lotType = defineType({
  name: "lot",
  title: "Lot",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      title: "Slug (printed reference and URL)",
      type: "slug",
      description:
        "Format: origin-process-year-seq, e.g. amaro-washed-2026-01. This goes on the sack and is permanent, so get it right before printing.",
      validation: (Rule) =>
        Rule.required().custom((value) => {
          const current = value?.current;
          if (!current) return "A slug is required.";
          return LOT_SLUG_RE.test(current)
            ? true
            : "Must be origin-process-year-seq, lowercase, e.g. amaro-washed-2026-01.";
        }),
    }),
    defineField({
      name: "lotId",
      title: "Lot ID (display)",
      type: "string",
      description: 'Display identifier, e.g. "Lot 042".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "harvestYear",
      title: "Harvest year",
      type: "number",
      validation: (Rule) =>
        Rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      name: "process",
      title: "Process",
      type: "string",
      options: {
        list: [
          { title: "Washed", value: "Washed" },
          { title: "Natural", value: "Natural" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "origin",
      title: "Origin",
      type: "string",
      initialValue: "Amaro",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "zone",
      title: "Zone",
      type: "string",
      initialValue: "Koore Zone",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "country",
      title: "Country",
      type: "string",
      initialValue: "Ethiopia",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "altitudeMin",
      title: "Altitude, lower (masl)",
      type: "number",
      description: "Leave blank until confirmed. Renders as 'Being verified'.",
    }),
    defineField({
      name: "altitudeMax",
      title: "Altitude, upper (masl)",
      type: "number",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "grade",
      title: "Grade",
      type: "string",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "screenSize",
      title: "Screen size",
      type: "string",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "cuppingScore",
      title: "Cupping score",
      type: "string",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "moistureContent",
      title: "Moisture content",
      type: "string",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "packing",
      title: "Packing",
      type: "string",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "quantity",
      title: "Quantity",
      type: "string",
      description: "Leave blank until confirmed.",
    }),
    defineField({
      name: "producers",
      title: "Producers",
      type: "array",
      of: [{ type: "reference", to: [{ type: "producer" }] }],
      description:
        "The growers of this lot. A producer only appears on the public lot page once their own profile has permission granted.",
    }),
    defineField({
      name: "available",
      title: "Available",
      type: "boolean",
      description: "Turn off when the lot is contracted or withdrawn.",
      initialValue: true,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "lotId", year: "harvestYear", process: "process", slug: "slug.current" },
    prepare({ title, year, process, slug }) {
      return {
        title: title || slug || "Untitled lot",
        subtitle: [year, process].filter(Boolean).join("  ·  "),
      };
    },
  },
});
