"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getAIRecommendationDetails(recommendationId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Fetch match details
    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("job_id, candidate_id, match_score")
      .eq("id", recommendationId)
      .single();

    if (matchError) throw matchError;

    // Fetch expanded matching details
    const { data: expandedData, error: expandedError } = await supabase
      .from("matching_sys_expanded")
      .select("eval_detail")
      .eq("job_id", matchData.job_id)
      .eq("candidate_id", matchData.candidate_id)
      .single();

    if (expandedError) throw expandedError;

    // Fetch candidate details
    const { data: candidateData, error: candidateError } = await supabase
      .from("candidates")
      .select("name, email")
      .eq("identity", matchData.candidate_id)
      .single();

    if (candidateError) throw candidateError;

    // Fetch job details
    const { data: jobData, error: jobError } = await supabase
      .from("job_postings")
      .select("title")
      .eq("jd_id", matchData.job_id)
      .single();

    if (jobError) throw jobError;

    // Combine the essential data
    const recommendationData = {
      id: recommendationId,
      job_id: matchData.job_id,
      candidate_id: matchData.candidate_id,
      candidateName: candidateData.name,
      candidateEmail: candidateData.email,
      jobTitle: jobData.title,
      matchScore: matchData.match_score,
      detailedEvaluation: expandedData.eval_detail || {},
    };

    //console.log("recommendationData", recommendationData);
    return { success: true, data: recommendationData };
  } catch (error) {
    console.error("Error fetching AI recommendation details:", error);
    return { success: false, error: "Failed to fetch recommendation details" };
  }
}