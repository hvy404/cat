import { z } from "zod";

const ResumeCoachFeedback = z.object({
  message: z.string().describe("Conversational feedback on the user's action"),
  suggestion: z.string().describe("Specific suggestion for the next step"),
  reasoning: z.string().describe("Explanation for the suggestion"),
});

export type ResumeCoachFeedback = z.infer<typeof ResumeCoachFeedback>;
export { ResumeCoachFeedback };