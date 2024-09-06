import * as z from "zod";

export const formSchema = z.object({
    name: z.string().min(1, "Full name is required"),
    title: z.string().min(1, "Role title is required"),
    company: z.string().optional(),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be 10 digits")
      .optional(),
    email: z.string().email("Invalid email address").optional(),
    education: z
      .array(
        z
          .object({
            institution: z.string(),
            degree: z.string().optional(),
            start_date: z.string().optional(),
            end_date: z.string().optional(),
          })
          .refine(
            (data) => {
              if (data.institution && !data.degree) {
                return false;
              }
              return true;
            },
            {
              message: "Degree is required",
              path: ["degree"],
            }
          )
      )
      .optional(),
    location: z.object({
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipcode: z.string().min(5, "Zip code is required"),
    }),
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
      .optional(),
    professional_certifications: z
      .array(
        z
          .object({
            name: z.string(),
            issuing_organization: z.string().optional(),
            date_obtained: z.string().optional(),
            expiration_date: z.string().optional(),
            credential_id: z.string().optional(),
          })
          .refine(
            (data) => {
              if (data.name && !data.issuing_organization) {
                return false;
              }
              return true;
            },
            {
              message: "Issuing Organization is required",
              path: ["issuing_organization"],
            }
          )
      )
      .optional(),
    work_experience: z
      .array(
        z
          .object({
            organization: z.string(),
            job_title: z.string(),
            responsibilities: z.string(),
            start_date: z.string().optional(),
            end_date: z.string().optional(),
          })
          .refine(
            (data) => {
              if (
                (data.organization || data.job_title) &&
                (!data.organization || !data.job_title || !data.responsibilities)
              ) {
                return false;
              }
              return true;
            },
            {
              message:
                "Organization, Job Title, and Responsibilities are required when any of them is provided",
              path: ["responsibilities"],
            }
          )
      )
      .optional(),
  });
  
  export type FormValues = z.infer<typeof formSchema>;