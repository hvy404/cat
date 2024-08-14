/**
 * Generates static information for a candidate's resume.
 * @param event - The event triggering the function.
 * @param step - The step in the function execution.
 * @returns A promise that resolves to an object containing the generated static points or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateJDInferred } from "@/lib/dashboard/infer/from-jd/inferred";

export const jobDescriptionGenerateInferred = inngest.createFunction(
  { id: "job-description-generate-inferred-info" },
  { event: "app/job-description-onboard-generate-inferred" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const jobDescriptionID = event.data.job_description.id;

    const { data, error } = await supabase
      .from("job_postings")
      .select("raw")
      .eq("jd_id", jobDescriptionID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to get extracted resume.",
        error: error,
      };
    }

    const rawExtract = data[0]?.raw; // Using optional chaining for safety

    // Check if rawExtract is null or undefined and return early
    if (rawExtract == null) {
      console.error("JD is null. Cannot generate static points.");
      return { message: "JD data is missing or invalid." };
    }

    // Proceed with processing since rawExtract is not null
    const result = await generateJDInferred(rawExtract, jobDescriptionID);
    if (result.success) {
      // console.log("Successfully generated static points");
      return { message: "Successfully generate static points" };
    } else {
      console.error("Failed to generate static points.");
      throw error;
    }
  }
);
