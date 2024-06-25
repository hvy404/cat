import { z } from "zod";

const EducationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
});

const WorkExperienceSchema = z.object({
  organization: z.string().min(1, "Organization is required"),
  job_title: z.string().min(1, "Job title is required"),
  responsibilities: z.string().min(1, "Responsibilities are required"),
});

const CertificationSchema = z.object({
  name: z.string().min(1, "Certification name is required"),
});

const nameAndCityRegex = /^[a-zA-Z0-9.\- ]+$/;

const cityRegex = /^[a-zA-Z0-9., ]+$/;

/**
 * Represents the schema for the form data.
 */
const FormDataSchema = z.object({
  /**
   * The name of the candidate.
   */
  name: z.string()
    .min(1, "Name is required")
    .regex(nameAndCityRegex, "Name can only contain letters, numbers, periods, hyphens, and spaces"),

  /**
   * The phone number of the candidate (optional).
   */
  phone: z.string().optional(),

  /**
   * The email address of the candidate.
   */
  email: z.string()
  .email("Invalid email address")
  .refine(email => !email.includes('+'), {
    message: "Email address cannot contain a '+' sign"
  }),

  /**
   * The clearance level of the candidate (optional).
   */
  clearance_level: z.string().optional(),

  /**
   * The city where the candidate resides.
   */
  city: z.string()
    .min(1, "City is required")
    .regex(cityRegex, "City can only contain letters, numbers, periods, commas, and spaces"),

  /**
   * The state where the candidate resides.
   */
  state: z.string().min(1, "State is required"),

  /**
   * The zip code of the candidate's location (5 digits).
   */
  zipcode: z.string().regex(/^\d{5}$/, "Zip code must be 5 digits"),

  /**
   * The education history of the candidate.
   */
  education: z.array(EducationSchema),

  /**
   * The work experience of the candidate.
   */
  work_experience: z.array(WorkExperienceSchema),

  /**
   * The certifications of the candidate.
   */
  certifications: z.array(CertificationSchema),
});

export async function validateForm(formData: z.infer<typeof FormDataSchema>) {
  const result = FormDataSchema.safeParse(formData);

  if (result.success) {
    return { isValid: true, errors: {} };
  } else {
    const errors = result.error.issues.reduce((acc, issue) => {
      acc[issue.path.join("_")] = issue.message;
      return acc;
    }, {} as Record<string, string>);

    return { isValid: false, errors };
  }
}