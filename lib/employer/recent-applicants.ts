"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

// Updated database structure to match Supabase response
interface DatabaseApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  created_at: string;
  job_postings: {
    employer_id: string;
  };
}

// Obfuscated structure (unchanged)
interface ObfuscatedApplication {
  appId: string;
  jobRef: string;
  candidateRef: string;
  submissionDate: string;
}

function obfuscateApplication(app: DatabaseApplication): ObfuscatedApplication {
  return {
    appId: app.id,
    jobRef: app.job_id,
    candidateRef: app.candidate_id,
    submissionDate: app.created_at,
  };
}

async function getEmployerJobApplications(employerId: string): Promise<ObfuscatedApplication[] | null> {
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

  // Log the raw data from Supabase
  console.log('Raw data from Supabase:', data);

  // Ensure the data matches our DatabaseApplication interface
  const typedData = data as unknown as DatabaseApplication[];

  // Log the obfuscated data
  const obfuscatedData = typedData.map(obfuscateApplication);
  console.log('Obfuscated data:', obfuscatedData);

  return obfuscatedData;
}

export { getEmployerJobApplications };
export type { ObfuscatedApplication };