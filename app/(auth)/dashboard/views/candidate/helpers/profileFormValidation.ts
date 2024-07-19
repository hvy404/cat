import { z } from "zod";

export const nameRegex = /^[a-zA-Z.\- ]+$/;
export const cityRegex = /^[a-zA-Z0-9., ]+$/;

export const CLEARANCE_LEVELS = [
  "None",
  "Unclassified",
  "Public Trust",
  "Secret",
  "Top Secret",
  "Top Secret/SCI",
  "Q Clearance",
  "L Clearance"
] as const;

export const TalentPropertiesSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .regex(nameRegex, "Name can only contain letters, spaces, hyphens, and periods"),
  phone: z.string().length(10, "Phone number must be 10 digits").optional().or(z.literal("")),
  email: z.string()
    .email("Invalid email address")
    .refine(email => !email.includes('+'), {
      message: "Email address cannot contain a '+' sign"
    }),
  clearance_level: z.enum(CLEARANCE_LEVELS).optional(),
  city: z.string()
    .min(1, "City is required")
    .regex(cityRegex, "City can only contain letters, numbers, periods, commas, and spaces"),
  state: z.string().min(1, "State is required"),
  zipcode: z.string().regex(/^\d{5}$/, "Zip code must be 5 digits"),
  intro: z.string().max(1500, "Introduction must be 1500 characters or less").optional(),
});

export type TalentPropertiesType = z.infer<typeof TalentPropertiesSchema>;