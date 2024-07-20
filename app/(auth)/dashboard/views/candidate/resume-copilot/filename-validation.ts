'use server';

import { z } from 'zod';

const filenameSchema = z.string()
  .regex(/^[a-zA-Z0-9\s-]+$/, "Only letters, numbers, spaces, and hyphens are allowed")
  .min(1, "Filename cannot be empty")
  .max(50, "Filename cannot be longer than 50 characters");

export async function validateFilename(filename: string) {
  try {
    filenameSchema.parse(filename);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Invalid filename" };
  }
}