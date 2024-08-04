import { z } from "zod";

const ResumeCoachSchema = z.object({
  recommendation: z.object({
    action: z
      .enum(["add", "remove", "modify", "none"])
      .describe("The recommended action to take"),
    targetItem: z
      .string()
      .describe(
        "Human-readable name or reference of the item to be acted upon"
      ),
    rationale: z
      .string()
      .describe(
        "Explanation for the recommended action, focusing on relevance to the target role and overall resume improvement"
      ),
    implementation: z
      .string()
      .describe(
        "Specific suggestions on how to carry out the recommended action"
      ),
  }),
  nextSteps: z.object({
    priority: z
      .enum(["High", "Medium", "Low"])
      .describe("Urgency of the recommended action"),
    focus: z
      .string()
      .describe("Specific aspect of the resume to focus on next"),
    guidance: z
      .string()
      .describe("Brief advice on how to approach the next improvement"),
    progression: z
      .string()
      .describe(
        "Outline of future improvements beyond the immediate next step"
      ),
  }),
});

export type ResumeCoachResponse = z.infer<typeof ResumeCoachSchema>;
export { ResumeCoachSchema };
