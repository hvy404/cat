import { z } from "zod";

export const keyPersonnelTypeSchema = z
  .object({
    key_personnel_roles: z
      .array(z.string())
      .describe("Key personnel roles identified from the opportunity documents.")
  })
  .describe("Schema to identify key personnel (KP) roles from opportunity documents.");
