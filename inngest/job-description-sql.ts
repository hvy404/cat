/**
 * This function adds structured data points of the job description to the database.
 * @param event - The event triggering the function.
 * @param step - The step in the function execution.
 * @returns A promise that resolves to an object containing the generated static points or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const jobDescriptionAddStructured = inngest.createFunction(
  {
    id: "job-description-add-structured-datapoints",
    cancelOn: [
      {
        event: "app/job-description-parser-cancel",
        if: "async.data.session == event.data.job_description.session",
      },
    ],
  },
  { event: "app/job-description-add-structured-datapoints" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const jobDescriptionID = event.data.job_description.id;
    //const user = event.data.job_description.employer;

    // Retreive 'static' and 'inferred' columns from the job_postings table where the row .eq is the jobDescriptionID
    const { data, error } = await supabase
      .from("job_postings")
      .select("static, inferred")
      .eq("jd_id", jobDescriptionID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to retrieve structured data points.",
        error: error,
      };
    }

    const staticData = data[0].static;
    const inferredData = data[0].inferred;

    // Merge the 'static' and 'inferred' columns into a single object
    const structuredData = { ...staticData, ...inferredData };

    const title = structuredData.jobTitle;
    const description = structuredData.summary;
    const location = structuredData.location;
    const locationType = structuredData.locationType;
    const jobType = structuredData.jobType;
    const salaryRange = structuredData.salaryRange;
    const clearanceLevel = structuredData.clearanceLevel;
    const commissionPay = structuredData.commissionPay;
    const commissionPercent = structuredData.commissionPercent;
    const oteSalary = structuredData.ote_salary;

    // Update the supabase row with the corresponding structured data points in the row that .eq is the jobDescriptionID
    const { error: updateError } = await supabase
      .from("job_postings")
      .update({
        title: title,
        description: description,
        location: location,
        location_type: locationType,
        job_type: jobType,
        min_salary: salaryRange.startingSalary,
        max_salary: salaryRange.maximumSalary,
        security_clearance: clearanceLevel,
        commission_pay: commissionPay,
        commission_percent: commissionPercent,
        ote_salary: oteSalary,
      })
      .eq("jd_id", jobDescriptionID);

    if (updateError) {
      console.error(updateError);
      return {
        message: "Failed to add structured data points to SQL database.",
        error: updateError,
      };
    }

    return {
      message: "Added structured data points to SQL database.",
      success: true,
    };
  }
);
