import { z } from "zod";

export const staticSchemaSecondary = z.object({
  work_experience: z
    .array(
      z.object({
        organization: z.string(),
        job_title: z.string(),
        responsibilities: z.string(),
        start_date: z.string().optional(),
        end_date: z.string().optional(),
      })
    )
    .describe("Comprenhensive list of work experiences."),
});
