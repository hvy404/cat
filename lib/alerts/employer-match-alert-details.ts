"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface MatchDetails {
  a: string; // job_title
  b: string; // candidate_name
  c: number; // match_score
  d: string; // created_at
  e: string; // job_id
  f: string; // candidate_id
}

interface RawMatchData {
  id: string;
  match_score: number;
  created_at: string;
  job_id: string;
  candidate_id: string;
  job_postings: { title: string };
  candidates: { name: string };
}

export async function getMatchAlertDetails(
  alertReferenceId: string
): Promise<MatchDetails | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      match_score,
      created_at,
      job_id,
      candidate_id,
      job_postings (
        title
      ),
      candidates (
        name
      )
    `
    )
    .eq("id", alertReferenceId)
    .single();

  if (error) {
    console.error("Error fetching match details:", error);
    return null;
  }

  if (!data) {
    console.error("No match found for reference_id:", alertReferenceId);
    return null;
  }

  const rawData = data as unknown as RawMatchData;

  // Restructure the data with obfuscated keys
  const obfuscatedMatchDetails: MatchDetails = {
    a: rawData.job_postings.title,
    b: rawData.candidates.name,
    c: rawData.match_score,
    d: rawData.created_at,
    e: rawData.job_id,
    f: rawData.candidate_id,
  };

  console.log("Match details:", obfuscatedMatchDetails);

  return obfuscatedMatchDetails;
}
