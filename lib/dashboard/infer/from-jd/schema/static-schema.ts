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
      .describe(
        "The geographic location if applicable. If applicable, there is only one location."
      ),
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
    commissionPay: z
      .boolean()
      .optional()
      .describe(
        "Whether the job offers commission pay such as OTE (On Target Earnings)."
      ),
    commissionPercent: z
      .number()
      .optional()
      .describe(
        "If commission pay is offered, specify the commission percentage for the job."
      ),
    oteSalary: z
      .number()
      .optional()
      .describe(
        "If commission pay is offered, specify the OTE (On Target Earnings) salary for the job."
      ),
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
      .optional()
      .describe(
        "A concise summary of the job role, including main responsibilities and tasks. This field is intended to provide potential candidates with a clear idea of what the position entails and what will be expected of them."
      ),
    companyOverview: z
      .string()
      .optional()
      .describe(
        "A brief overview of the company, highlighting its mission, values, and key commitments."
      ),
  })
  .describe(
    "Detailed schema for the job description section, focusing on providing an insightful summary of the job and an overview of the company."
  );
