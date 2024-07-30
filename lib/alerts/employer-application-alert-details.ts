"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface ApplicationAlertDetails {
  application_id: string;
  job_title: string;
  candidate_name: string;
  candidate_email: string;
  application_status: string;
  created_at: string;
  resume_id: string;
}

interface RawApplicationData {
  id: string;
  status: string;
  created_at: string;
  resume_id: string;
  job_postings: { title: string } | { title: string }[];
  candidates: { name: string; email: string } | { name: string; email: string }[];
}

export async function getApplicationAlertDetails(alertReferenceId: string): Promise<ApplicationAlertDetails | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("applications")
    .select(`
      id,
      status,
      created_at,
      resume_id,
      job_postings (
        title
      ),
      candidates (
        name,
        email
      )
    `)
    .eq("id", alertReferenceId)
    .single();

  if (error) {
    console.error("Error fetching application details:", error);
    return null;
  }

  if (!data) {
    console.error("No application found for reference_id:", alertReferenceId);
    return null;
  }

  const rawData = data as unknown as RawApplicationData;

  const jobPostings = Array.isArray(rawData.job_postings) ? rawData.job_postings[0] : rawData.job_postings;
  const candidates = Array.isArray(rawData.candidates) ? rawData.candidates[0] : rawData.candidates;

  // Restructure the data to match the ApplicationAlertDetails interface
  const applicationDetails: ApplicationAlertDetails = {
    application_id: rawData.id,
    job_title: jobPostings?.title || 'Unknown',
    candidate_name: candidates?.name || 'Unknown',
    candidate_email: candidates?.email || 'Unknown',
    application_status: rawData.status,
    created_at: rawData.created_at,
    resume_id: rawData.resume_id
  };

  return applicationDetails;
}