import { z } from 'zod';

const ResumeCoachSchema = z.object({
  analysis: z.object({
    recentEdit: z.string().describe("Detailed evaluation of the most recent edit, including its impact on resume strength and relevance to the target role"),
    overallImpact: z.string().describe("Assessment of how the edit affects the resume's overall quality for the target position"),
    keywords: z.array(z.string()).describe("List of relevant keywords"),
    relevanceScore: z.number().int().min(1).max(10).describe("Score from 1-10 indicating how well the current resume matches the requirements of the role")
  }),
  recommendation: z.object({
    action: z.enum(["add", "remove", "modify", "none"]).describe("The recommended action to take"),
    targetItem: z.string().describe("Human-readable name or reference of the item to be acted upon"),
    rationale: z.string().describe("Explanation for the recommended action, focusing on relevance to the target role and overall resume improvement"),
    implementation: z.string().describe("Specific suggestions on how to carry out the recommended action")
  }),
  feedback: z.object({
    strengths: z.array(z.string()).describe("List of current resume strengths relevant to the target role"),
    areasForImprovement: z.array(z.string()).describe("Identified areas that could be enhanced to better match the target role requirements"),
    competitiveEdge: z.string().describe("Unique selling points for the specific role")
  }),
  nextSteps: z.object({
    priority: z.enum(["High", "Medium", "Low"]).describe("Urgency of the recommended action"),
    focus: z.string().describe("Specific aspect of the resume to focus on next"),
    guidance: z.string().describe("Brief advice on how to approach the next improvement"),
    progression: z.string().describe("Outline of future improvements beyond the immediate next step")
  })
});

export type ResumeCoachResponse = z.infer<typeof ResumeCoachSchema>;
export { ResumeCoachSchema };