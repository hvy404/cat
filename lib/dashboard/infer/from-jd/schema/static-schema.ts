import { z } from "zod";

export const jobDescriptionStaticSchema = z
  .object({
    jobTitle: z.string().describe("The title or name of the job position."),
    company: z
      .string()
      .describe("The company posting the job and doing the hiring."),
    client: z
      .string()
      .optional()
      .describe("The client company where the applicant might be placed."),
    locationType: z
      .enum(["remote", "onsite", "hybrid"])
      .optional()
      .describe(
        "The type of location for the job, e.g., Remote, Onsite, Hybrid."
      ),
    location: z
      .array(
        z.object({
          city: z.string().optional(),
          state: z.string().optional(),
          zipcode: z.string().optional(),
        })
      )
      .optional()
      .describe("The geographic location if applicable. If applicable, there is only one location."),
    jobType: z
      .enum(["full-time", "part-time", "contract", "temporary"])
      .describe(
        "Type of employment, e.g., Full-time, Part-time, Contract, Temporary."
      ),
    salaryRange: z
      .object({
        startingSalary: z
          .number()
          .describe("The starting salary for the position."),
        maximumSalary: z
          .number()
          .describe("The maximum salary offered for the position."),
      })
      .optional()
      .describe("The salary range for the job."),
    benefits: z
      .array(z.string())
      .optional()
      .describe(
        "List of benefits offered with the job, like health insurance, retirement plans, etc."
      ),
    applicationDeadline: z
      .string()
      .optional()
      .describe("Deadline for application submissions, if applicable."),
    securityClearance: z
      .enum(["none", "basic", "secret", "top-secret"])
      .optional()
      .describe("The level of security clearance required for the job."),
  })
  .describe("Job Description");

export const jobDescriptionStaticSecondarySchema = z
  .object({
    responsibilities: z
      .array(z.string())
      .describe(
        "List of specific responsibilities and tasks associated with the job."
      ),
    qualifications: z
      .array(z.string())
      .describe(
        "List of required qualifications such as degrees, certifications, or specific knowledge areas."
      ),
    skills: z
      .array(z.string())
      .describe(
        "List of required hard skills, such as software proficiency, languages, or technical skills."
      ),
    experience: z
      .string()
      .optional()
      .describe(
        "Experience required for the job, typically specified in years or range."
      ),
    preferredSkills: z
      .array(z.string())
      .describe(
        "List of preferred skills and experience that are not required but beneficial for the job."
      ),
  })
  .describe("Job Description");

export const jobDescriptionStaticThirdSchema = z
  .object({
    description: z
      .string()
      .describe("Detailed description of the job role and responsibilities."),
    companyOverview: z
      .string()
      .describe("Overview of the company, its mission, and its commitment."),
  })
  .describe("Job Description");
