import { z } from "zod";

export const inferredJDSchema = z
  .object({
    managementLevel: z
      .object({
        isManagement: z
          .boolean()
          .describe(
            "Indicates if the job requires management skills or supervisory responsibilities."
          ),
        managementLevelDescription: z
          .string()
          .describe(
            "Description of management level required (e.g., team lead, department head, project manager)."
          ),
      })
      .optional()
      .describe(
        "Details about the management responsibilities and level required for the job."
      ),
    requiredExperienceLevel: z
      .object({
        experienceYears: z
          .number()
          .describe(
            "Minimum years of experience inferred from the job description."
          ),
        experienceLevel: z
          .enum(["Entry", "Mid", "Senior", "Executive"])
          .describe(
            "Inferred level of experience required (Entry, Mid, Senior, Executive)."
          ),
      })
      .describe(
        "Inferred details about the experience level required for the job."
      ),
    potentialCandidateTraits: z
      .array(
        z.object({
          trait: z.string(),
          importance: z.enum(['Essential', 'Desirable'])
        })
      )
      .optional()
      .describe(
        "Traits that are likely to fit the role based on the description, categorized by importance."
      ),
    compatibilityWithRemoteWork: z
      .boolean()
      .optional()
      .describe(
        "Inferred compatibility with remote work based on job responsibilities and requirements."
      ),
  })
  .describe("Inferred details from a job description in a federal consulting or agency context.");
