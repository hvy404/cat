"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface InviteDetails {
  a: string; // invite_id
  b: string; // job_title
  c: string; // employer_name
  d: string; // employer_email
  e: string; // invite_status
  f: string; // created_at
  g: string; // job_id
}

interface RawInviteData {
  id: string;
  status: string;
  created_at: string;
  job_id: string;
  job_postings: { title: string } | { title: string }[];
  employers:
    | { company_name: string; contact_email: string }
    | { company_name: string; contact_email: string }[];
}

export async function getInviteAlertDetails(
  alertReferenceId: string
): Promise<InviteDetails | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("invites")
    .select(
      `
      id,
      status,
      created_at,
      job_id,
      job_postings (
        title
      ),
      employers (
        company_name,
        contact_email
      )
    `
    )
    .eq("id", alertReferenceId)
    .single();

  if (error) {
    console.error("Error fetching invite details:", error);
    return null;
  }

  if (!data) {
    console.error("No invite found for reference_id:", alertReferenceId);
    return null;
  }

  const rawData = data as unknown as RawInviteData;

  const jobPostings = Array.isArray(rawData.job_postings)
    ? rawData.job_postings[0]
    : rawData.job_postings;
  const employers = Array.isArray(rawData.employers)
    ? rawData.employers[0]
    : rawData.employers;

  // Restructure the data with obfuscated keys
  const obfuscatedInviteDetails: InviteDetails = {
    a: rawData.id,
    b: jobPostings?.title || "Unknown",
    c: employers?.company_name || "Private",
    d: employers?.contact_email || "Unknown",
    e: rawData.status,
    f: rawData.created_at,
    g: rawData.job_id,
  };

  return obfuscatedInviteDetails;
}