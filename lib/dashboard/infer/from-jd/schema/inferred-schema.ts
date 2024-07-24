import { z } from "zod";

export const assumedDetailsSchema = z
  .object({
    leadershipOpportunity: z
      .boolean()
      .optional()
      .describe(
        "Potential for leadership roles or responsibilities, inferred from the job title and key responsibilities."
      ),
    remoteFlexibility: z
      .boolean()
      .optional()
      .describe(
        "Potential for remote work or flexibility in work location, explicitly mentioned or implied."
      ),
    suitablePastRoles: z
      .array(z.string())
      .optional()
      .describe(
        "List of past roles or job titles that may align well with the demands and responsibilities of this job."
      ),
  })
  .describe("Assumed Details from Job Description");
