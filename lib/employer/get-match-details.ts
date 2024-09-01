"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export type AIMatch = {
  id: string;
  job_id: string;
  candidate_id: string;
  match_score: number;
  created_at: string;
  updated_at: string;
  employer_id: string;
  job_title: string;
  candidate_name: string;
  status: string;
};

type MatchData = {
  id: string;
  job_id: string;
  candidate_id: string;
  match_score: number;
  created_at: string;
  updated_at: string;
  employer_id: string;
  job_postings: { title: string };
  candidates: { name: string };
};

/**
 * Retrieves a list of AI-generated job matches for the specified employer.
 *
 * @param employerId - The ID of the employer to fetch matches for.
 * @returns A Promise that resolves to an array of `AIMatch` objects, representing the AI-generated job matches.
 */

export async function getAIMatches(employerId: string): Promise<AIMatch[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        job_id,
        candidate_id,
        match_score,
        created_at,
        updated_at,
        employer_id,
        status,
        job_postings(title),
        candidates(name)
      `
      )
      .eq("employer_id", employerId)
      .order("match_score", { ascending: false });

    if (error) {
      throw error;
    }

    if (!data) {
      return [];
    }

    // TODO: assertion as ANY is not my best momement. Revisit
    const aiMatches: AIMatch[] = (data as any[]).map((match: any) => ({
      id: match.id,
      job_id: match.job_id,
      candidate_id: match.candidate_id,
      match_score: match.match_score,
      created_at: match.created_at,
      updated_at: match.updated_at,
      employer_id: match.employer_id,
      job_title: match.job_postings.title,
      candidate_name: match.candidates.name,
      status: match.status,
    }));

    return aiMatches;
  } catch (error) {
    console.error("Error fetching AI matches:", error);
    throw error;
  }
}
