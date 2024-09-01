import { inngest } from "@/lib/inngest/client";
import { calculateEnhancedScore } from "@/lib/engine/final-calculation";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const retrieveAndCalculateScores = inngest.createFunction(
  { id: "retrieve-and-calculate-scores" },
  { event: "app/job-match-final-score" },
  async ({ event, step }) => {
    const { jobId, candidateId } = event.data;
    const supabase = createClient(cookies());

    // Wait for 120 seconds
    await step.sleep("wait-120-seconds", "120s");

    // Retrieve evaluation results and scores
    const evaluationResults = await step.run(
      "fetch-evaluation-results",
      async () => {
        const { data, error } = await supabase
          .from("matching_sys_pairs")
          .select("*")
          .eq("job_id", jobId)
          .eq("candidate_id", candidateId)
          .single();

        if (error)
          throw new Error(
            `Error fetching evaluation results: ${error.message}`
          );
        return data;
      }
    );

    // Extract scores from evaluation results
    const scores = {
      original: evaluationResults.score,
      A: evaluationResults.evaluation_a,
      B: evaluationResults.evaluation_b,
      C: evaluationResults.evaluation_c,
      D: evaluationResults.evaluation_d,
      E: evaluationResults.evaluation_e,
      F: evaluationResults.evaluation_f,
    };

    // Calculate enhanced score
    const enhancedScore = await step.run(
      "calculate-enhanced-score",
      async () => {
        return calculateEnhancedScore(scores);
      }
    );

    // Update the database with the enhanced score
    await step.run("update-enhanced-score", async () => {
      const { error } = await supabase
        .from("matching_sys_pairs")
        .update({ eval_final: enhancedScore })
        .eq("job_id", jobId)
        .eq("candidate_id", candidateId);

      if (error)
        throw new Error(`Error updating enhanced score: ${error.message}`);
    });

    // Use LLM to generate a final evaluation message
    await step.run("trigger-llm-final-evaluation", async () => {
      await inngest.send({
        name: "app/llm-final-evaluation",
        data: {
          jobId: jobId,
          candidateId: candidateId,
          enhancedScore: enhancedScore,
        },
      });
    });

    return { jobId, candidateId, enhancedScore };
  }
);
