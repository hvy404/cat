import { z } from "zod";

export const jobDescriptionStaticSchema = z
  .object({
    jobTitle: z.string().describe("Job title"),
    company: z.string().optional().describe("Hiring company name"),
    locationType: z
      .enum(["remote", "onsite", "hybrid"])
      .optional()
      .describe("Work location type"),
    location: z
      .array(
        z.object({
          city: z.string().optional().describe("Job location city"),
          state: z.string().optional().describe("Job location state"),
          zipcode: z.string().optional().describe("Job location zip code"),
        })
      )
      .optional()
      .describe("Specific job location details"),
    jobType: z
      .enum(["full-time", "part-time", "contract", "temporary"])
      .optional()
      .describe("Employment type"),
    salaryRange: z
      .object({
        startingSalary: z.number().optional().describe("Starting salary"),
        maximumSalary: z.number().optional().describe("Maximum salary"),
      })
      .optional()
      .describe("Salary range"),
    commissionPay: z
      .boolean()
      .optional()
      .describe("Commission pay availability"),
    commissionPercent: z.number().optional().describe("Commission percentage"),
    oteSalary: z
      .number()
      .optional()
      .describe("On Target Earnings (OTE) salary"),
    benefits: z.array(z.string()).optional().describe("Job benefits"),
    clearanceLevel: z
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
      .describe("Required clearance level"),
  })
  .describe("Job Description");

export const jobDescriptionStaticSecondarySchema = z
  .object({
    responsibilities: z.array(z.string()).describe("Job responsibilities"),
    qualifications: z.array(z.string()).describe("Required qualifications"),
    education: z.array(z.string()).optional().describe("Required education"),
    certifications: z
      .array(z.string())
      .optional()
      .describe("Required certifications"),
    skills: z
      .array(z.string())
      .optional()
      .describe("Required technical skills"),
    experience: z.string().optional().describe("Required experience"),
    preferredSkills: z.array(z.string()).describe("Preferred skills"),
  })
  .describe("Job Description");

export const jobDescriptionStaticThirdSchema = z
  .object({
    summary: z.string().optional().describe("Job role summary"),
  })
  .describe("Job Description");
