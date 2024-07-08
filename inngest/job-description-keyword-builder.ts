/**
 * Generates potential role keywords for a job description.
 * @param event - The event triggering the function.
 * @param step - The step in the function execution.
 * @returns A promise that resolves to an object containing the generated static points or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateJobRoleKeywords } from "@/lib/dashboard/infer/from-jd/generate-role-keywords";

export const jobDescriptionGenerateKeyworks = inngest.createFunction(
  { id: "job-description-generate-role-keywords" },
  { event: "app/job-description-onboard-generate-keywords" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const jobDescriptionID = event.data.job_description.id;

    const { data, error } = await supabase
      .from("job_postings")
      .select("static")
      .eq("jd_id", jobDescriptionID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to get extracted resume.",
        error: error,
      };
    }

    const staticJobDescription = data[0]?.static;

    // Remove unnecessary fields from the job description to generate keywords
    const jobDesc = { ...staticJobDescription };
    delete jobDesc.company;
    delete jobDesc.benefits;
    delete jobDesc.location;
    delete jobDesc.jobTitle;
    delete jobDesc.salaryRange;
    delete jobDesc.applicationDeadline;
    delete jobDesc.summary;

    // Check if rawExtract is null or undefined and return early
    if (staticJobDescription == null) {
      console.error("JD is null. Cannot generate static points.");
      return { message: "JD data is missing or invalid." };
    }

    try {
      const detectedRoles = await generateJobRoleKeywords(jobDesc);

      return { message: "Generated keywords successfully." };
    } catch (error) {
      console.error("Error generating keywords", error);
      return { message: "Failed to generate keywords.", error: error };
    }
  }
);
