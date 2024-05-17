import { z } from "zod";

export const titleChoicesSchema = z.array(
  z.object({
    title: z.string().describe("Job title for a job posting."),
  }).describe("Potential job posting titles for an opportunity.")
).describe("Array of job titles for a job posting.");
