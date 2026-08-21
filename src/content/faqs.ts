import type { QA } from "@/components/primitives/Answer";

/**
 * FAQ CONTENT
 * ----------------------------------------------------------------------------
 * Every answer here is built only from facts verified in the Foundation Brief
 * and Coffee-First Strategy. Answers are 40–60 words and self-contained: they
 * repeat the place names, altitudes and dates rather than referring back, so
 * they survive being quoted alone by an answer engine (Strategy 5.2).
 *
 * A question whose honest answer is "being verified" is NOT listed here. An
 * FAQ that resolves to a non-answer is worse than no FAQ: it wastes a
 * citation slot and teaches an engine that the page is thin. Add questions as
 * the client confirms the underlying specifications.
 */

export const AMARO_FAQS: readonly QA[] = [
  {
    question: "Where does Zoebar's coffee come from?",
    answer:
      "Zoebar's coffee comes from Amaro, recently named as Koore Zone, in Ethiopia. The coffee is Ethiopian Arabica grown at approximately 1,700 to 1,800 metres above sea level. It is processed at Zoebar's own washing station in Amaro and exported by Zoebar Business Group FZE LLC, registered in the UAE.",
  },
  {
    question: "Is Amaro coffee the same as Sidama coffee?",
    answer:
      "Not administratively. Amaro is an administrative zone in Ethiopia, recently named as Koore Zone, and is not part of the Sidama Region. In international coffee markets, however, coffee from Amaro is commonly presented within the broader Sidama coffee category. Both statements are accurate and Zoebar publishes them together.",
  },
  {
    question: "When is the Amaro coffee harvest?",
    answer:
      "The Amaro harvest runs approximately September to December each year. Coffee is Ethiopian Arabica grown at 1,700 to 1,800 metres above sea level in Koore Zone, Ethiopia. Lots are processed at Zoebar's washing station in Amaro as either washed or natural, depending on the lot.",
  },
  {
    question: "How is Amaro coffee processed?",
    answer:
      "Amaro coffee is processed as washed or natural, depending on the lot, at the washing station Zoebar Ethiopia owns in Amaro, Ethiopia. Owning the station means the processing record attached to a lot is a direct operational record rather than information passed on from a third-party supplier.",
  },
];

export const PROCESS_FAQS: readonly QA[] = [
  {
    question: "Does Zoebar own its washing station?",
    answer:
      "Yes. Zoebar Ethiopia owns the washing station in Amaro, Ethiopia, and Zoebar Ethiopia is being established in Addis Ababa. Ownership means cherry intake, processing method, drying and lot formation are controlled directly by Zoebar rather than bought in from a third-party processor.",
  },
  {
    question: "What is the difference between washed and natural processing?",
    answer:
      "In washed processing the fruit is removed from the coffee seed before drying. In natural processing the cherry dries whole with the fruit intact. Zoebar produces both at its Amaro washing station in Ethiopia, and which method applies is recorded per lot rather than assumed across the harvest.",
  },
];

export const TRACEABILITY_FAQS: readonly QA[] = [
  {
    question: "What information does a Zoebar lot record carry?",
    answer:
      "A Zoebar lot record carries its origin in Amaro (Koore Zone), Ethiopia, the processing method applied at Zoebar's own washing station, the harvest period, the quality assessment, and the producers connected to the lot where they have given documented permission to be named.",
  },
  {
    question: "Where do the QR codes on Zoebar sacks lead?",
    answer:
      "QR codes printed on Zoebar sacks and sample bags resolve to that lot's page on zoebarbusinessgroup.com. The page carries the lot's origin in Amaro, Ethiopia, its processing method, harvest period and quality record, so a buyer can check the physical coffee against the published record.",
  },
];

export const FARMER_FAQS: readonly QA[] = [
  {
    question: "Who grows the coffee Zoebar exports?",
    answer:
      "Zoebar's coffee is grown by producers in Amaro, recently named as Koore Zone, Ethiopia, at approximately 1,700 to 1,800 metres above sea level. Producers are named individually on this site, with their plot and altitude, wherever they have given documented permission for publication.",
  },
  {
    question: "Are producers named on the Zoebar website?",
    answer:
      "Yes, where the producer has given documented permission. Each profile carries the producer's name, plot, altitude and years working with Zoebar, and lot pages link back to the producers who grew that lot. A profile cannot be published without a recorded permission from the producer.",
  },
];
