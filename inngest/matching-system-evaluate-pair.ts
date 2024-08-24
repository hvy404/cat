import { inngest } from "@/lib/inngest/client";
import { evaluateTalentMatch } from "@/lib/engine/evaluate-talent-match";
import { storeEvaluationResult } from "@/lib/engine/save-eval-scores";

export const evaluateMatchPair = inngest.createFunction(
  { id: "evaluate-match-pair" },
  { event: "app/evaluate-match-pair" },
  async ({ event, step }) => {
    const { applicantID, jobID, combo } = event.data;
    try {
      const result = await evaluateTalentMatch(applicantID, jobID, combo);

      //console.log("Score: ", result);

      if (result.evaluated && result.score !== undefined) {
        await storeEvaluationResult(applicantID, jobID, combo, result.score);
      }

      return { success: true, result };
    } catch (error) {
      //console.error(`Error evaluating match for applicant ${applicantID} and job ${jobID}:`, error);
      return {
        success: false,
        error: "There was an error evaluating the match",
      };
    }
  }
);
