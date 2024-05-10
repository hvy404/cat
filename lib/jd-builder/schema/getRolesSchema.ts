import { z } from "zod";

export const rolesTypeSchema = z
  .object({
    personnel_roles: z
      .array(z.string())
      .describe("List of personnel role titles.")
  })
  .describe("Schema for listing personnel role titles.");
