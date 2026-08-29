import { type SchemaTypeDefinition } from "sanity";

import { lotType } from "./lotType";
import { producerType } from "./producerType";
import { cuppingNoteType } from "./cuppingNoteType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [lotType, producerType, cuppingNoteType],
};
