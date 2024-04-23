import { z } from "zod";

export const documentTypeSchema = z
  .object({
    document_type: z
      .enum(["sow", "pws"])
      .describe("Indicates if this document is a Statement of Work (SOW) or a Performance Work Statement (PWS)")
  })
  .describe("Schema to identify different type of opportunity document.");