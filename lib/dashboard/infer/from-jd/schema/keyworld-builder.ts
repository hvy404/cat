import { z } from "zod";

export const jobRoleKeywordSchema = z
  .object({
    similarJobTitle: z
      .array(z.string())
      .describe(
        "List of up to 10 additional role/job titles that fit the given Job Description."
      ),
  })
  .describe("Schema for listing similar job titles.");
