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
      console.log(`No embedding found for job ${jobId}`);
      return null;
    }

    // Find similar talents using the job embedding
    const threshold = 0.72; // You can adjust this threshold as needed
    const similarTalents = await findSimilarTalents(jobEmbedding, threshold);

    // Get pairing set: jobId, talentId, score
    const pairings = similarTalents.map((talent) => ({
      job_id: jobId,
      candidate_id: talent.applicant_id,
      score: talent.score,
    }));

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
        const combos = ["A", "B", "C", "D", "E", "F"];

        Promise.all(
          combos.map((combo) =>
            inngest.send({
              name: "app/evaluate-match-pair",
              data: {
                applicantID: pairing.candidate_id,
                jobID: pairing.job_id,
                combo: combo,
              },
            })
          )
        ).catch((error) => {
          console.error("Error sending evaluation requests:", error);
        });
      }
    }

    // Save each set as a row to database table "matching_sys_pairs"
    const { data, error } = await supabase
      .from("matching_sys_pairs")
      .upsert(pairings, { onConflict: "job_id,candidate_id" });

    if (error) {
      console.error("Error saving matching pairs:", error);
      // You might want to handle this error more gracefully
    }

    return similarTalents;
  } catch (error) {
    console.error(`Error finding matches for job ${jobId}:`, error);
    return null;
  }
}
