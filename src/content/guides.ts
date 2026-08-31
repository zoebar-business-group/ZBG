import type { QA } from "@/components/primitives/Answer";
import { ORIGIN, altitudeBand, harvestWindow } from "@/lib/org";
import { countWords, readingMinutes, type Section } from "./blocks";

/**
 * GUIDES — reference articles for green coffee buyers (Strategy 4.2)
 * ----------------------------------------------------------------------------
 * The first four are the pillars fixed by Strategy 4.2: grading, the harvest
 * and shipping calendar, import documentation, Incoterms. Added since, as the
 * questions kept coming: the buyer's process end to end, payment terms and
 * trade finance, and container loading — the mechanics a first-time buyer asks
 * about once the pillars are understood.
 *
 * These are trade reference documents, not marketing pages. They exist because
 * the buyer questions they answer are searched constantly and answered badly.
 *
 * TWO SEPARATE STANDARDS APPLY HERE, AND THEY MUST NOT BE CONFUSED.
 *
 *   1. General trade information — grading structures, Incoterms rules,
 *      documentation sets — is public reference material and may be explained.
 *      Where a figure varies by regulator, contract or revision (defect
 *      allowances, tariff lines, EUDR application dates), the guide says so and
 *      tells the reader where the authoritative version lives. It never states
 *      a number more precisely than the source supports.
 *
 *   2. Anything about ZOEBAR'S OWN coffee obeys the trust rule without
 *      exception: it comes from `org.ts`, or it renders as pending. A guide is
 *      not a loophole for publishing a specification the client has not
 *      confirmed.
 *
 * Each guide is answer-first (Strategy 5.2): an H2 phrased as the buyer's
 * question, a self-contained 40-60 word answer beneath it, then the depth.
 * Each cross-links to /coffee and /amaro inside the first three paragraphs
 * (Strategy 4.4).
 */

export interface Guide {
  slug: string;
  /** H1. */
  title: string;
  /** Short label for indexes, navigation and cross-links. */
  navTitle: string;
  /** Meta description and index summary. */
  description: string;
  /** The answer-first H2 - the buyer's question, phrased as they ask it. */
  question: string;
  /** 40-60 words, self-contained, quotable without surrounding context. */
  answer: string;
  /** Verified metadata strip beneath the lede. */
  meta: Array<{ term: string; detail: string }>;
  sections: Section[];
  faqs: QA[];
  /**
   * Authoring dates. These are real: the date the guide was written and last
   * revised. They are not a proxy for anything else, and a guide that is
   * substantively rewritten gets a new `dateModified` - not a refreshed one to
   * look current.
   */
  datePublished: string;
  dateModified: string;
}

const AUTHORED = "2026-08-22";
/** Second batch — the buyer-process, payment and container guides. */
const AUTHORED_2 = "2026-08-27";

/* ============================================================================
   1 - GRADING
   ========================================================================== */

