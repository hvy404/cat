"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

interface DatabaseApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  created_at: string;
  job_postings: {
    employer_id: string;
  };
}

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

async function getEmployerJobApplications(
  employerId: string
): Promise<ObfuscatedApplication[] | null> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      candidate_id,
      created_at,
      job_postings!inner (
        employer_id
      )
    `
    )
    .eq("job_postings.employer_id", employerId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return null;
  }

  // Ensure the data matches our DatabaseApplication interface
  const typedData = data as unknown as DatabaseApplication[];

  // Log the obfuscated data
  const obfuscatedData = typedData.map(obfuscateApplication);

  return obfuscatedData;
}

export { getEmployerJobApplications };
export type { ObfuscatedApplication };
