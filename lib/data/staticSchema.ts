import { z } from "zod";

export const staticSchema = z
  .object({
    name: z.string().describe("Full name of the candidate."),
    title: z.string().describe("Current title or role."),
    company: z.string().describe("Name of the current or most recent company."),
    contact: z
      .object({
        phone: z.string().optional(),
        location: z.string(),
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
      .describe("Applicant past job history."),
    technical_skills: z
      .array(z.string())
      .optional()
      .describe("Detailed list of technical skills, tools, and technologies."),
    soft_skills: z
      .array(z.string())
      .optional()
      .describe("List of non-technical or soft skills."),
    industry_experience: z
      .array(z.string())
      .optional()
      .describe("Experience in specific industries."),
    security_clearance: z
      .array(z.string())
      .optional()
      .describe("Security clearance or certifications."),
    fedcon_experience: z
      .array(z.string())
      .optional()
      .describe("Experience in Federal contracting if applicable."),
    professional_certifications: z
      .array(z.string())
      .optional()
      .describe("List of professional certifications if applicable."),
  })
  .describe("Resume");
