"use server";

//import { createClerkSupabaseClient } from "@/lib/supabase/supabaseClerkServer";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getCandidateMatchesByJob(jobId: string) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    //TODO: use createClerkSupabaseClient after we add RLS 

  try {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        job_id,
        candidate_id,
        match_score,
        created_at,
        updated_at,
        status,
        candidates!candidate_id(name)
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const formattedData = data.map(match => {
        const candidateData = Array.isArray(match.candidates) 
          ? match.candidates[0] 
          : match.candidates;
  
        return {
          match_id: match.id,
          jobId: match.job_id,
          candidateId: match.candidate_id,
          matchScore: match.match_score,
          createdAt: match.created_at,
          updatedAt: match.updated_at,
          status: match.status,
          candidateName: candidateData?.name || null
        };
      });

    return formattedData;
  } catch (error) {
    console.error("Error fetching job matches:", error);
    throw error;
  }
}