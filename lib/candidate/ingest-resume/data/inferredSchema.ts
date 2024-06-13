import { z } from "zod";

export const inferredSchema = z
  .object({
    soft_skills: z
      .array(z.string().describe("Soft skill that can be inferred from the candidate's work experience."))
      .optional()
      .describe("List of soft skills that can be inferred from the candidate's work experience. Max of 10 soft skills."),
    manager_trait: z
      .object({
        manager_boolean: z
          .boolean()
          .describe("Indicates if the applicant can perform a supervisor and management role based on previous experience and tenure."),
        manager_trait_reason: z
          .string()
          .describe("Concise explanation why the applicant can or cannot perform a supervisor role based on previous experience and tenure."),
      })
      .optional()
      .describe("Trait and explanation regarding the applicant's ability to perform a supervisor role based on previous experience and tenure."),
    potential_roles: z
      .array(z.string().describe("Potential role the candidate would be a good fit for based on past experience and industry experience."))
      .optional()
      .describe("List of potential roles the candidate would be a good fit."),
  })
