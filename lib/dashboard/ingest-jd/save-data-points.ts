"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { unstable_noStore as noStore } from "next/cache";
import { contentModerationWordFilter } from "@/lib/content-moderation/explicit_word_filter"

/**
 * Save edited job details to the database.
 * @param {Object} jobDetails - An object containing all the job details fields.
 * @param {string} jdUUID - The unique identifier for the job description.
 */

interface JobDetails {
  jobTitle: string;
  location?: JobLocation[];
  location_type: string;
  min_salary?: number | null;
  max_salary?: number | null;
  salary_ote?: number | null;
  commission_percent?: number | null;
  security_clearance: string;
  salary_disclose?: boolean;
  commission_pay?: boolean;
  private_employer?: boolean;
  ote_salary?: number | null;
  compensation_type?: string;
  hourly_comp_min?: number | null;
  hourly_comp_max?: number | null;
}

interface JobLocation {
  city?: string;
  state?: string;
  zipcode?: string;
}

export async function SaveJobDetails(jobDetails: JobDetails, jdUUID: string) {
  noStore();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

   // Check if the job title contains any bad words
   const contentFilter = await contentModerationWordFilter(jobDetails.jobTitle);

   if (contentFilter) {
     return {
       error: "Inappropriate language detected",
     };
   }

  // Map your form fields to your database columns correctly
  const { error } = await supabase
    .from("job_postings")
    .update({
      title: jobDetails.jobTitle,
      location_type: jobDetails.location_type,
      min_salary: jobDetails.min_salary,
      max_salary: jobDetails.max_salary,
      security_clearance: jobDetails.security_clearance,
      salary_disclose: jobDetails.salary_disclose,
      commission_pay: jobDetails.commission_pay,
      commission_percent: jobDetails.commission_percent,
      private_employer: jobDetails.private_employer,
      ote_salary: jobDetails.ote_salary,
      compensation_type: jobDetails.compensation_type,
      hourly_comp_min: jobDetails.hourly_comp_min,
      hourly_comp_max: jobDetails.hourly_comp_max,
      // Do not stringy the location array
      location: jobDetails.location
        ? jobDetails.location.map((loc) => ({
            city: loc.city,
            state: loc.state,
            zipcode: loc.zipcode,
          }))
        : null,
    })
    .eq("jd_id", jdUUID);

  if (error) {
    console.error("Error updating job details: ", error);
    return { error };
  }

  return { message: "Job details updated successfully!", success: true };
}
