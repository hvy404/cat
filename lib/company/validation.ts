"use server";
import { z } from "zod";

// Regular expression for company name and city
const nameRegex = /^[a-zA-Z0-9 .,\-']+$/;

const CompanyProfileSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(1, "Company name is required")
    .regex(nameRegex, "Company name contains invalid characters."),
  industry: z.string().optional(),
  size: z.string().optional(),
  foundedYear: z
    .string()
    .optional()
    .refine((val) => !val || (/^\d{4}$/.test(val) && !isNaN(parseInt(val))), {
      message: "Year must be a valid 4-digit year",
    }),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  headquarters: z
    .object({
      city: z
        .string()
        .optional()
        .refine(
          (val) => !val || nameRegex.test(val),
          "City contains invalid characters."
        ),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  socialMedia: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
  contactEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  phoneNumber: z.string().optional(),
  admin: z.array(z.string()).optional(),
  manager: z.array(z.string()).optional(),
});

export type CompanyProfileData = z.infer<typeof CompanyProfileSchema>;

export type ValidationResult =
  | { success: true; data: CompanyProfileData }
  | { success: false; errors: Array<{ path: string; message: string }> };

export async function validateCompanyProfile(
  data: CompanyProfileData
): Promise<ValidationResult> {
  try {
    const validatedData = CompanyProfileSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return {
      success: false,
      errors: [{ path: "unknown", message: "An unexpected error occurred" }],
    };
  }
}
