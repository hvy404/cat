import { z } from "zod";

export const assumedDetailsSchema = z
  .object({
    leadershipOpportunity: z
      .boolean()
      .optional()
      .describe(
        "Potential for leadership roles or responsibilities, inferred from the job title and key responsibilities."
      ),
    advancementPotential: z
      .boolean()
      .optional()
      .describe(
        "Potential for professional growth and advancement, inferred from the job description and company overview."
      ),
    remoteFlexibility: z
      .boolean()
      .optional()
      .describe(
        "Potential for remote work or flexibility in work location, explicitly mentioned or implied."
      ),
    technicalDemand: z
      .string()
      .optional()
      .describe(
        "Level of technical expertise required, inferred from the qualifications and skills listed."
      ),
    suitablePastRoles: z
      .array(z.string())
      .optional()
      .describe(
        "List of past roles or job titles that may align well with the demands and responsibilities of this job."
      ),
  })
  .describe("Assumed Details from Job Description");
