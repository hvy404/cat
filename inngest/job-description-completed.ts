/**
 * This function is triggered when a job description is onboarded.
 * @param event - The event triggering the function.
 * @param step - The step in the function execution.
 * @returns A promise that resolves to an object containing the generated static points or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const jobDescriptionGenerateCompleted = inngest.createFunction(
  { id: "job-description-onboard-complete" },
  { event: "app/job-description-onboard-complete" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const jobDescriptionID = event.data.job_description.id;
    const user = event.data.job_description.employer;
    const sessionID = event.data.job_description.session;

    // Update 'processed' column in job_postings table to true in the row where the jd_id is jobDescriptionID
    const { error } = await supabase
      .from("job_postings")
      .update({
        processed: true,
      })
      .eq("jd_id", jobDescriptionID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to update job description.",
        error: error,
      };
    }

    return {
      message: "Job description processing completed.",
      success: true,
    };
  }
);
