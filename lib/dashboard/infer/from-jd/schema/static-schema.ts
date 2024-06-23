import { z } from "zod";

export const jobDescriptionStaticSchema = z
  .object({
    jobTitle: z.string().describe("The title or name of the job opportunity."),
    company: z
      .string()
      .describe("Name of company posting the job and doing the hiring."),
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
          city: z.string().optional().describe("The city of the job location."),
          state: z
            .string()
            .optional()
            .describe("The state of the job location, e.g., CA."),
          zipcode: z
            .string()
            .optional()
            .describe("The zip code of the job location."),
        })
      )
      .optional()
      .describe(
        "The city, state and zip code of the job location if applicable and an onsite job."
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
      .describe("The required clearance level."),
  })
  .describe("Job Description");

export const jobDescriptionStaticSecondarySchema = z
  .object({
    responsibilities: z
      .array(z.string())
      .describe("List of responsibilities and tasks associated with the job."),
    qualifications: z
      .array(z.string())
      .describe(
        "List of required qualifications such specific knowledge areas."
      ),
    education: z
      .array(z.string())
      .optional()
      .describe("List of required education levels or degrees for the job."),
    certifications: z
      .array(z.string())
      .optional()
      .describe("List of required certifications or licenses for the job."),
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
    summary: z
      .string()
      .optional()
      .describe("A concise summary of the job role and main responsibilities."),
  })
  .describe("Job Description");
