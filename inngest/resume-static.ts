/**
 * Generates static information for a candidate's resume.
 * @param event - The event triggering the function.
 * @param step - The step in the function execution.
 * @returns A promise that resolves to an object containing the generated static points or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateLiftedStatic } from "@/lib/candidate/ingest-resume/generate-static-points";

export const resumeGenerateStatic = inngest.createFunction(
  { id: "candidate-generate-static-info" },
  { event: "app/candidate-onboard-generate-static" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const id = event.data.user.id;

    //console.log("candidate-generate-static-info function activated");

    const { data, error } = await supabase
      .from("candidate_create")
      .select("raw")
      .eq("user", id);

    if (error) {
      //console.error(error);
      return {
        message: "Failed to get extracted resume.",
        error: error,
      };
    }

    const rawExtract = data[0]?.raw; // Using optional chaining for safety

    // Check if rawExtract is null or undefined and return early
    if (rawExtract == null) {
      console.error("Resume is null. Cannot generate static points.");
      return { message: "Resume data is missing or invalid." };
    }

    // Proceed with processing since rawExtract is not null
    const result = await generateLiftedStatic(rawExtract, id);
    if (result.success) {
      // console.log("Successfully generated static points");
      return { message: "Successfully generate static points" };
    } else {
      console.error("Failed to generate static points.");
      throw error;
    }
  }
);
