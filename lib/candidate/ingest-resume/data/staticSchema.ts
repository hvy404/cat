import { z } from "zod";

export const staticSchema = z.object({
  name: z.string().describe("Full name of the candidate."),
  title: z
    .string()
    .describe(
      "Role title of the candidate, either from their most recent position or based on their overall experience and qualifications."
    ),
  company: z
    .string()
    .optional()
    .describe("Name of the current or most recent company."),
  contact: z
    .object({
      phone: z.string().optional(),
      email: z.string(),
    })
    .describe("Contact information."),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        start_date: z.string(),
        end_date: z.string().optional(),
      })
    )
    .describe("Education history."),
  location: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      zipcode: z.string().optional(),
    })
    .describe("Candidate location."),
  technical_skills: z
    .array(z.string())
    .describe(
      "List of hard skills, tools, and technologies from previous work experience."
    ),
  industry_experience: z
    .array(z.string())
    .optional()
    .describe(
      "List of specific knowledge areas in which the candidate has experience."
    ),
  clearance_level: z
  .enum(["none", "basic", "confidential", "critical", "paramount", "q_clearance", "l_clearance"])
    .optional()
    .describe("Clearance level, if applicable."),
  professional_certifications: z
    .array(z.string())
    .optional()
    .describe("List of professional certifications if applicable."),
});
