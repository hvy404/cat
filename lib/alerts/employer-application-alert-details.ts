"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface ApplicationDetails {
  a: string; // application_id
  b: string; // job_title
  c: string; // candidate_name
  d: string; // candidate_email
  e: string; // application_status
  f: string; // created_at
  g: string; // resume_id
  h: string; // candidate_identity
}

interface RawApplicationData {
  id: string;
  status: string;
  created_at: string;
  resume_id: string;
  job_postings: { title: string } | { title: string }[];
  candidates:
    | { name: string; email: string; identity: string }
    | { name: string; email: string; identity: string }[];
}

export async function getApplicationAlertDetails(
  alertReferenceId: string
): Promise<ApplicationDetails | { error: string; code: string }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      status,
      created_at,
      resume_id,
      job_postings (
        title
      ),
      candidates (
        name,
        email,
        identity
      )
    `
    )
    .eq("id", alertReferenceId)
    .single();

  if (error) {
    return {
      error: error.message,
      code: error.code,
    };
  }

  if (!data) {
    return {
      error: "No application found",
      code: "NOT_FOUND",
    };
  }

  const rawData = data as unknown as RawApplicationData;

  const jobPostings = Array.isArray(rawData.job_postings)
    ? rawData.job_postings[0]
    : rawData.job_postings;
  const candidates = Array.isArray(rawData.candidates)
    ? rawData.candidates[0]
    : rawData.candidates;

  // Restructure the data with obfuscated keys
  const obfuscatedApplicationDetails: ApplicationDetails = {
    a: rawData.id,
    b: jobPostings?.title || "Unknown",
    c: candidates?.name || "Unknown",
    d: candidates?.email || "Unknown",
    e: rawData.status,
    f: rawData.created_at,
    g: rawData.resume_id,
    h: candidates?.identity || "Unknown",
  };

  console.log("Application details:", obfuscatedApplicationDetails);

  return obfuscatedApplicationDetails;
}