const GRADING: Guide = {
  slug: "ethiopian-coffee-grading",
  navTitle: "Ethiopian coffee grading",
  title: "Ethiopian coffee grading, explained.",
  description:
    "How Ethiopian green coffee is graded: what Grade 1 to Grade 9 measures, who issues the grade, how screen size, moisture and defect count fit together, and why a grade is not a cup score.",
  question: "How is Ethiopian coffee graded?",
  answer:
    "Ethiopian green coffee is graded from Grade 1 to Grade 9, plus Under Grade, by combining a raw physical assessment (principally defect count in a sample, alongside screen size and moisture) with a cup evaluation. Grades 1 and 2 form the specialty band. The grade is issued on an export certificate, not asserted by the exporter.",
  meta: [
    { term: "Scale", detail: "Grade 1 – Grade 9, plus UG" },
    { term: "Specialty band", detail: "Grades 1 and 2" },
    { term: "Assessed on", detail: "Raw defects and cup" },
    { term: "Issued by", detail: "National grading authority" },
  ],
  sections: [
    {
      id: "what-the-grade-measures",
      heading: "What an Ethiopian grade actually measures",
      blocks: [
        {
          kind: "p",
          text: "An Ethiopian coffee grade is a composite. It is not a score for how the coffee tastes, and it is not a size classification. It is the outcome of two separate assessments run on the same sample: a raw, or physical, evaluation of the green bean, and a liquoring, or cup, evaluation. Both feed one number, which is why two coffees that taste quite different can carry the same grade, and why a coffee can cup beautifully and still be held back by its raw score.",
        },
        {
          kind: "p",
          text: "The raw assessment counts defects. Blacks, sours, pods, insect damage, foreign matter and broken beans are identified in a weighed sample and converted into a defect count using an equivalence table, so that several partial defects add up to one full defect. Screen size distribution and moisture content are recorded alongside it. The cup assessment scores the brewed liquor for cleanliness, acidity, body and flavour, and records the presence of any cup fault.",
        },
        {
          kind: "p",
          text: "This matters commercially because the two halves fail differently. A raw defect problem is usually a sorting or drying problem and is visible in the sack. A cup fault is usually a fermentation or storage problem and is invisible until you brew it. When you buy Ethiopian coffee (including the washed and natural lots described on [our coffee page](/coffee), grown in [Amaro](/amaro)) you are buying both results, and you should ask to see both.",
        },
      ],
    },
    {
      id: "the-scale",
      heading: "The scale, band by band",
      blocks: [
        {
          kind: "p",
          text: "Ethiopian export grades run from Grade 1 at the top to Grade 9, with coffee falling below the bottom of the scale classified as Under Grade and generally directed away from export. The bands are conventionally read as follows.",
        },
        {
          kind: "table",
          caption: "Ethiopian grade bands, as read commercially",
          head: ["Band", "Grades", "How the trade treats it"],
          rows: [
            [
              "Specialty",
              "1 – 2",
              "The band specialty roasters buy from. Low defect counts and a clean cup. Grade 1 is comparatively scarce.",
            ],
            [
              "Premium / mainstream export",
              "3 – 5",
              "Sound commercial export coffee. Higher defect allowances; the cup is expected to be clean but is not the selling point.",
            ],
            [
              "Commercial",
              "6 – 9",
              "Lower grades, typically bought on price and blended. Rarely offered as a single-origin lot.",
            ],
            [
              "Under Grade",
              "UG",
              "Below the export scale. Directed to domestic consumption rather than export.",
            ],
          ],
        },
        {
          kind: "p",
          text: "What the bands do not tell you is the exact defect allowance behind each number. Those thresholds are set by the national grading authority, differ between washed and natural coffee, and have been revised over time. Any table on a supplier's website that states them as fixed constants is quoting a snapshot, and possibly an old one.",
        },
        {
          kind: "note",
          text: "Read the defect count on the certificate, not the grade on the offer sheet. The grade is a band; the count is the measurement. If the certificate is not offered, that is itself a piece of information.",
        },
      ],
    },
    {
      id: "who-issues-the-grade",
      heading: "Who issues the grade",
      blocks: [
        {
          kind: "p",
          text: "The grade on an Ethiopian export document is issued by the national coffee authority's liquoring and inspection function. It is not assigned by the exporter, and it is not the buyer's own cupping table. Export shipments require a quality certificate from that authority, and the grade recorded on it is the grade that governs the contract.",
        },
        {
          kind: "p",
          text: "For much of the last two decades the Ethiopia Commodity Exchange (ECX) sat at the centre of this system, taking delivery of coffee, grading it and selling it through auction. That structure achieved price transparency and a reliable clearing mechanism, but it pooled coffee by grade and catchment, which severed the link between a specific farm or washing station and the bag that arrived at destination.",
        },
        {
          kind: "p",
          text: "Reforms from 2017 changed the route. Vertically integrated operators (growers, cooperatives and exporters who control their own supply) were permitted to export directly rather than through the auction, provided traceability is maintained. This is what makes single-station and single-lot Ethiopian coffee possible at all, and it is the reason a station-level record is worth asking for by name.",
        },
        {
          kind: "p",
          text: "Zoebar has direct operational oversight of an affiliated washing station in Amaro, which places cherry intake, processing method, drying and lot formation under direct management rather than sourced through an intermediary. How that record is carried through to the bag is set out in [traceability](/traceability), and the stage-by-stage sequence is in [process](/process).",
        },
      ],
    },
    {
      id: "screen-moisture-defects",
      heading: "Screen size, moisture and defect count",
      blocks: [
        {
          kind: "p",
          text: "These three specifications appear on almost every green coffee contract and are frequently confused with the grade itself. They are inputs to it, and they are also contract terms in their own right, enforceable separately from the grade.",
        },
        { kind: "h3", text: "Screen size" },
        {
          kind: "p",
          text: "Screen size is bean size, measured in sixty-fourths of an inch and expressed as the screen a bean is retained on: a screen 16 bean sits above a 16/64-inch perforation. Contracts are usually written as a minimum screen with a stated tolerance for the percentage permitted to pass below it. Larger screens do not mean better coffee. They mean more uniform roasting behaviour, which is why roasters specify them.",
        },
        { kind: "h3", text: "Moisture content" },
        {
          kind: "p",
          text: "Moisture is the percentage of water remaining in the green bean. Too high and the coffee is exposed to mould growth and rapid staling in transit; too low and it has usually been over-dried, which flattens the cup and loses weight the seller has already paid to produce. Green coffee contracts specify a maximum, and the figure that binds is the one written into your contract and measured at the agreed point, not a general industry range quoted from a website.",
        },
        { kind: "h3", text: "Defect count" },
        {
          kind: "p",
          text: "Defects are identified in a weighed sample and totalled using a full-defect equivalence table, so that a number of minor defects convert into one full defect. Because the equivalence table and the sample size are both set by the grading standard in force, a defect count is only comparable against another count taken under the same standard. Comparing an Ethiopian raw score directly against a Brazilian or Colombian one is a category error, not a shortcut.",
        },
      ],
    },
    {
      id: "grade-versus-cup-score",
      heading: "A grade is not a cup score",
      blocks: [
        {
          kind: "p",
          text: "The most common misreading in Ethiopian coffee buying is treating the grade and the SCA cup score as the same measurement expressed differently. They are not. They are produced by different people, under different protocols, for different purposes.",
        },
        {
          kind: "ul",
          items: [
            "The grade is a regulatory export classification combining raw defects and a cup evaluation, issued by the national authority and recorded on the export certificate.",
            "An SCA cup score is a 100-point sensory evaluation against the Specialty Coffee Association protocol, where 80 points and above is designated specialty.",
            "A grade travels on the export certificate. A cup score travels on a cupping form, and whose form it is matters as much as the number on it.",
          ],
        },
        {
          kind: "p",
          text: "A coffee can therefore be Grade 2 and cup at 86, or Grade 2 and cup at 82. The grade sets the floor; the cup score is the differentiation above it. When a supplier quotes only one of the two, they have chosen which number flatters the lot. Ask for both, and ask who cupped it and when.",
        },
        {
          kind: "pending",
          label: "Zoebar grade and cupping band",
          perLot: true,
          text: "Zoebar's grade, screen size, moisture and cupping score are recorded on each lot rather than published as a standing figure, and appear on the specification table on [our coffee page](/coffee) and on each lot record. Defect count is being verified.",
        },
      ],
    },
    {
      id: "reading-an-offer",
      heading: "Reading a grade on an offer sheet",
      blocks: [
        {
          kind: "p",
          text: "A complete Ethiopian offer should let you reconstruct the coffee without a phone call. Working through it in this order surfaces an incomplete offer quickly, and the gaps are usually more informative than the entries.",
        },
        {
          kind: "ol",
          items: [
            "Origin, stated to zone level, and whether that zone is the growing area or the trading category. These are frequently not the same thing.",
            "Processing method (washed or natural) stated per lot rather than for the offer as a whole.",
            "Harvest year and harvest window, so you know the age of the coffee at arrival rather than at offer.",
            "Grade, with the issuing certificate available on request.",
            "Screen size specification, with its tolerance.",
            "Moisture content, with the point of measurement named.",
            "Defect count, and the standard it was counted under.",
            "Cup score, with the cupper and protocol identified.",
            "Packing, lot quantity and the number of bags in the lot.",
            "Incoterms rule and named place, which decide what the price actually includes.",
          ],
        },
        {
          kind: "p",
          text: "The last point is the one that most often derails a first shipment, and it is covered in the [Incoterms guide](/guides/incoterms-green-coffee). The documents you will need once terms are agreed are set out in the [importer's documentation checklist](/guides/import-documentation-checklist), and the timing of all of it against the crop year is in the [harvest and shipping calendar](/guides/harvest-and-shipping-calendar).",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is the highest grade of Ethiopian coffee?",
      answer:
        "Grade 1 is the highest Ethiopian export grade. The scale runs from Grade 1 down to Grade 9, with coffee below the scale classified as Under Grade. Grades 1 and 2 together form the band the specialty trade buys from. The grade combines a raw defect assessment with a cup evaluation of the same sample.",
    },
    {
      question: "Is an Ethiopian grade the same as an SCA cup score?",
      answer:
        "No. An Ethiopian grade is a regulatory export classification combining raw defect count with a cup evaluation, issued by the national coffee authority. An SCA cup score is a separate 100-point sensory evaluation against the Specialty Coffee Association protocol, where 80 points and above is designated specialty. A lot carries both, and they measure different things.",
    },
    {
      question: "Who issues the grade on Ethiopian export coffee?",
      answer:
        "The grade is issued by Ethiopia's national coffee authority through its liquoring and inspection function, and recorded on the export quality certificate required for shipment. It is not assigned by the exporter. A buyer should ask to see the certificate rather than accept a grade stated on an offer sheet alone.",
    },
  ],
  datePublished: AUTHORED,
  dateModified: AUTHORED,
};

/* ============================================================================
   2 - HARVEST AND SHIPPING CALENDAR
   ========================================================================== */

const CALENDAR: Guide = {
  slug: "harvest-and-shipping-calendar",
  navTitle: "Harvest & shipping calendar",
  title: "The Ethiopian harvest and shipping calendar.",
  description:
    "When Ethiopian coffee is harvested, how long post-harvest processing, milling, grading and export documentation take, why shipments move overland to Djibouti, and how to plan a contract against the crop year.",
  question: "When is Ethiopian coffee harvested, and when does it arrive?",
  answer: `Ethiopia's Arabica harvest runs approximately October to January nationally; in ${ORIGIN.name} (${ORIGIN.zone}, commonly presented within the broader Sidama category) it runs approximately ${harvestWindow()}. Cherry is then processed, dried, rested, milled, graded and certified before export moves overland to Djibouti, Ethiopia's principal port corridor. Arrival at destination commonly falls in the first half of the following year.`,
  meta: [
    { term: "Amaro harvest", detail: harvestWindow() },
    { term: "Ethiopia, broadly", detail: "October – January" },
    { term: "Port corridor", detail: "Overland to Djibouti" },
    { term: "Altitude", detail: `${altitudeBand()} masl` },
  ],
  sections: [
    {
      id: "harvest-window",
      heading: "The harvest window, and why it moves",
      blocks: [
        {
          kind: "p",
          text: `Ethiopia's main Arabica harvest runs approximately October to January, but that national window is an average across a country with enormous variation in altitude, latitude and rainfall pattern. The window that matters is the one for the specific growing area you are buying from. In ${ORIGIN.name}, the harvest runs approximately ${harvestWindow()}, at ${altitudeBand()} metres above sea level. ${ORIGIN.categoryNote} The origin is described in full on [the Amaro page](/amaro).`,
        },
        {
          kind: "p",
          text: "Altitude is the main driver of the shift. Higher-grown coffee matures more slowly and picks later, which is why two areas a short distance apart can be weeks out of step. Rainfall timing shifts the window year to year, and a late or interrupted rain can both delay picking and stretch it, because cherry ripens unevenly and pickers pass through the same trees repeatedly.",
        },
        {
          kind: "p",
          text: "For a buyer, the practical consequence is that a harvest window is a planning input, not a delivery promise. Contracting against \"new crop\" without naming the growing area, the harvest year and the point at which the coffee is expected to be ready leaves the most important variable unstated. The washed and natural lots on [our coffee page](/coffee) are recorded per lot for exactly this reason.",
        },
      ],
    },
    {
      id: "post-harvest",
      heading: "From cherry to exportable green",
      blocks: [
        {
          kind: "p",
          text: "Picking is the start of the calendar, not the end of it. Between the last cherry picked and a container leaving the country sits a sequence of operations, each of which takes real time and none of which can be safely compressed.",
        },
        {
          kind: "ol",
          items: [
            "Intake and sorting. Cherry is delivered to the washing station within hours of picking and separated by density and defect before processing begins.",
            "Processing. Washed lots have the fruit removed before drying; natural lots dry whole with the fruit intact. The method is decided and recorded per lot.",
            "Drying. Parchment or cherry is dried, typically on raised beds, turned regularly and monitored down to target moisture. Natural lots take substantially longer than washed lots because there is far more water in the fruit to remove.",
            "Resting, or conditioning. Dried parchment is held in store to allow moisture to equalise through the bean before hulling. Milling too early produces uneven, unstable green.",
            "Hulling and milling. Parchment or dried cherry is removed, and the green is cleaned, screened, density-sorted and in many cases colour-sorted.",
            "Grading and certification. A sample goes to the national authority for the raw and cup assessment that produces the export grade.",
            "Bagging, lot formation and export documentation.",
          ],
        },
        {
          kind: "p",
          text: "Zoebar runs stages one through six at an affiliated washing station in Amaro, and the full sequence with its operational detail is set out on [the process page](/process). Because the station is run with Zoebar's direct operational oversight rather than contracted out, the dates attached to each stage are an operational record rather than a report passed on from a third party.",
        },
        {
          kind: "pending",
          label: "Stage durations and lead times",
          text: "Zoebar's stage timings, milling schedule and export lead times are being verified. They are not published as indicative ranges, because a buyer planning a roasting calendar against an estimate is planning against a number Zoebar never committed to.",
        },
      ],
    },
    {
      id: "the-djibouti-corridor",
      heading: "The Djibouti corridor",
      blocks: [
        {
          kind: "p",
          text: "Ethiopia is landlocked. Every container of Ethiopian coffee therefore has an inland leg before it has an ocean leg, and the overwhelming majority of it moves overland to the Port of Djibouti, the country's principal maritime gateway. This single fact reshapes how Ethiopian coffee contracts should be read.",
        },
        {
          kind: "ul",
          items: [
            "The inland leg is long, and it is exposed to road conditions, customs processing at the border and container availability, none of which behave like a berth window at a coastal port.",
            "Because there is no Ethiopian sea port, a term such as FOB is always FOB at a foreign port, which means the seller has already carried the coffee across an international border before risk transfers.",
            "Container availability at the inland origin can be the binding constraint during the peak export period, when the whole crop is moving at once.",
          ],
        },
        {
          kind: "p",
          text: "This is why the named place in an Incoterms rule matters as much as the rule itself for Ethiopian coffee, and why FCA at a named inland point and FOB Djibouti allocate cost and risk very differently despite both being routine in the trade. The [Incoterms guide](/guides/incoterms-green-coffee) works through the consequences in detail.",
        },
      ],
    },
    {
      id: "ocean-leg",
      heading: "The ocean leg and arrival",
      blocks: [
        {
          kind: "p",
          text: "Once loaded, transit time depends on the destination, the service and the number of transhipments. Coffee moving to European and Middle Eastern destinations is generally a shorter run than coffee moving to North America or East Asia, and a service with a transhipment can add materially to the door-to-door time without any single leg looking unusual.",
        },
        {
          kind: "p",
          text: "Working backwards from a harvest that finishes in December: processing, drying and resting occupy the following weeks, milling and certification follow, and export documentation is prepared against a nominated vessel. New-crop Ethiopian coffee therefore commonly reaches destination warehouses during the first half of the following calendar year. Arrivals earlier than that are usually early-harvest lots; arrivals later are usually stock held at origin.",
        },
        {
          kind: "note",
          text: "Ask when the coffee was milled, not only when it was harvested. Coffee held in parchment ages far more slowly than milled green. Two lots from the same harvest can be in materially different condition at the same arrival date.",
        },
      ],
    },
    {
      id: "planning-a-contract",
      heading: "Planning a contract against the calendar",
      blocks: [
        {
          kind: "p",
          text: "The calendar becomes useful when it is turned into contract terms. Four decisions carry most of the risk.",
        },
        { kind: "h3", text: "Name the shipment period, not the arrival date" },
        {
          kind: "p",
          text: "A seller controls when a container is delivered to the carrier. A seller does not control the vessel schedule, the transhipment or the destination port's working. Contracts are conventionally written against a shipment period for this reason, and a buyer who insists on a guaranteed arrival date is asking the seller to price in a risk neither party controls.",
        },
        { kind: "h3", text: "Fix approval of the sample before shipment" },
        {
          kind: "p",
          text: "Decide explicitly which sample governs: the pre-shipment sample drawn from the actual lot, or an earlier offer sample. Write in the approval window and what happens if it lapses. This is the single most common source of dispute in a first shipment.",
        },
        { kind: "h3", text: "Decide where quality and weight are determined" },
        {
          kind: "p",
          text: "Quality and weight can be determined at origin, at destination, or by an independent inspection at a named point. Each allocates the transit risk differently, and each produces a different answer when a shipment arrives out of specification. Name the point and the inspector in the contract.",
        },
        { kind: "h3", text: "Align the roasting plan to the milling date" },
        {
          kind: "p",
          text: "If freshness matters to your programme, the milling date is the clock that matters. Build your intake schedule around it and around the storage conditions between milling and arrival, rather than around the harvest year printed on the bag.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "When is the Ethiopian coffee harvest?",
      answer: `Ethiopia's main Arabica harvest runs approximately October to January, varying by growing area, altitude and rainfall. In ${ORIGIN.name}, recently named as ${ORIGIN.zone} and commonly presented within the broader Sidama category, the harvest runs approximately ${harvestWindow()} at ${altitudeBand()} metres above sea level. Higher-altitude areas mature more slowly and are generally picked later in the window.`,
    },
    {
      question: "Which port does Ethiopian coffee ship from?",
      answer:
        "Ethiopia is landlocked, so its coffee moves overland before it moves by sea. The Port of Djibouti is the principal maritime corridor for Ethiopian exports. Every Ethiopian coffee contract therefore includes an inland leg, which is why the named place in the Incoterms rule matters as much as the rule itself.",
    },
    {
      question: "When does new-crop Ethiopian coffee arrive at destination?",
      answer:
        "New-crop Ethiopian coffee commonly reaches destination warehouses during the first half of the calendar year following the harvest, after processing, drying, resting, milling, grading, certification, the overland leg to Djibouti and the ocean voyage. Exact timing depends on the growing area, the milling schedule and the shipping service used.",
    },
  ],
  datePublished: AUTHORED,
  dateModified: AUTHORED,
};

/* ============================================================================
   3 - IMPORT DOCUMENTATION
   ========================================================================== */

const DOCUMENTATION: Guide = {
  slug: "import-documentation-checklist",
  navTitle: "Importer's documentation checklist",
  title: "The importer's documentation checklist.",
  description:
    "Every document a green coffee import from Ethiopia typically requires: contract, commercial set, certificate of origin, ICO certificate, phytosanitary certificate, export grading certificate, inspection reports and the EU deforestation due diligence statement.",
  question: "What documents do I need to import Ethiopian green coffee?",
  answer:
    "An Ethiopian green coffee import typically requires a signed sales contract, a commercial invoice, a packing and weight list, the transport document, a certificate of origin, an ICO certificate of origin, a phytosanitary certificate and the export grading certificate. EU importers additionally need a deforestation-regulation due diligence statement with plot geolocation data.",
  meta: [
    { term: "Document sets", detail: "Contract, commercial, regulatory" },
    { term: "Issued at origin", detail: "Most regulatory documents" },
    { term: "EU-specific", detail: "EUDR due diligence statement" },
    { term: "Verify against", detail: "Your customs authority" },
  ],
  sections: [
    {
      id: "two-document-sets",
      heading: "There are two document sets, not one",
      blocks: [
        {
          kind: "p",
          text: "New importers tend to treat documentation as a single pile that arrives with the shipment. It is more useful to separate it into two: the contract set, which defines what you agreed and governs any dispute, and the shipment set, which moves the goods and clears them. They are prepared at different times by different parties, and a gap in the first is far more expensive than a gap in the second.",
        },
        {
          kind: "p",
          text: "The contract set is agreed before anything moves. The shipment set is produced at origin around loading, and a substantial part of it is issued by authorities rather than by the seller, which means it is not something a seller can simply promise to provide faster. Contracts for the washed and natural lots described on [our coffee page](/coffee) name which documents are supplied and when.",
        },
        {
          kind: "p",
          text: "One document deserves attention before all the others: the sales contract. Green coffee is conventionally traded on standard-form contracts published by trade associations, which carry an established set of definitions, tolerances and arbitration provisions. Buying on a bare purchase order instead means every one of those terms is left open, and the first shipment is exactly when that becomes apparent. The origin behind the coffee is described on [the Amaro page](/amaro).",
        },
      ],
    },
    {
      id: "commercial-documents",
      heading: "The commercial documents",
      blocks: [
        { kind: "h3", text: "Sales contract" },
        {
          kind: "p",
          text: "The governing document. It should name the coffee, the harvest year, the quality basis and the sample that governs, the quantity and tolerance, the price and currency, the Incoterms rule and named place, the shipment period, the payment terms, and the arbitration rules that apply. A trade-association standard form supplies most of this by reference.",
        },
        { kind: "h3", text: "Commercial invoice" },
        {
          kind: "p",
          text: "The seller's invoice, and the basis on which customs values the consignment. It must be consistent with the contract, the packing list and the transport document, inconsistencies between these three are one of the most common causes of a delayed clearance.",
        },
        { kind: "h3", text: "Packing list and weight note" },
        {
          kind: "p",
          text: "Bag count, bag type, net and gross weights, and marks. Coffee is bought on weight, so this document is doing commercial work as well as logistical work. Where weight is determined at destination, the contract should say who weighs, where, and what tolerance applies before a claim arises.",
        },
        { kind: "h3", text: "Transport document" },
        {
          kind: "p",
          text: "A bill of lading for sea freight, or the equivalent waybill for other modes. It evidences the contract of carriage and, in the case of a negotiable bill of lading, controls the right to take delivery. Under a letter of credit its exact form is not a detail, it is the instrument the bank pays against.",
        },
        { kind: "h3", text: "Insurance certificate" },
        {
          kind: "p",
          text: "Required where the seller insures, under CIF or CIP. Note that the minimum cover the two rules require is not the same, which is covered in the [Incoterms guide](/guides/incoterms-green-coffee).",
        },
      ],
    },
    {
      id: "origin-documents",
      heading: "The origin and regulatory documents",
      blocks: [
        { kind: "h3", text: "Certificate of origin" },
        {
          kind: "p",
          text: "Evidences the country in which the goods originate, and is used in customs clearance and in any preferential tariff claim. Issued at origin by the competent chamber or authority.",
        },
        { kind: "h3", text: "ICO certificate of origin" },
        {
          kind: "p",
          text: "Coffee-specific. The International Coffee Organization operates a certificate of origin system for coffee exported from member producing countries, and consignments carry ICO identification marks. Whether your import requires it, and in what form, depends on the arrangements applying to the exporting and importing countries, confirm the current requirement with your customs broker rather than assuming.",
        },
        { kind: "h3", text: "Phytosanitary certificate" },
        {
          kind: "p",
          text: "Issued by the plant health authority at origin, certifying that the consignment has been inspected and meets the importing country's plant health requirements. Green coffee is a plant product, and this document is a routine condition of entry in most markets.",
        },
        { kind: "h3", text: "Export grading certificate" },
        {
          kind: "p",
          text: "The quality certificate issued by Ethiopia's national coffee authority, carrying the grade assigned to the lot. This is the authoritative record of the grade, as explained in [the grading guide](/guides/ethiopian-coffee-grading). Ask for it by name; a grade stated only on an offer sheet is a claim rather than a certificate.",
        },
        { kind: "h3", text: "Fumigation or treatment certificate" },
        {
          kind: "p",
          text: "Required in some markets and for some packaging, and occasionally required for the wooden dunnage or pallets rather than the coffee itself. Confirm before shipment, because retrospective treatment at destination is disruptive and expensive.",
        },
      ],
    },
    {
      id: "eudr",
      heading: "The EU deforestation regulation",
      blocks: [
        {
          kind: "p",
          text: "Coffee is within the scope of the EU deforestation regulation, which requires operators placing covered commodities on the EU market to exercise due diligence and to submit a due diligence statement. In practice this shifts a documentation burden upstream to origin, because the information the statement requires can only be produced where the coffee is grown.",
        },
        {
          kind: "ul",
          items: [
            "Geolocation data for the plots of land where the coffee was produced, at the precision the regulation specifies.",
            "Information sufficient to demonstrate the coffee is deforestation-free under the regulation's definition and produced in accordance with the relevant legislation of the producing country.",
            "A documented risk assessment, and risk mitigation where the assessment is not conclusive.",
            "A due diligence statement submitted through the EU information system before the goods are placed on the market.",
          ],
        },
        {
          kind: "note",
          text: "The application timetable for this regulation has been amended more than once since it entered into force, and obligations differ for large operators, SMEs and traders. Confirm the current dates and your own classification with your national competent authority before contracting. Do not rely on a date quoted on any supplier's website, including this one.",
        },
        {
          kind: "p",
          text: "Practically, this makes plot-level traceability a compliance input rather than a marketing feature. A supplier who cannot connect a bag to the plots it came from cannot supply what an EU operator needs to file. Zoebar's approach to the lot record is set out on [the traceability page](/traceability).",
        },
        {
          kind: "pending",
          label: "Zoebar traceability depth and certifications",
          text: "The depth to which Zoebar lots are traced, and any certifications held, are being verified and are not published as claims. Buyers with a compliance requirement should raise it directly in an enquiry so the answer given is the confirmed one.",
        },
      ],
    },
    {
      id: "quality-and-safety",
      heading: "Quality, food safety and contractual limits",
      blocks: [
        {
          kind: "p",
          text: "Beyond the shipping documents sit the limits your own market and your own customers impose. These are contract terms, and they need to be written down before shipment rather than discovered after arrival.",
        },
        {
          kind: "ul",
          items: [
            "Moisture maximum, and the point and method of measurement.",
            "Defect count and the grading standard it is counted under.",
            "Cup quality basis, and which sample governs approval.",
            "Contaminant and residue limits applicable in the importing market, including mycotoxin and pesticide residue rules, which differ by jurisdiction and are revised.",
            "Packaging requirements, including any liner specification.",
          ],
        },
        {
          kind: "p",
          text: "The regulatory limits in this list are set by the importing market, not by the seller, and they change. Verify the version in force for your market at the time of import, a limit that was correct in a previous season is not a defence.",
        },
      ],
    },
    {
      id: "duties-and-entry",
      heading: "Duties and customs entry",
      blocks: [
        {
          kind: "p",
          text: "Green, unroasted, non-decaffeinated coffee is classified separately from roasted and decaffeinated coffee, and in several major markets it attracts a low or zero import duty where roasted coffee does not. That difference is real and worth understanding, but the applicable rate depends on the tariff line, the country of origin, any preferential arrangement in force, and the version of the tariff schedule current at the time of entry.",
        },
        {
          kind: "note",
          text: "Confirm the classification and the rate against your own customs authority's current tariff schedule, with your broker, for your specific consignment. Duty rates and preference arrangements are jurisdiction-specific and change; this guide does not state a rate for that reason.",
        },
        {
          kind: "p",
          text: "Alongside duty, budget for the charges that are not duty and are frequently forgotten at quotation stage: terminal handling, customs clearance and entry fees, any inspection or sampling ordered at the border, transport from port to warehouse, and warehousing itself. Under some Incoterms rules several of these fall to the buyer even though the price looked like it covered delivery.",
        },
      ],
    },
    {
      id: "checklist",
      heading: "The checklist",
      blocks: [
        {
          kind: "table",
          caption: "Green coffee import documentation, who issues what",
          head: ["Document", "Issued by", "Purpose"],
          rows: [
            ["Sales contract", "Buyer and seller", "Governs quality, quantity, terms and dispute resolution"],
            ["Commercial invoice", "Seller", "Customs valuation and payment"],
            ["Packing list / weight note", "Seller", "Bag count, marks, net and gross weights"],
            ["Bill of lading or waybill", "Carrier", "Contract of carriage; controls delivery"],
            ["Insurance certificate", "Insurer", "Required where the seller insures (CIF, CIP)"],
            ["Certificate of origin", "Authority at origin", "Country of origin for customs and preference"],
            ["ICO certificate of origin", "Authority at origin", "Coffee-specific origin certification"],
            ["Phytosanitary certificate", "Plant health authority at origin", "Plant health condition of entry"],
            ["Export grading certificate", "National coffee authority", "The authoritative grade for the lot"],
            ["Weight and quality inspection", "Independent inspector", "Evidence at the agreed determination point"],
            ["Fumigation / treatment certificate", "Treatment provider", "Where required by the destination market"],
            ["EUDR due diligence statement", "The EU operator", "Filed before placing goods on the EU market"],
          ],
        },
        {
          kind: "p",
          text: "Use it as a conversation opener rather than a form. A supplier's answer to \"which of these do you supply, and when in the shipment cycle?\" tells you more about how they operate than a specification sheet does. When you are ready to put that question to Zoebar, [request a quote](/request-quote).",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What documents are needed to import green coffee from Ethiopia?",
      answer:
        "A typical Ethiopian green coffee import requires a sales contract, commercial invoice, packing and weight list, bill of lading or waybill, certificate of origin, ICO certificate of origin, phytosanitary certificate and the export grading certificate issued by Ethiopia's national coffee authority. EU importers also file a deforestation-regulation due diligence statement.",
    },
    {
      question: "Does the EU deforestation regulation apply to coffee?",
      answer:
        "Yes. Coffee is a commodity within the scope of the EU deforestation regulation, so EU operators must carry out due diligence, hold geolocation data for the plots where the coffee was produced, and submit a due diligence statement before placing it on the EU market. Application dates and operator classifications should be confirmed with your national competent authority.",
    },
    {
      question: "What is an ICO certificate of origin?",
      answer:
        "It is a coffee-specific origin document issued under the International Coffee Organization's certificate of origin system for coffee exported from member producing countries, and it is separate from the general certificate of origin used for customs. Consignments carry ICO identification marks. Confirm the requirement applying to your shipment with your customs broker.",
    },
  ],
  datePublished: AUTHORED,
  dateModified: AUTHORED,
};

/* ============================================================================
   4 - INCOTERMS
   ========================================================================== */

const INCOTERMS: Guide = {
  slug: "incoterms-green-coffee",
  navTitle: "Incoterms for green coffee",
  title: "Incoterms 2020 for green coffee buyers.",
  description:
    "The eleven Incoterms 2020 rules applied to green coffee: which are container-appropriate, where risk transfers, who insures under CIF and CIP, what changed in 2020, and why the named place matters for landlocked origins.",
  question: "Which Incoterms rule should a green coffee buyer use?",
  answer:
    "Incoterms 2020 defines eleven rules. For containerised green coffee, FCA, CPT, CIP, CFR and CIF are the practical choices; FOB remains widely used in coffee even though the ICC recommends FCA for container shipments. For a landlocked origin such as Ethiopia, the named place matters as much as the rule itself.",
  meta: [
    { term: "Rules", detail: "11, in two families" },
    { term: "Any mode", detail: "EXW FCA CPT CIP DAP DPU DDP" },
    { term: "Sea only", detail: "FAS FOB CFR CIF" },
    { term: "Container advice", detail: "FCA rather than FOB" },
  ],
  sections: [
    {
      id: "what-a-rule-does",
      heading: "What an Incoterms rule does (and does not) cover",
      blocks: [
        {
          kind: "p",
          text: "An Incoterms rule is a three-letter shorthand, published by the International Chamber of Commerce, for a specific allocation of tasks, costs and risk between seller and buyer. It answers three questions: who arranges and pays for carriage, who bears the risk of loss or damage at each stage, and who handles export and import formalities. It is written into the contract as the rule plus a named place plus the edition, for example \"CIF Hamburg Incoterms 2020\".",
        },
        {
          kind: "p",
          text: "What a rule does not do is at least as important. It does not transfer ownership, it does not set the price, it does not specify payment terms, it does not decide quality or weight determination, and it does not supply a governing law or a dispute mechanism. Those come from your sales contract, which for green coffee is usually a trade-association standard form. A rule quoted without a contract behind it is a shipping instruction pretending to be an agreement.",
        },
        {
          kind: "p",
          text: "For a buyer of Ethiopian green coffee, the rule chosen determines what the quoted price actually includes, and therefore whether two quotations are comparable at all. Before comparing prices for the washed and natural lots described on [our coffee page](/coffee) (grown in [Amaro](/amaro)) establish which rule and named place each quotation is on.",
        },
      ],
    },
    {
      id: "the-eleven-rules",
      heading: "The eleven rules, at a glance",
      blocks: [
        {
          kind: "p",
          text: "The rules divide into two families. Seven apply to any mode or modes of transport, including containerised sea freight with an inland leg. Four apply only to sea and inland waterway transport, and were designed for cargo loaded across a ship's rail rather than sealed into a container at an inland depot.",
        },
        {
          kind: "table",
          caption: "Incoterms 2020, the eleven rules",
          head: ["Rule", "Family", "Risk transfers when", "Carriage paid by", "Seller insures"],
          rows: [
            ["EXW, Ex Works", "Any mode", "Goods placed at buyer's disposal at the seller's premises", "Buyer", "No"],
            ["FCA, Free Carrier", "Any mode", "Goods delivered to the carrier named by the buyer", "Buyer", "No"],
            ["CPT, Carriage Paid To", "Any mode", "Goods handed to the first carrier", "Seller, to destination", "No"],
            ["CIP (Carriage and Insurance Paid To", "Any mode", "Goods handed to the first carrier", "Seller, to destination", "Yes) all-risks cover"],
            ["DAP, Delivered at Place", "Any mode", "Goods at the named place, ready for unloading", "Seller", "No"],
            ["DPU, Delivered at Place Unloaded", "Any mode", "Goods unloaded at the named place", "Seller", "No"],
            ["DDP, Delivered Duty Paid", "Any mode", "Goods at the named place, import cleared", "Seller", "No"],
            ["FAS, Free Alongside Ship", "Sea / inland waterway", "Goods alongside the vessel", "Buyer", "No"],
            ["FOB, Free on Board", "Sea / inland waterway", "Goods on board the vessel", "Buyer", "No"],
            ["CFR, Cost and Freight", "Sea / inland waterway", "Goods on board the vessel", "Seller, to destination port", "No"],
            ["CIF (Cost, Insurance and Freight", "Sea / inland waterway", "Goods on board the vessel", "Seller, to destination port", "Yes) minimum cover"],
          ],
        },
        {
          kind: "note",
          text: "Note the split under CFR, CIF, CPT and CIP: the seller pays carriage to the destination, but risk passes to the buyer much earlier. A buyer who reads \"seller pays freight to Hamburg\" as \"seller carries the risk to Hamburg\" has misread the rule, and will discover it during a claim.",
        },
      ],
    },
    {
      id: "the-container-problem",
      heading: "Sea-only rules and the container problem",
      blocks: [
        {
          kind: "p",
          text: "FAS, FOB, CFR and CIF are drafted around delivery at the ship. Under FOB, CFR and CIF, risk passes when the goods are on board. That model works for bulk and break-bulk cargo handed over at the quay. It fits containerised coffee badly, because a container is packed and sealed at an inland depot days or weeks before it is loaded, and once it is sealed, the seller has no practical control over it while still, under the rule, carrying the risk.",
        },
        {
          kind: "p",
          text: "The ICC's own guidance is that FCA is the appropriate rule where goods are handed over before loading on board, which is the normal case for containers. In practice, coffee has kept FOB alive by convention and by the requirements of banks and letters of credit. Both facts are true at once, and a buyer should know which they are choosing and why.",
        },
        {
          kind: "p",
          text: "Incoterms 2020 addressed the letter-of-credit obstacle directly. Under FCA, the parties may now agree that the buyer instructs the carrier to issue a transport document stating the goods have been loaded on board, which the seller then presents to the bank. This removes the main practical reason coffee sellers gave for preferring FOB over FCA.",
        },
      ],
    },
    {
      id: "insurance",
      heading: "Insurance: CIF and CIP are not equivalent",
      blocks: [
        {
          kind: "p",
          text: "Two rules oblige the seller to insure, and the 2020 edition deliberately separated the level of cover they require.",
        },
        {
          kind: "ul",
          items: [
            "CIF requires the seller to obtain cover complying with a minimum standard, the restricted, named-perils level historically associated with Institute Cargo Clauses (C).",
            "CIP requires the seller to obtain the higher, all-risks level of cover historically associated with Institute Cargo Clauses (A).",
          ],
        },
        {
          kind: "p",
          text: "The distinction was drawn because CIF is normally used for bulk commodities where restricted cover is customary, while CIP is used for containerised and manufactured goods where all-risks cover is expected. Coffee sits awkwardly across that line: it is a commodity, but it moves in containers and it is damaged by exactly the moisture and condensation events that restricted cover may not answer.",
        },
        {
          kind: "p",
          text: "In either case the required cover is a minimum, and the parties may agree more. If your coffee's real exposure is condensation and moisture migration in a container across an equatorial route, the level of cover is not a back-office question, decide it deliberately and record it in the contract.",
        },
      ],
    },
    {
      id: "what-changed-in-2020",
      heading: "What changed in Incoterms 2020",
      blocks: [
        {
          kind: "p",
          text: "The 2020 edition was an evolution of 2010 rather than a rewrite. Four changes matter to a coffee buyer.",
        },
        {
          kind: "ol",
          items: [
            "DAT was renamed DPU (Delivered at Place Unloaded) so the rule is no longer tied to a terminal. It remains the only rule under which the seller must unload at destination.",
            "CIP now requires all-risks insurance cover, while CIF retains the minimum standard. Previously both sat at the minimum.",
            "FCA gained the optional on-board bill of lading arrangement described above, removing the principal letter-of-credit obstacle to using FCA for containers.",
            "FCA, DAP, DPU and DDP now expressly accommodate carriage in the seller's or buyer's own vehicle, rather than assuming a third-party carrier is always engaged.",
          ],
        },
        {
          kind: "note",
          text: "Always state the edition in the contract. \"FOB Djibouti\" without an edition is ambiguous, because the rules have changed between editions and a dispute will turn on which text applies.",
        },
      ],
    },
    {
      id: "landlocked-origin",
      heading: "The named place, and Ethiopia's landlocked reality",
      blocks: [
        {
          kind: "p",
          text: "Ethiopia has no sea port. Coffee leaving the country travels overland (principally to the Port of Djibouti) before any vessel is involved. This makes the named place in an Incoterms rule unusually consequential, because the inland leg it either includes or excludes is long, crosses an international border, and carries real risk.",
        },
        {
          kind: "ul",
          items: [
            "FCA at a named inland point in Ethiopia means the buyer takes over before the overland leg, and carries the border crossing and the road transit.",
            "FOB Djibouti means the seller carries the coffee out of Ethiopia, across the border and into a foreign port before risk passes, a materially larger undertaking than FOB at a domestic port would be.",
            "CFR or CIF to a destination port means the seller arranges and pays the ocean carriage, but risk still passes at the origin port, not at destination.",
            "A delivered rule (DAP, DPU or DDP) moves risk all the way to the named destination, and correspondingly changes the price.",
          ],
        },
        {
          kind: "p",
          text: "Two quotations on the same coffee can differ substantially on price for no reason other than where the named place sits, and a buyer comparing them without normalising for that is comparing different things. The sequence and timing of that overland leg is set out in the [harvest and shipping calendar](/guides/harvest-and-shipping-calendar).",
        },
      ],
    },
    {
      id: "choosing-a-rule",
      heading: "Choosing a rule for a first shipment",
      blocks: [
        {
          kind: "p",
          text: "There is no universally correct rule. There is a rule that matches your capability, and the honest test is what you can actually do.",
        },
        { kind: "h3", text: "If you have no freight capability" },
        {
          kind: "p",
          text: "A delivered rule or a C-rule puts the carriage arrangement with the seller. You pay for it inside the price, and you accept less visibility over routing and cost. For a first shipment this is often the right trade, and it removes the failure mode where a buyer nominates a vessel they do not understand.",
        },
        { kind: "h3", text: "If you have a freight forwarder you trust" },
        {
          kind: "p",
          text: "FCA gives you control of the ocean leg and its cost, with risk passing at a named point you have agreed. This is the rule the ICC recommends for containers, and it usually produces the most transparent cost breakdown.",
        },
        { kind: "h3", text: "If your bank requires an on-board document" },
        {
          kind: "p",
          text: "Use the FCA on-board bill of lading option introduced in Incoterms 2020 rather than defaulting to FOB. It satisfies the bank without adopting a rule drafted for a loading model your cargo does not use.",
        },
        { kind: "h3", text: "Whichever you choose" },
        {
          kind: "p",
          text: "Write the rule, the named place and the edition into the contract in full; agree who insures and at what level; and confirm which party files the import declaration and pays duty. Under DDP that is the seller, and a seller who has not registered in your market cannot perform it.",
        },
        {
          kind: "pending",
          label: "Zoebar Incoterms and port of loading",
          text: "Zoebar's published Incoterms, port of loading, packing and lead times are being verified and are confirmed per contract rather than shown here as indicative terms. [Request a quote](/request-quote) and the terms quoted will be the confirmed ones.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is the difference between FOB and FCA?",
      answer:
        "Under FOB, risk passes when the goods are on board the vessel, and the rule applies only to sea and inland waterway transport. Under FCA, risk passes when the goods are delivered to the carrier named by the buyer, and the rule applies to any mode. The ICC recommends FCA for containerised cargo, because containers are sealed well before loading.",
    },
    {
      question: "Does CIF or CIP give better insurance cover?",
      answer:
        "CIP. Under Incoterms 2020, CIP obliges the seller to obtain all-risks cover, while CIF requires only the restricted, named-perils minimum. Both are minimums that the parties may increase by agreement. For containerised green coffee, where moisture and condensation damage are the real exposures, the level of cover should be decided deliberately.",
    },
    {
      question: "Which Incoterms rule is used for Ethiopian coffee?",
      answer:
        "Ethiopia is landlocked, so coffee moves overland to a foreign port (principally Djibouti) before any ocean leg. FOB at that port and FCA at a named inland point are both routine, and they allocate the overland leg very differently. The named place therefore matters as much as the rule, and both must be stated in the contract with the edition.",
    },
  ],
  datePublished: AUTHORED,
  dateModified: AUTHORED,
};

/* ============================================================================
   5 - THE BUYING PROCESS
   ========================================================================== */

const PROCESS: Guide = {
  slug: "buying-green-coffee-process",
  navTitle: "The buying process",
  title: "Buying green coffee, step by step.",
  description:
    "The full sequence of buying green coffee from origin: enquiry, sample, specification, quotation, contract, payment terms, shipment and delivery, what each stage settles, and where it goes wrong when skipped.",
  question: "What is the process for buying green coffee from Zoebar?",
  answer:
    "The sequence is an enquiry stating volume, grade and destination; a sample request; confirmation of the specification against that sample; a written quotation on a stated Incoterms rule; a sales contract; agreed payment terms; shipment within a named period; and delivery. Each stage settles one variable, and skipping one leaves it unresolved until it becomes a dispute.",
  meta: [
    { term: "First step", detail: "Enquiry with volume and destination" },
    { term: "Approval basis", detail: "A named sample" },
    { term: "Governs the deal", detail: "A written contract" },
    { term: "Timing", detail: "A shipment period, not a date" },
  ],
  sections: [
    {
      id: "the-shape-of-a-purchase",
      heading: "The shape of a green coffee purchase",
      blocks: [
        {
          kind: "p",
          text: "Buying green coffee from origin is a sequence of decisions taken in order, each of which fixes one variable so the next can be taken cleanly. It is not a single transaction. A first-time buyer who treats it as one (a price is agreed, coffee arrives) discovers the missing decisions on arrival, when they are expensive to revisit.",
        },
        {
          kind: "p",
          text: "The variables being settled are, roughly in order: what the coffee is, how it is assessed, what it costs and on what delivery basis, when it moves, how and when it is paid for, and what happens if it arrives out of specification. The coffee itself (the washed and natural lots described on [our coffee page](/coffee), grown in [Amaro](/amaro)) is only the first of these.",
        },
        {
          kind: "p",
          text: "The stages below are common to green coffee buying generally. Where Zoebar's own commercial terms sit within them (sample policy, minimum quantity, lead times, accepted payment methods) those are confirmed per enquiry rather than published, for the reason set out at the end of this guide.",
        },
      ],
    },
    {
      id: "enquiry",
      heading: "The enquiry",
      blocks: [
        {
          kind: "p",
          text: "The first message does most of the work if it carries the right information. An enquiry that states only that a buyer is interested in Ethiopian coffee produces a slow exchange of clarifying questions; one that states the parameters produces a useful reply.",
        },
        {
          kind: "ul",
          items: [
            "The volume you are working toward, even approximately, a bag count, a container count, or an annual figure.",
            "The processing method you want: washed, natural, or both.",
            "The grade or cup profile your market requires.",
            "Your destination port or delivery point, which determines which Incoterms rules are relevant.",
            "Whether you want a firm offer, a sample, or both.",
            "Any grading, moisture, packaging or certification requirement your market or your customers impose.",
          ],
        },
        {
          kind: "p",
          text: "An enquiry is not a commitment, and a reply to one is not a contract. Both sides are establishing whether there is a fit before spending time on samples and paperwork.",
        },
      ],
    },
    {
      id: "the-sample",
      heading: "The sample",
      blocks: [
        {
          kind: "p",
          text: "Coffee is bought on the cup, so a sample stage is standard practice. Two different samples do two different jobs, and confusing them is a common source of dispute.",
        },
        { kind: "h3", text: "The offer sample" },
        {
          kind: "p",
          text: "Representative of a coffee the seller is offering, often drawn from a previous lot of the same profile. It tells you whether the profile is one you want to pursue. It is not, on its own, the coffee you will receive.",
        },
        { kind: "h3", text: "The pre-shipment sample" },
        {
          kind: "p",
          text: "Drawn from the actual lot allocated to your contract, before it ships. This is the sample that should govern approval. The contract should state explicitly which sample governs, how long you have to approve it, and what happens if that window lapses.",
        },
        {
          kind: "p",
          text: "Sample assessment is your own cupping table applying your own protocol. The export grade on the certificate, explained in [the grading guide](/guides/ethiopian-coffee-grading), is a separate regulatory measurement, not a substitute for cupping the lot yourself.",
        },
      ],
    },
    {
      id: "specification-and-quotation",
      heading: "Specification and quotation",
      blocks: [
        {
          kind: "p",
          text: "Once a profile is agreed, the specification is confirmed: origin to zone level, processing method per lot, harvest year and window, grade, screen size and tolerance, moisture maximum and its point of measurement, defect count and the standard it was counted under, cup score with the cupper named, and packaging. A complete specification lets a buyer reconstruct the coffee without a phone call.",
        },
        {
          kind: "p",
          text: "The quotation then attaches a price to that specification, but a price is only comparable against another price on the same basis. A quotation should state the Incoterms rule and named place, the shipment period, the quantity and tolerance, the currency, and how long the offer stands. Two quotations that differ only in named place are not quoting the same thing.",
        },
        {
          kind: "note",
          text: "A quotation is an offer, not an agreement. It becomes binding when it is accepted and written into a contract. Treating an emailed price as a concluded deal is the point at which first shipments most often go wrong.",
        },
      ],
    },
    {
      id: "contract-incoterms-documents",
      heading: "Contract, Incoterms and documents",
      blocks: [
        {
          kind: "p",
          text: "Green coffee is conventionally traded on standard-form contracts published by trade associations, which carry an established set of definitions, tolerances and arbitration provisions. Buying on a bare purchase order leaves every one of those terms open. The contract records the specification, the quantity and tolerance, the price and currency, the Incoterms rule and named place, the shipment period, the payment terms, and the governing arbitration rules.",
        },
        {
          kind: "p",
          text: "The Incoterms rule decides what the price includes and where risk transfers, and for a landlocked origin such as Ethiopia, the named place matters as much as the rule. That is worked through in [the Incoterms guide](/guides/incoterms-green-coffee). The documents the shipment will require, and who issues each, are set out in [the importer's documentation checklist](/guides/import-documentation-checklist). Neither is re-explained here; both are prerequisites to a contract you can actually perform.",
        },
      ],
    },
    {
      id: "payment-shipment-delivery",
      heading: "Payment, shipment and delivery",
      blocks: [
        {
          kind: "p",
          text: "Payment terms allocate the gap between the seller's exposure to non-payment and the buyer's exposure to non-delivery. The instruments used in the trade (advance payment, letters of credit, documentary collections, open account) sit on a spectrum between those two, and are covered in [the payment terms guide](/guides/green-coffee-payment-terms). They are agreed in the contract, separately from the Incoterms rule.",
        },
        {
          kind: "p",
          text: "Shipment is contracted against a period, not a date. A seller controls when a container is handed to the carrier; a seller does not control the vessel schedule, a transhipment, or the destination port's working. The [harvest and shipping calendar](/guides/harvest-and-shipping-calendar) sets out the sequence and its realistic timing against the crop year.",
        },
        {
          kind: "p",
          text: "On arrival, quality and weight are determined at whichever point the contract names (origin, destination, or an independent inspection) and any claim runs under the contract's arbitration rules. A shipment that arrives within specification closes the transaction; one that does not is resolved by the terms agreed before it moved, which is the entire reason those terms are agreed first.",
        },
      ],
    },
    {
      id: "where-zoebar-sits",
      heading: "Where Zoebar's terms sit in this",
      blocks: [
        {
          kind: "p",
          text: "The sequence above is the general one. Zoebar has direct operational oversight of an affiliated washing station in Amaro, which places cherry intake, processing, drying and lot formation under direct management; how that record is carried to the bag is on [the traceability page](/traceability), and the stage-by-stage operations are on [the process page](/process).",
        },
        {
          kind: "pending",
          label: "Zoebar sample policy, minimum order and lead times",
          text: "Zoebar's sample policy, minimum order quantity, production and shipping lead times, and accepted payment terms are being verified and are confirmed per enquiry rather than published as indicative figures. [Request a quote](/request-quote) and the terms quoted will be the confirmed ones.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How do I start buying green coffee from Zoebar?",
      answer:
        "Send an enquiry stating the volume you are working toward, the processing method and grade your market needs, your destination, and whether you want a firm offer or a sample. Zoebar replies with current availability and a specification, and where a figure is still being verified it says so rather than estimating it. The enquiry form is on the request-a-quote page.",
    },
    {
      question: "Can I request a sample before placing an order?",
      answer:
        "Yes, a sample stage is standard in green coffee buying. An offer sample shows whether a profile is worth pursuing; a pre-shipment sample, drawn from the lot allocated to your contract, is the one that should govern approval. The contract should state which sample governs and the approval window before shipment.",
    },
    {
      question: "What is the difference between a quotation and a contract?",
      answer:
        "A quotation is an offer: a price attached to a specification on a stated Incoterms rule, valid for a stated period. A contract is the concluded agreement, usually on a trade-association standard form, recording the specification, quantity, price, delivery basis, shipment period, payment terms and arbitration rules. A quotation binds no one until it is accepted into a contract.",
    },
  ],
  datePublished: AUTHORED_2,
  dateModified: AUTHORED_2,
};

/* ============================================================================
   6 - PAYMENT TERMS AND TRADE FINANCE
   ========================================================================== */

const PAYMENT: Guide = {
  slug: "green-coffee-payment-terms",
  navTitle: "Payment terms & trade finance",
  title: "Payment terms and trade finance for green coffee.",
  description:
    "The payment terms used in green coffee trade (advance payment, letters of credit, documentary collections and open account) what each allocates, how a letter of credit works, and why payment terms are set separately from the Incoterms rule.",
  question: "What payment terms are standard in green coffee trade?",
  answer:
    "Green coffee moves on a spectrum of terms: advance payment, letters of credit, documentary collections (documents against payment or against acceptance), and open account. They allocate the gap between the seller's risk of non-payment and the buyer's risk of non-delivery. Which is used depends on the relationship, the sums involved, and each side's bank.",
  meta: [
    { term: "The spectrum", detail: "Advance payment to open account" },
    { term: "Bank-guaranteed", detail: "Letter of credit only" },
    { term: "Set by", detail: "The contract, not Incoterms" },
    { term: "Pivot document", detail: "The transport document" },
  ],
  sections: [
    {
      id: "what-payment-terms-allocate",
      heading: "What payment terms allocate",
      blocks: [
        {
          kind: "p",
          text: "Every cross-border sale contains a gap in trust. The seller ships before being paid, or the buyer pays before receiving the goods; someone is exposed first. Payment terms are the mechanism for allocating that exposure, and trade finance instruments are the tools for narrowing it.",
        },
        {
          kind: "p",
          text: "For green coffee the exposure is real on both sides. The buyer is committing significant sums against a commodity they cannot inspect until it arrives, the washed and natural lots on [our coffee page](/coffee), grown in [Amaro](/amaro), are cupped from samples, not from the container. The seller is shipping a perishable agricultural product across an international border, after which recovering unpaid goods is impractical.",
        },
        {
          kind: "p",
          text: "The terms below run from most seller-protective to most buyer-protective. New trading relationships typically start nearer the seller-protective end and move along the spectrum as a track record is built. None of it is set by the Incoterms rule, a point this guide returns to at the end.",
        },
      ],
    },
    {
      id: "the-spectrum",
      heading: "The spectrum, term by term",
      blocks: [
        {
          kind: "table",
          caption: "Green coffee payment terms, most to least seller-protective",
          head: ["Term", "Who is exposed", "Typically used when"],
          rows: [
            [
              "Advance payment, full or part",
              "Buyer, pays before shipment",
              "A new relationship, a small lot, or a seller with no appetite for buyer credit risk. Part-payment on order with the balance against documents is common.",
            ],
            [
              "Irrevocable letter of credit",
              "Neither directly, a bank substitutes its credit",
              "Larger sums, a newer relationship, or where either party's country carries elevated risk. Costs a fee and takes bank time to establish.",
            ],
            [
              "Documents against payment (D/P)",
              "Seller, ships first, but controls the documents",
              "An established relationship with acceptable country risk. The buyer cannot collect the goods without paying.",
            ],
            [
              "Documents against acceptance (D/A)",
              "Seller, extends unsecured credit",
              "A trusted relationship. The buyer takes the documents against a promise to pay at a future date.",
            ],
            [
              "Open account",
              "Seller, ships and invoices, paid later",
              "A long, trusted relationship. The seller carries the full credit risk for the payment period.",
            ],
          ],
        },
        {
          kind: "p",
          text: "The instrument chosen has a cost, and it is not only the bank charge. Advance payment ties up the buyer's working capital. A letter of credit consumes the buyer's credit line and takes days to arrange. Open account exposes the seller's cash flow. Each side is trading risk against cost, and a term that suits one party's balance sheet may not suit the other's.",
        },
      ],
    },
    {
      id: "letters-of-credit",
      heading: "Letters of credit",
      blocks: [
        {
          kind: "p",
          text: "A documentary letter of credit is an undertaking by the buyer's bank to pay the seller on presentation of a stated set of documents that comply exactly with the credit's terms. It replaces the buyer's credit risk with the bank's, which is why it is used when the parties do not yet have the history to trade on collection or open account.",
        },
        {
          kind: "p",
          text: "The mechanism is documentary, and the word matters: the bank pays against documents, not against the coffee. If the presented documents match the credit, the bank pays even if the coffee is later found wanting; if they do not match (a date out of range, a description that differs by a word) the bank may refuse to pay for coffee that is entirely sound. Documentary discrepancies are the main practical failure mode.",
        },
        {
          kind: "ul",
          items: [
            "The credit lists the exact documents required, commonly the commercial invoice, the transport document, and the origin and regulatory certificates set out in [the documentation checklist](/guides/import-documentation-checklist).",
            "The transport document is the pivot. A negotiable bill of lading controls the right to take delivery, so whoever holds it controls the goods; the bank holds it until it is paid.",
            "The credit should be irrevocable, and a seller uncertain of the issuing bank may ask for it to be confirmed by a bank in the seller's own country, which adds a second guarantee and a second fee.",
            "Every date, quantity tolerance and goods description in the credit must match the sales contract, or the seller is obliged to ship against one set of terms and be paid against another.",
          ],
        },
      ],
    },
    {
      id: "documentary-collections",
      heading: "Documentary collections",
      blocks: [
        {
          kind: "p",
          text: "In a documentary collection the banks pass documents but do not guarantee payment. The seller ships, then sends the documents through the banking chain with instructions for their release. It is cheaper than a letter of credit and gives the seller more security than open account, without a bank standing behind the buyer.",
        },
        { kind: "h3", text: "Documents against payment (D/P)" },
        {
          kind: "p",
          text: "Also called cash against documents. The buyer's bank releases the documents (including the transport document that controls the goods) only when the buyer pays. The seller keeps control of the cargo until payment, but carries the risk that the buyer simply does not present to pay, leaving a container at a distant port.",
        },
        { kind: "h3", text: "Documents against acceptance (D/A)" },
        {
          kind: "p",
          text: "The buyer receives the documents against accepting a bill of exchange (a formal promise to pay on a future date) and can then collect and sell the coffee before paying for it. The seller has extended unsecured credit, and D/A is used only where that credit risk is acceptable.",
        },
      ],
    },
    {
      id: "advance-and-open-account",
      heading: "Advance payment and open account",
      blocks: [
        {
          kind: "p",
          text: "The two ends of the spectrum are the simplest to operate and the least balanced. Under full advance payment the buyer funds the entire transaction and relies on the seller to perform; under open account the seller ships and invoices and relies on the buyer to pay on time. Each removes all bank involvement and all bank cost, and places the whole risk on one party.",
        },
        {
          kind: "p",
          text: "A common middle position is a deposit on order with the balance payable against shipping documents. This splits the exposure: the seller has committed funds from the buyer before allocating a lot, and the buyer pays the balance only once documents evidence that the coffee has shipped. It is frequently how a relationship operates before it graduates to a collection or open-account basis.",
        },
      ],
    },
    {
      id: "payment-and-incoterms",
      heading: "Payment terms are not the Incoterms rule",
      blocks: [
        {
          kind: "p",
          text: "This is the most common confusion in a first contract. An Incoterms rule allocates carriage, cost and risk for the physical movement of the goods. It says nothing about when or how the goods are paid for. \"CIF Hamburg\" tells you the seller arranges and pays freight to Hamburg and insures to a minimum standard; it does not tell you whether payment is by letter of credit, collection or open account.",
        },
        {
          kind: "p",
          text: "The two interact only through the documents. A letter of credit calls for a transport document, and the Incoterms rule determines which document the seller can provide and at what point, which is why the FCA on-board bill of lading option introduced in Incoterms 2020, described in [the Incoterms guide](/guides/incoterms-green-coffee), matters for letter-of-credit trades. Beyond that, the two are set independently, in different clauses of the same contract.",
        },
        {
          kind: "pending",
          label: "Zoebar accepted payment terms",
          text: "The payment terms Zoebar accepts, any deposit requirement, and the banking arrangements for a transaction are being verified and are confirmed per contract rather than published. They are stated in the quotation and the sales contract for a specific shipment.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "What is cash against documents in coffee trading?",
      answer:
        "Cash against documents, or documents against payment (D/P), is a documentary collection in which the buyer's bank releases the shipping documents (including the one controlling the goods) only when the buyer pays. The seller keeps control of the cargo until payment but has no bank guarantee that the buyer will pay. It is cheaper than a letter of credit.",
    },
    {
      question: "Do I need a letter of credit to buy green coffee?",
      answer:
        "No. A letter of credit is one option among several, advance payment, documentary collections and open account are all used in the trade. Letters of credit are common for larger sums or newer relationships because a bank substitutes its credit for the buyer's, but they carry a fee and take bank time to arrange. The right term depends on the relationship and the amounts involved.",
    },
    {
      question: "Do Incoterms rules set the payment terms?",
      answer:
        "No. An Incoterms rule allocates carriage, cost and risk for moving the goods; it does not govern payment. Payment terms are a separate clause of the sales contract. The two interact only through the documents a letter of credit calls for, which the Incoterms rule determines the seller is able to supply.",
    },
  ],
  datePublished: AUTHORED_2,
  dateModified: AUTHORED_2,
};

/* ============================================================================
   7 - CONTAINER LOADING AND SHIPPING SPECIFICATIONS
   ========================================================================== */

const CONTAINER: Guide = {
  slug: "green-coffee-container-loading",
  navTitle: "Container loading & capacity",
  title: "Container loading and shipping specifications for green coffee.",
  description:
    "How green coffee is packed and shipped: bag types and weights, why coffee ships in 20-foot rather than 40-foot containers, the condensation problem inside a steel box, container liners and desiccants, and what to specify in the contract.",
  question: "How much green coffee fits in a shipping container?",
  answer:
    "A 20-foot container typically holds around 300 bags of 60 kg (roughly 18 to 19 tonnes) though route weight limits and packaging move the figure. Coffee reaches a container's weight limit long before its volume limit, which is why it ships in 20-foot rather than 40-foot units and why payload, not cubic capacity, is the binding constraint.",
  meta: [
    { term: "Common bag", detail: "60 kg jute, often lined" },
    { term: "20ft, typically", detail: "~300 bags · ~18–19 t" },
    { term: "Limited by", detail: "Weight, not volume" },
    { term: "Main transit risk", detail: "Condensation" },
  ],
  sections: [
    {
      id: "how-coffee-is-packed",
      heading: "How coffee is packed for export",
      blocks: [
        {
          kind: "p",
          text: "Green coffee is hygroscopic (it takes up and gives off moisture with the air around it) and it is shipped across large swings in temperature and humidity. Packaging exists to manage that, not only to contain the beans, and the choice made at origin travels with the coffee for the whole voyage.",
        },
        {
          kind: "p",
          text: "Ethiopian coffee is traditionally exported in jute bags of 60 kg, and 60 kg remains the reference unit for Ethiopian lots, including the washed and natural coffee described on [our coffee page](/coffee), grown in [Amaro](/amaro). Other origins and other buyers use 30 kg bags, and a growing share of specialty coffee ships in bags with an inner barrier liner.",
        },
        {
          kind: "ul",
          items: [
            "Plain jute or sisal. Breathable, cheap, and the historical default. It offers no moisture barrier, so the coffee equilibrates with whatever air reaches it.",
            "Jute with a barrier liner, a multi-layer plastic or foil bag inside the sack. Slows moisture and oxygen exchange and holds the cup longer, at a higher cost per bag.",
            "Hermetic or vacuum packaging. A sealed barrier that effectively stops moisture and gas exchange for the duration of transit. Used where freshness retention justifies the cost.",
            "Bulk in a container liner. The container is lined with one large bag and filled loose, saving the cost of sacks. Common for larger commercial volumes, less so for lot-separated specialty coffee.",
          ],
        },
      ],
    },
    {
      id: "twenty-versus-forty",
      heading: "Twenty-foot versus forty-foot",
      blocks: [
        {
          kind: "p",
          text: "A standard shipping container has two independent limits: how much space it has, and how much weight it is rated and permitted to carry. Cargo is said to cube out when it fills the space before reaching the weight limit, and to weigh out when it reaches the weight limit with space to spare. Green coffee weighs out, decisively.",
        },
        {
          kind: "table",
          caption: "Container capacity for green coffee, indicative, not a specification",
          head: ["Unit", "Internal volume, approx.", "Coffee loaded, typical", "Why"],
          rows: [
            [
              "20-foot standard",
              "~33 m³",
              "~18–19 t · ~300–320 bags of 60 kg",
              "Reaches the payload limit with volume still free",
            ],
            [
              "40-foot standard",
              "~67 m³",
              "Rarely used for coffee alone",
              "Twice the space, a similar payload rating, it would weigh out at roughly half full",
            ],
          ],
        },
        {
          kind: "p",
          text: "The exact number of bags is not a constant. It depends on the bag weight, the maximum payload the shipping line applies to that container, and (for a landlocked origin such as Ethiopia) the road weight limits on the inland leg to port, which can be lower than the sea limit and can cap the load before the container does. A figure quoted as fixed on a website is a typical case, not a specification.",
        },
        {
          kind: "note",
          text: "Confirm the loaded weight and bag count for your specific shipment in the contract and on the packing list, not from a general figure. The number that binds is the one on the weight note for your container.",
        },
      ],
    },
    {
      id: "the-condensation-problem",
      heading: "Condensation, the largest transit risk",
      blocks: [
        {
          kind: "p",
          text: "The single largest transit risk to green coffee is not physical damage, it is moisture. A container loaded in a warm, humid origin holds warm, humid air. As it passes through cooler conditions, or simply cools at night, that air reaches its dew point and water condenses on the coldest surface, usually the steel ceiling, and then drips back onto the cargo. In the trade this is called container rain, or container sweat.",
        },
        {
          kind: "p",
          text: "The damage is characteristic: water staining and mould on the top layer of bags and against the walls, a musty or phenolic taint through the affected coffee, and sometimes caking. It can ruin the top of an otherwise sound container, and because it develops in transit it is often discovered only on opening at destination, which is why the point of quality determination in the contract matters.",
        },
        {
          kind: "ul",
          items: [
            "Coffee dried to the correct target moisture before shipment carries less water into the box and condenses less. Over-drying avoids the problem but flattens the cup and loses weight.",
            "A barrier liner or hermetic packaging isolates the beans from the container atmosphere and is the most reliable defence.",
            "Desiccant (hanging drying agents, or a container liner with an absorbent layer) lowers the humidity of the air in the box during the voyage.",
            "Kraft-paper container liners and dunnage keep the bags off the floor and clear of the walls, where condensation collects.",
          ],
        },
      ],
    },
    {
      id: "container-type",
      heading: "Ventilated and standard containers",
      blocks: [
        {
          kind: "p",
          text: "Ventilated containers exist, dry containers with passive vents in the top rails that allow some air exchange without letting rain in. They were designed for exactly this class of cargo, and some coffee, particularly from origins shipping in plain jute, moves in them.",
        },
        {
          kind: "p",
          text: "In practice most coffee now ships in standard dry containers, with the moisture risk managed by packaging and desiccant rather than by ventilation. Ventilated units are less widely available, cost more, and are less effective than a barrier liner when the outside air is itself humid. The decision belongs in the contract alongside the packaging specification, not left to whatever the carrier provides.",
        },
      ],
    },
    {
      id: "loading",
      heading: "Loading and securing the container",
      blocks: [
        {
          kind: "p",
          text: "How a container is stuffed affects both the condition of the coffee on arrival and whether the load is safe and legal to move by road.",
        },
        {
          kind: "ul",
          items: [
            "The container should be clean, dry, sound and odour-free before loading, coffee readily takes up taints from a previous cargo or from residual cleaning chemicals.",
            "Bags are kept off the floor and clear of the walls and doors, on dunnage or a liner, so condensation running down the steel does not reach them.",
            "Weight is distributed evenly along the container floor, within the axle-load limits that apply on the inland leg, not only the total payload.",
            "The load is stowed tightly enough that bags do not shift and chafe in transit, with the doorway blocked so nothing falls out on opening.",
          ],
        },
        {
          kind: "p",
          text: "For Zoebar coffee, cherry intake, processing and drying happen at an affiliated washing station in Amaro run with Zoebar's direct operational oversight, described on [the process page](/process), so the moisture condition of the coffee entering the supply chain is an operational record rather than a figure taken on trust from a third party.",
        },
      ],
    },
    {
      id: "what-to-specify",
      heading: "What to specify in the contract",
      blocks: [
        {
          kind: "p",
          text: "Packaging and loading are contract terms. Leaving them unstated means accepting whatever is cheapest at origin, and discovering the choice on arrival.",
        },
        {
          kind: "ol",
          items: [
            "Bag type and weight (plain jute, lined, or hermetic) and the net weight per bag.",
            "The number of bags and the total net weight per container.",
            "Container type (standard or ventilated) and any liner or desiccant requirement.",
            "The moisture maximum and the point at which it is measured, which links to the set in [the importer's documentation checklist](/guides/import-documentation-checklist).",
            "Marks and lot identification on the bags.",
          ],
        },
        {
          kind: "pending",
          label: "Zoebar packing and container specification",
          text: "Zoebar's bag type and weight, liner specification, bags per container and net loaded weight are being verified and are confirmed per contract rather than published as standing figures. They appear on the specification table on [our coffee page](/coffee) and on the packing list for a specific shipment.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "How many bags of coffee fit in a 20-foot container?",
      answer:
        "Typically around 300 bags of 60 kg, or roughly 18 to 19 tonnes, though the figure moves with the bag weight, the shipping line's payload limit, and the road weight limits on the inland leg to port. Green coffee reaches a container's weight limit well before its volume limit, so payload is what constrains the load.",
    },
    {
      question: "Why does green coffee ship in 20-foot containers rather than 40-foot?",
      answer:
        "Because coffee is dense enough to reach a container's maximum payload while the container is only about half full by volume. A 40-foot container has roughly twice the space but a similar weight rating, so it would hit the weight limit half empty. A 20-foot unit uses the payload efficiently.",
    },
    {
      question: "What is container rain in coffee shipping?",
      answer:
        "Container rain, or container sweat, is condensation that forms inside a container when warm, humid air loaded at origin cools in transit and reaches its dew point. Water collects on the steel ceiling and drips onto the cargo, staining and spoiling the top layer of bags. It is managed with correct drying, barrier packaging, desiccant and dunnage.",
    },
  ],
  datePublished: AUTHORED_2,
  dateModified: AUTHORED_2,
};

/* ============================================================================
   REGISTRY
   ========================================================================== */

/**
 * Ordered as a reading sequence, not alphabetically: the buying process first
 * as orientation, then the four pillars, then the payment and container
 * detail guides.
 */
export const GUIDES: readonly Guide[] = [
  PROCESS,
  GRADING,
  CALENDAR,
  DOCUMENTATION,
  INCOTERMS,
  PAYMENT,
  CONTAINER,
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** Every guide path, for the sitemap. */
export function guidePaths(): string[] {
  return GUIDES.map((g) => `/guides/${g.slug}`);
}

/** Derived, not asserted: word count of the rendered prose. */
export function guideWordCount(guide: Guide): number {
  return countWords(
    guide.sections,
    guide.answer,
    ...guide.faqs.flatMap((f) => [f.question, f.answer]),
  );
}

/** Reading time in whole minutes, floored at 1. */
export function guideReadingTime(guide: Guide): number {
  return readingMinutes(guideWordCount(guide));
}
