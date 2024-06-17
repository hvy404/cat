"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Fetches active job posts for a given user ID.
 *
 * @param userID - The ID of the user.
 * @returns An object containing the fetched data or an error message.
 */

const cookieStore = cookies();
const supabase = createClient(cookieStore);

export async function fetchActiveJobPosts(userID: string) {
  // fetch all rows under "job_postings" where the employer_id is equal to the userID and where 'active' is true
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "jd_uuid, title, location, location_type, security_clearance, posted_date, private_employer, active"
    )
    .eq("employer_id", userID)
    .eq("processed", true) // only fetch processed job postings
    .eq("active", true); // only fetch active job postings

  if (error) {
    return {
      message: "Failed to fetch active job posts.",
      error: error,
    };
  }

  // return the data to the client
  return { data };
}

const jobTypeMap: Record<string, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  contract: "Contract",
  temporary: "Temporary",
};

const locationTypeMap: Record<string, string> = {
  remote: "Remote",
  onsite: "On-site",
  hybrid: "Hybrid",
};

const clearanceLevelMap: Record<string, string> = {
  none: "None",
  basic: "Basic",
  elevated: "Elevated",
  high: "High",
};

interface JobPost {
  description: string;
  job_type: keyof typeof jobTypeMap;
  active: boolean;
  private_employer: boolean;
  min_salary: number;
  max_salary: number;
  location_type: keyof typeof locationTypeMap;
  security_clearance: keyof typeof clearanceLevelMap;
  salary_disclose: boolean;
  commission_pay: boolean;
  commission_percent: number;
  ote_salary: number;
}

/**
 * Fetches job posting specifics for a given user ID and job ID.
 *
 * @param userID - The ID of the user.
 * @param jobID - The ID of the job posting.
 * @returns An object containing the fetched data or an error message.
 */

export async function fetchJobPostSpecifics(userId: string, jobId: string) {
  const { data, error } = await supabase
    .from("job_postings")
    .select(
      "description, job_type, active, private_employer, min_salary, max_salary, location_type, security_clearance, salary_disclose, commission_pay, commission_percent, ote_salary"
    )
    .eq("employer_id", userId)
    .eq("jd_uuid", jobId);

  if (error) {
    console.error("Fetch error:", error);
    return { error, message: "Failed to fetch active job posts." };
  }

  if (!data || data.length === 0) {
    return { data: null, message: "No data found." };
  }

  const formattedData = data.map((item) => ({
    ...item,
    job_type: jobTypeMap[item.job_type] || item.job_type,
    location_type: locationTypeMap[item.location_type] || item.location_type,
    security_clearance:
      clearanceLevelMap[item.security_clearance] || item.security_clearance,
    description: item.description || "No description provided.",
  }));

  return { data: formattedData };
}
