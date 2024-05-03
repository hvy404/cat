import { z } from "zod";

export const staticJDSchema = z
  .object({
    jobTitle: z.string().describe("Title of the job position."),
    department: z.string().describe("Department or division within the agency."),
    company: z.string().describe("Hiring consulting company's name."),
    jobSummary: z.string().describe("Brief summary of the job role and responsibilities."),
    responsibilities: z
      .array(z.string())
      .describe("Detailed list of job responsibilities."),
    requiredQualifications: z
      .array(
        z.object({
          qualification: z.string(),
          importance: z.enum(['Essential', 'Desirable']).optional(),
        })
      )
      .describe("Qualifications required for the job."),
    preferredQualifications: z
      .array(z.string())
      .optional()
      .describe("Additional qualifications that are preferred but not required."),
    educationRequirements: z
      .array(
        z.object({
          level: z.string(),
          field: z.string().optional(),
        })
      )
      .describe("Educational level and field of study required."),
    experienceRequirements: z
      .array(
        z.object({
          years: z.number(),
          field: z.string().optional(),
        })
      )
      .describe("Years of experience and specific field experience required."),
    securityClearance: z
      .string()
      .optional()
      .describe("Required level of security clearance."),
    certifications: z
      .array(z.string())
      .optional()
      .describe("Professional certifications required or preferred."),
    skills: z
      .array(z.string())
      .describe("Technical and soft skills required for the job."),
    workLocation: z
      .object({
        address: z.string().optional(),
        remotePossible: z.boolean(),
      })
      .describe("Physical work location and possibility of remote work."),
    travelRequired: z
      .boolean()
      .describe("Whether the job requires travel."),
    salaryRange: z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .describe("Minimum and maximum salary range."),
    employmentType: z
      .enum(['Full-time', 'Part-time', 'Contract', 'Temporary'])
      .describe("Type of employment."),
    applicationDeadline: z
      .string()
      .describe("Deadline for application submissions."),
    complianceRequirements: z
      .array(z.string())
      .optional()
      .describe("Specific compliance or regulatory requirements applicable to the job."),
  })
  .describe("Job description for a position within a federal consulting agency or federal agency.");
