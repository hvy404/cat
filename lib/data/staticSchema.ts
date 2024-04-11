import { z } from "zod";

export const staticSchema = z
  .object({
    name: z.string().describe("Full name of the candidate."),
    title: z.string().describe("Current title or role."),
    company: z.string().describe("Name of the current or most recent company."),
    skills: z.array(z.string()).describe("List of skills."),
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
    technical_skills: z
      .array(z.string())
      .optional()
      .describe("Detailed list of technical skills, tools, and technologies."),
    soft_skills: z
      .array(z.string())
      .optional()
      .describe("List of non-technical or soft skills."),
    availability: z
      .string()
      .optional()
      .describe("Details about the candidate's availability to start work."),
    visa_status: z
      .string()
      .optional()
      .describe("Work permit or visa status for international candidates."),
    industry_experience: z
      .array(z.string())
      .optional()
      .describe("Experience in specific industries."),
    security_clearance: z
      .array(z.string())
      .optional()
      .describe("Security clearance or certifications."),
  })
  .describe("Resume");
