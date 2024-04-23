import { z } from "zod";

export const rolesTypeSchema = z
  .object({
    personnel_roles: z
      .array(z.string())
      .describe("List of all required personnel roles identified from the opportunity documents.")
  })
  .describe("Schema to identify personnel roles from opportunity documents.");
