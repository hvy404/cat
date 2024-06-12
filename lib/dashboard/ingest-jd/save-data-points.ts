"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Save edited job details to the database.
 * @param {Object} jobDetails - An object containing all the job details fields.
 * @param {string} jdUUID - The unique identifier for the job description.
 */

interface JobDetails {
  jobTitle: string;
  locationType?: "remote" | "onsite" | "hybrid" | undefined;
  minSalary?: number;
  maxSalary?: number;
  clearanceLevel?: "none" | "basic" | "elevated" | "high" | undefined;
  discloseSalary?: boolean;
  commissionPay?: boolean;
  commissionPercent?: number;
  privateEmployer?: boolean;
  salaryOte?: number;
}

export async function SaveJobDetails(jobDetails: JobDetails, jdUUID: string) {
  noStore();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Map your form fields to your database columns correctly
  const { error } = await supabase
    .from("job_postings")
    .update({
      title: jobDetails.jobTitle,
      location_type: jobDetails.locationType,
      min_salary: jobDetails.minSalary,
      max_salary: jobDetails.maxSalary,
      security_clearance: jobDetails.clearanceLevel,
      salary_disclose: jobDetails.discloseSalary,
      commission_pay: jobDetails.commissionPay,
      commission_percent: jobDetails.commissionPercent,
      private_employer: jobDetails.privateEmployer,
      ote_salary: jobDetails.salaryOte,
    })
    .eq("jd_uuid", jdUUID);

  if (error) {
    console.error("Error updating job details: ", error);
    return { error };
  }

  return { message: "Job details updated successfully!", success: true };
}
