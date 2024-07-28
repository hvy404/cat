"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface JobPosting {
  jd_id: any;
  title: any;
}

interface Employer {
  employer_id: any;
  company_id: any;
}

interface SupabaseInvite {
  id: any;
  status: any;
  created_at: any;
  job_id: any;
  job_postings: JobPosting | null;
  employers: Employer | null;
}

/**
 * Fetches the user's invites from the Supabase database.
 * TODO: Add Redis caching to reduce calls
 *
 * @param candidateId - The ID of the candidate to fetch invites for.
 * @returns An object with the following properties:
 *   - `success`: A boolean indicating whether the operation was successful.
 *   - `invites`: An array of objects representing the user's invites, with the following properties:
 *     - `id`: The ID of the invite.
 *     - `title`: The title of the job posting.
 *     - `company`: The name of the company that sent the invite.
 *     - `status`: The status of the invite.
 *     - `inviteDate`: The date the invite was created.
 *   - `error`: If `success` is false, this will contain an error message.
 */
export async function fetchUserInvites(candidateId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("invites")
      .select(`
        id,
        status,
        created_at,
        job_id,
        job_postings (
          jd_id,
          title
        ),
        employers (
          employer_id,
          company_id
        )
      `)
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const typedData = data as unknown as SupabaseInvite[];

    // Fetch company names in a separate query
    const companyIds = Array.from(new Set(typedData
      .map(invite => invite.employers?.company_id)
      .filter(Boolean)
    ));

    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("company_id, name")
      .in("company_id", companyIds);

    if (companiesError) throw companiesError;

    const companyMap = Object.fromEntries(companies.map(company => [company.company_id, company.name]));

    return {
      success: true,
      invites: typedData.map((invite: SupabaseInvite) => ({
        id: invite.id,
        title: invite.job_postings?.title || 'Untitled Job',
        company: invite.employers?.company_id ? (companyMap[invite.employers.company_id] || 'Unknown Company') : 'Unknown Company',
        status: invite.status,
        inviteDate: invite.created_at,
        jobId: invite.job_id
      }))
    };
  } catch (error) {
    console.error("Error fetching user invites:", error);
    return { success: false, error: "Failed to fetch invites" };
  }
}