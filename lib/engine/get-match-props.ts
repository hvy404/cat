/**
 * Retrieves the details of a match between a job posting and a candidate.
 *
 * @param matchId - The ID of the match to retrieve.
 * @param jobId - The ID of the job posting.
 * @param candidateId - The ID of the candidate.
 * @returns The match details, including the employer's contact email, employer name, job title, candidate name, and the match ID. Returns `null` if there is an error fetching the match details.
 */
"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface MatchAlert {
  to: string;
  employerName: string;
  jobTitle: string;
  candidateName: string;
  matchId: string;
}

interface JobPosting {
  title: string;
  employer: {
    contact_email: string;
    first_name: string;
    last_name: string;
  };
}

interface Candidate {
  name: string;
}

interface MatchData {
  id: string;
  job_postings: JobPosting;
  candidates: Candidate;
}

export async function getMatchDetails(
  matchId: string,
  jobId: string,
  candidateId: string
): Promise<MatchAlert | null> {
  console.log("Match ID:", matchId);
  console.log("Job ID:", jobId);
  console.log("Candidate:", candidateId);

  const supabase = createClient(cookies());
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      job_postings!inner(
        title,
        employer:employers!inner(contact_email, first_name, last_name)
      ),
      candidates!inner(name)
    `
    )
    .eq("id", matchId)
    .eq("job_id", jobId)
    .eq("candidate_id", candidateId)
    .single();

  if (error || !data) {
    console.error("Error fetching match details:", error);
    return null;
  }

  const matchData = data as unknown as MatchData;

  const jobPosting = matchData.job_postings;
  const employer = jobPosting.employer;
  const candidate = matchData.candidates;

  if (!employer || !candidate) {
    console.error("Missing employer or candidate data");
    return null;
  }

  return {
    to: employer.contact_email,
    employerName: `${employer.first_name} ${employer.last_name}`,
    jobTitle: jobPosting.title,
    candidateName: candidate.name,
    matchId: matchData.id,
  };
}
