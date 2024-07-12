import { z } from "zod";

export const inferredSchema = z
  .object({
    soft_skills: z
      .array(z.string().describe("Soft skill that can be inferred from the candidate's work experience."))
      .optional()
      .describe("List of soft skills that can be inferred from the candidate's work experience. Max of 10 soft skills."),
    potential_roles: z
      .array(z.string().describe("Potential role the candidate would be a good fit for based on past jobs and industry experience."))
      .optional()
      .describe("List of potential roles the candidate would be a good fit."),
  })
