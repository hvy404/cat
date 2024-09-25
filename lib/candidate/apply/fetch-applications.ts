"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface ApplicationWithJobTitle {
  job_id: string;
  title: string;
}

interface QueryResult {
  job_id: string;
  job_postings: {
    title: string;
  };
}

/**
 * Fetches the applications for the specified candidate, including the job title for each application.
 *
 * @param candidateId - The ID of the candidate to fetch applications for.
 * @returns An array of `ApplicationWithJobTitle` objects, containing the job ID and job title for each application.
 */
export async function getApplicationsByCandidate(
  candidateId: string
): Promise<ApplicationWithJobTitle[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      job_id,
      job_postings!inner (
        title
      )
    `
    )
    .eq("candidate_id", candidateId)
    .returns<QueryResult[]>();

  if (error) {
    console.error("Error fetching applications with job titles:", error);
    return [];
  }

  return (data || []).map((item) => ({
    job_id: item.job_id,
    title: item.job_postings.title,
  }));
}