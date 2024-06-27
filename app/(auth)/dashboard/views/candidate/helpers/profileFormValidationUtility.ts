"use server";

import { TalentPropertiesSchema, TalentPropertiesType } from "@/app/(auth)/dashboard/views/candidate/helpers/profileFormValidation";

export async function validateTalentProperties(data: TalentPropertiesType) {
  const result = TalentPropertiesSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  } else {
    const errors = result.error.issues.reduce((acc, issue) => {
      acc[issue.path[0] as keyof TalentPropertiesType] = issue.message;
      return acc;
    }, {} as Partial<Record<keyof TalentPropertiesType, string>>);
    return { isValid: false, errors };
  }
}