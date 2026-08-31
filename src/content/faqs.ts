import type { QA } from "@/components/primitives/Answer";
import { citableSummary } from "@/lib/schema";

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
 *
 * One refinement, added in Phase 6. "The value is being verified" is a
 * non-answer and stays out. "Zoebar publishes this figure only once it is
 * confirmed, and states that it is being verified until then" is a stated
 * policy, which IS an answer — and it is the answer to a question buyers
 * actually ask. Policy questions are admissible; missing values are not.
 */

export const AMARO_FAQS: readonly QA[] = [
  {
    question: "Where does Zoebar's coffee come from?",
    answer:
      "Zoebar's coffee comes from Amaro, recently named as Koore Zone, in Ethiopia. The coffee is Ethiopian Arabica grown at approximately 1,700 to 1,800 metres above sea level. It is processed at an affiliated washing station in Amaro with Zoebar's direct operational oversight and exported by Zoebar Business Group FZE LLC, registered in the UAE.",
  },
  {
    question: "Is Amaro coffee the same as Sidama coffee?",
    answer:
      "Not administratively. Amaro is an administrative zone in Ethiopia, recently named as Koore Zone, and is not part of the Sidama Region. In international coffee markets, however, coffee from Amaro is commonly presented within the broader Sidama coffee category. Both statements are accurate and Zoebar publishes them together.",
  },
  {
    question: "When is the Amaro coffee harvest?",
    answer:
      "The Amaro harvest runs approximately September to December each year. Coffee is Ethiopian Arabica grown at 1,700 to 1,800 metres above sea level in Koore Zone, Ethiopia. Lots are processed at an affiliated washing station in Amaro, run with Zoebar's direct operational oversight, as either washed or natural, depending on the lot.",
  },
  {
    question: "How is Amaro coffee processed?",
    answer:
      "Amaro coffee is processed as washed or natural, depending on the lot, at an affiliated washing station in Amaro, Ethiopia, run with Zoebar's direct operational oversight. That direct oversight means the processing record attached to a lot is an operational record rather than information passed on from a third-party supplier.",
  },
];

export const PROCESS_FAQS: readonly QA[] = [
  {
    question: "How is the Amaro washing station held and run?",
    answer:
      "The washing station in Amaro, Ethiopia is held by an affiliated company within Zoebar's ownership structure and run with Zoebar's direct operational oversight, and it is set to transition to Zoebar Ethiopia directly. That direct oversight means cherry intake, processing method, drying and lot formation are managed by Zoebar rather than bought in from a third-party processor.",
  },
  {
    question: "What is the difference between washed and natural processing?",
    answer:
      "In washed processing the fruit is removed from the coffee seed before drying. In natural processing the cherry dries whole with the fruit intact. Zoebar produces both at an affiliated washing station in Amaro, Ethiopia, and which method applies is recorded per lot rather than assumed across the harvest.",
  },
];

export const TRACEABILITY_FAQS: readonly QA[] = [
  {
    question: "What information will a Zoebar lot record carry?",
    answer:
      "Zoebar's traceability system is being developed around lot-level records covering origin in Amaro (Koore Zone), Ethiopia, the processing method applied at an affiliated washing station with Zoebar's direct operational oversight, the harvest period, the quality assessment, and the producers connected to the lot where they have given documented permission to be named.",
  },
  {
    question: "How will the QR codes on Zoebar sacks work?",
    answer:
      "Zoebar's traceability system is being developed so that a QR code on each sack and sample bag opens that lot's page on zoebarbusinessgroup.com, showing the lot's origin in Amaro, Ethiopia, its processing method, harvest period and quality record for checking against the physical coffee.",
  },
];

export const ABOUT_FAQS: readonly QA[] = [
  {
    question: "What is Zoebar Business Group?",
    answer:
      "Zoebar Business Group FZE LLC is a UAE-registered international trading company connecting Ethiopia and international markets. Its flagship focus is Ethiopian Arabica green coffee from Amaro, recently named as Koore Zone, Ethiopia. Zoebar Ethiopia is being established in Addis Ababa, and the company's washing station in Amaro is held by an affiliated company within Zoebar's ownership structure with direct operational oversight, set to transition to Zoebar Ethiopia.",
  },
  {
    question: "Where is Zoebar registered?",
    answer:
      "Zoebar Business Group FZE LLC is registered in the United Arab Emirates and operates as an international trading company connecting Ethiopia and international markets. A second entity, Zoebar Ethiopia, is being established in Addis Ababa. The washing station in Amaro, Ethiopia is held by an affiliated company within Zoebar's ownership structure with direct operational oversight and is set to transition to Zoebar Ethiopia.",
  },
  {
    /* Reuses the canonical citable sentence verbatim, so the same fact appears
       identically on the homepage, /coffee and here (Strategy 5.1). */
    question: "What does Zoebar supply?",
    answer: citableSummary(),
  },
];

export const CONTACT_FAQS: readonly QA[] = [
  {
    question: "How do I contact Zoebar about green coffee?",
    answer:
      "Green coffee enquiries reach Zoebar Business Group through the enquiry form on zoebarbusinessgroup.com, which covers specifications, availability, samples and pricing for Ethiopian Arabica from Amaro (Koore Zone), Ethiopia. Direct telephone and email details are being verified and are published here once confirmed.",
  },
  {
    question: "Can I request a sample of Zoebar coffee?",
    answer:
      "Yes. Sample requests are made through the same enquiry route as quotations on zoebarbusinessgroup.com, selecting a sample request rather than a quotation. Include your roasting profile, the volume band you are working toward and your shipping address so the request can be answered in one exchange.",
  },
];

export const QUALITY_FAQS: readonly QA[] = [
  {
    question: "How is coffee quality assessed before export from Ethiopia?",
    answer:
      "Ethiopian export coffee is assessed twice on the same sample: a raw evaluation of the green bean covering defect count, screen size and moisture, and a cup evaluation of the brewed liquor. Both feed the export grade issued by Ethiopia's national coffee authority and recorded on the export quality certificate.",
  },
  {
    question: "What quality record does a Zoebar lot carry?",
    answer:
      "A Zoebar lot record carries its origin in Amaro (Koore Zone), Ethiopia, the processing method applied at an affiliated washing station with Zoebar's direct operational oversight, the harvest period, and the quality assessment made before the lot was released. Grade, screen size, moisture and cupping score are recorded on each lot rather than published as a standing figure, and none is filled with an estimate.",
  },
  {
    question: "Does Zoebar publish cupping scores and grades?",
    answer:
      "Zoebar records grade, screen size, moisture and cupping score on each lot and shows them on that lot rather than as a single figure for the origin. A lot's figures are published once confirmed, never as an indicative range, because a buyer comparing suppliers on a cupping score should be comparing a number the supplier actually stated.",
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
