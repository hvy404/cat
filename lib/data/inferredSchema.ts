import { z } from "zod";

export const inferredSchema = z
  .object({
    manager_trait: z
      .object({
        manager_boolean: z
          .boolean()
          .describe(
            "Indicates if the applicant can perform supervisor and management role based on previous experience and tenure."
          ),
        manager_trait_reason: z
          .string()
          .describe(
            "Explanation why the applicant can or cannot perform supervisor role."
          ),
      })
      .describe(
        "Trait and explanation regarding the applicant's ability to perform supervisor role."
      ),
    potential_roles: z
      .array(z.string())
      .optional()
      .describe(
        "List of potential roles applicant can perform based on current experience and current industry experience."
      ),
  })
  .describe("Resume");
