"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

async function getEmployerJobApplications(employerId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      job_id,
      candidate_id,
      created_at,
      job_postings!inner (
        employer_id
      )
    `)
    .eq('job_postings.employer_id', employerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employer job applications:', error);
    return null;
  }

  return data;
}

export { getEmployerJobApplications };