import { defineField, defineType } from "sanity";

/**
 * PRODUCER — a coffee grower profile.
 *
 * The producer-dignity rule from CLAUDE.md and the Foundation Brief is absolute:
 * a profile cannot be published without the producer's explicit permission for
 * their name, photograph and words to be used. On the site this is enforced by
 * `publishedProducers()` filtering on `permissionGranted`. Here it is enforced
 * at the Studio level: the document-level validation below returns an error
 * (not a warning) unless `permissionGranted` is explicitly `true`, and Sanity
 * blocks publishing on an error.
 *
 * If you change one thing in this file, do not change that rule.
 */
export const producerType = defineType({
  name: "producer",
  title: "Producer",
  type: "document",
  fields: [
    defineField({
      name: "permissionGranted",
      title: "Permission granted",
      type: "boolean",
      description:
        "Has this producer explicitly agreed to have their name, photo and words published? This profile CANNOT be published until this is set to true.",
      // No initialValue on purpose: an unset permission must read as unset,
      // never as an accidental default.
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "permissionRecordedOn",
      title: "Permission recorded on",
      type: "date",
      description: "When the permission was recorded, for the audit trail.",
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "plot",
      title: "Plot or kebele",
      type: "string",
      description: "The plot or kebele name within Amaro.",
    }),
    defineField({
      name: "altitude",
      title: "Plot altitude (masl)",
      type: "number",
    }),
    defineField({
      name: "yearsWithZoebar",
      title: "Years working with Zoebar",
      type: "number",
    }),
    defineField({
      name: "photo",
      title: "Photograph",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the photograph for screen readers.",
        }),
      ],
    }),
    defineField({
      name: "bio",
      title: "Bio",
      type: "text",
      rows: 4,
      description: "A short profile. Skilled producer framing only, never charity or rescue.",
    }),
    defineField({
      name: "quote",
      title: "Their own words",
      type: "text",
      rows: 3,
      description: "A direct quote from the producer, where they have given one.",
    }),
    defineField({
      name: "lots",
      title: "Lots (back-reference)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "lot" }] }],
      description: "Lots this producer contributed to.",
    }),
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      if (doc?.permissionGranted === true) return true;
      return "This producer profile cannot be published: the producer has not explicitly granted permission for their name, photo and words to be used. Set 'Permission granted' to true, with a recorded date, before publishing.";
    }),
  preview: {
    select: { title: "name", plot: "plot", granted: "permissionGranted", media: "photo" },
    prepare({ title, plot, granted, media }) {
      return {
        title: title || "Unnamed producer",
        subtitle: `${plot || "no plot set"}  ·  ${granted === true ? "permission granted" : "PERMISSION NOT GRANTED"}`,
        media,
      };
    },
  },
});
