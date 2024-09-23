"use server";
import {
  getJobEmbedding,
  findSimilarTalents,
} from "@/lib/engine/retreive-talent";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";

export async function findJobMatches(jobId: string) {
  const supabase = createClient(cookies());

  try {
    // Get job embedding
    const jobEmbedding = await getJobEmbedding(jobId);

    if (!jobEmbedding) {
      //console.log(`No embedding found for job ${jobId}`);
      return null;
    }

    // Find similar talents using the job embedding
    const threshold = 0.72; // You can adjust this threshold as needed
    const similarTalents = await findSimilarTalents(jobEmbedding, threshold);

    // Create pairing set
    const pairings = similarTalents.map((talent) => ({
      job_id: jobId,
      candidate_id: talent.applicant_id,
      score: talent.score,
    }));

    const newPairings = [];

    // Check if pairing exists and evaluate if not
    for (const pairing of pairings) {
      const { data: existingPair, error: pairError } = await supabase
        .from("matching_sys_pairs")
        .select()
        .eq("job_id", pairing.job_id)
        .eq("candidate_id", pairing.candidate_id)
        .single();

      if (pairError && pairError.code !== "PGRST116") {
        console.error("Error checking existing pair:", pairError);
        continue;
      }

      if (!existingPair) {
        newPairings.push(pairing);
        const combos = ["A", "B", "C", "D", "E", "F"];

        for (const combo of combos) {
          try {
            const result = await inngest.send({
              name: "app/evaluate-match-pair",
              data: {
                applicantID: pairing.candidate_id,
                jobID: pairing.job_id,
                combo: combo,
              },
            });

            if (result.ids) {
              //console.log(`Evaluation for combo ${combo} completed successfully.`);
            } else {
              //console.log(`Evaluation for combo ${combo} failed.`);
              break;
            }
          } catch (error) {
            console.error(`Error evaluating combo ${combo}:`, error);
            break;
          }
        }
      }
    }

    // Save only new pairings to database table "matching_sys_pairs"
    if (newPairings.length > 0) {
      const { data, error } = await supabase
        .from("matching_sys_pairs")
        .upsert(newPairings, { onConflict: "job_id,candidate_id" });

      if (error) {
        console.error("Error saving matching pairs:", error);
        // You might want to handle this error more gracefully
      }

      // Only send the final score event for new pairings
      if (newPairings.length > 0) {
        await inngest.send({
          name: "app/job-match-final-score",
          data: { jobId, candidateId: newPairings[0]?.candidate_id },
        });
      }
    }

    return similarTalents;
  } catch (error) {
    console.error(`Error finding matches for job ${jobId}:`, error);
    return null;
  }
}
