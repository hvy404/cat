import { optional, z } from "zod";

export const staticSchema = z.object({
  name: z.string().describe("Full name of the candidate."),
  title: z
    .string()
    .describe(
      "Role title of the candidate, from their overall experience and qualifications."
    ),
  company: z
    .string()
    .optional()
    .describe("Name of the current or most recent company."),
  phone: z
    .string()
    .optional()
    .describe("Phone number in XXXXXXXXXX format (10 digits, no separators)"),
  email: z.string().optional().describe("Email address of the candidate"),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        start_date: z.string().optional(),
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
      "List of hard skills, tools, and technologies derived from candidate previous work experience."
    ),
  industry_experience: z
    .array(z.string())
    .optional()
    .describe(
      "List of specific knowledge areas in which the candidate has experience."
    ),
  clearance_level: z
    .enum([
      "none",
      "basic",
      "confidential",
      "critical",
      "paramount",
      "q_clearance",
      "l_clearance",
    ])
    .optional()
    .describe("Clearance level, if applicable."),
  professional_certifications: z
    .array(
      z.object({
        name: z.string().describe("Name of the certification"),
        issuing_organization: z
          .string()
          .optional()
          .describe("Organization that issued the certification"),
        date_obtained: z
          .string()
          .optional()
          .describe(
            "Date when the certification was obtained (YYYY-MM format)"
          ),
        expiration_date: z
          .string()
          .optional()
          .describe(
            "Expiration date of the certification, if applicable (YYYY-MM format)"
          ),
        credential_id: z
          .string()
          .optional()
          .describe("Unique identifier for the certification, if available"),
      })
    )
    .optional()
    .describe("List of professional certifications with detailed information"),
});

export const staticSchemaSecondary = z.object({
  work_experience: z
    .array(
      z.object({
        organization: z.string(),
        job_title: z.string(),
        responsibilities: z.string(),
        start_date: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM format"),
        end_date: z
          .string()
          .optional()
          .describe("End date in YYYY-MM format or 'present' for current jobs"),
      })
    )
    .describe(
      "Comprehensive list of work experiences, including job title, description, and dates."
    ),
});
