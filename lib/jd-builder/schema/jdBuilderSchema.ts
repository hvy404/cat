import { z } from "zod";

export const jobDescriptionBuilderSchema = z
  .object({
    jobTitle: z.string().describe("Job title of the position."),
    jobDescription: z.string().describe("Introduction of the job opportunity."),
    responsibilities: z
      .array(z.string())
      .describe("List of responsibilities for the position."),
    additionalResponsibilities: z
      .array(z.string())
      .optional()
      .describe("Additional responsibilities if any."),
    requiredQualifications: z
      .array(z.string())
      .describe("List of required qualifications."),
    preferredQualifications: z
      .array(z.string())
      .optional()
      .describe("List of preferred qualifications."),
    whatWeOffer: z
      .array(z.string())
      .describe("Benefits and offerings of the position."),
  })
  .describe("Schema for a job descriptions.");
