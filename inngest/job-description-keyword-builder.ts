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
  
      try {
        const { data, error } = await supabase
          .from("job_postings")
          .select("static")
          .eq("jd_id", jobDescriptionID)
          .single();
  
        if (error) throw error;
  
        if (!data?.static) {
          throw new Error("Job description data is missing or invalid.");
        }
  
        const jobDesc = { ...data.static };
        const fieldsToRemove = ['company', 'benefits', 'location', 'jobTitle', 'salaryRange', 'applicationDeadline', 'summary'];
        fieldsToRemove.forEach(field => delete jobDesc[field]);
  
        const detectedRoles = await generateJobRoleKeywords(jobDesc);
  
        if (detectedRoles && Array.isArray(detectedRoles.similarJobTitle)) {
          const { error: updateError } = await supabase
            .from("job_postings")
            .update({ role_names: detectedRoles })
            .eq("jd_id", jobDescriptionID);
  
          if (updateError) throw updateError;
        }
  
        return { message: "Generated and updated keywords successfully." };
      } catch (error) {
        console.error("Error in job description keyword generation:", error);
        return {
          message: "Failed to process job description keywords.",
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
  );