import { z } from "zod";
import { inferredSchema } from "@/lib/candidate/ingest-resume/data/inferredSchema";

/**
 * Extends the `inferredSchema` with an additional `intro` field that represents a concise and effective introduction for the candidate based on their experience and skills.
 */
export const extendedInferredSchema = inferredSchema.extend({
  intro: z
    .string()
    .describe(
      "A concise and effective introduction for the candidate based on their experience and skills."
    ),
});
