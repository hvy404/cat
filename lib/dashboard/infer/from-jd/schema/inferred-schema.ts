import { z } from "zod";

export const assumedDetailsSchema = z
  .object({
    leadershipOpportunity: z
      .boolean()
      .nullable()
      .describe(
        "Potential for leadership roles or responsibilities, inferred from the job title and key responsibilities. true if clear leadership opportunities exist, false if explicitly not a leadership role, null if unclear."
      ),
    remoteFlexibility: z
      .boolean()
      .nullable()
      .describe(
        "Potential for remote work or flexibility in work location. true if remote work is possible, false if explicitly on-site only, null if unclear."
      ),
    suitablePastRoles: z
      .array(z.string())
      .min(1)
      .max(5)
      .nullable()
      .describe(
        "List of 1-5 past roles or job titles that may align well with the demands and responsibilities of this job. Null if cannot be confidently inferred."
      ),
  })
  .describe("Assumed Details from Job Description");