"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

// Updated structure of the raw data returned by Supabase
interface RawApplicantData {
  id: string;
  created_at: string;
  status: string;
  resume_id: string;
  job_postings: {
    employer_id: string;
    title: string;
  };
  candidates: {
    id: number;
    email: string;
    name: string;
  };
}

async function getApplicantsDetails(employerId: string) {
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      created_at,
      status,
      resume_id,
      job_postings!inner (
        employer_id,
        title
      ),
      candidates!inner (
        id,
        email,
        name
      )
    `
    )
    .eq("job_postings.employer_id", employerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching applicants details:", error);
    return null;
  }

  // Transform the data to obfuscate field names with more descriptive terms
  const obfuscatedData = (data as unknown as RawApplicantData[])?.map(
    (item) => {
      const transformed = {
        appId: item.id,
        submitDate: item.created_at,
        appStatus: item.status,
        resumeKey: item.resume_id,
        jobInfo: {
          empId: item.job_postings.employer_id,
          positionName: item.job_postings.title,
        },
        applicantInfo: {
          applicantId: item.candidates.id,
          contactEmail: item.candidates.email,
          name: item.candidates.name,
        },
      };
      return transformed;
    }
  );

  return obfuscatedData;
}

export { getApplicantsDetails };
