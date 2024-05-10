/**
 * Generates inferred points for a candidate's resume.
 * @param event - The event triggering the function.
 * @param step - The step in the event.
 * @returns A promise that resolves to an object with the generated inferred points or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateLiftedInferred } from "@/lib/candidate/ingest-resume/generate-inferred-points";

export const resumeGenerateInferred = inngest.createFunction(
  { id: "candidate-generate-inferred-info" },
  { event: "app/candidate-onboard-generate-inferred-points" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const id = event.data.user.id;

    console.log("candidate-generate-inferred-info function activated");

    const { data, error } = await supabase
      .from("candidate_resume")
      .select("raw")
      .eq("user", id);

    if (error) {
      console.error(error);
      return {
        message: "Failed to get extracted resume.",
        error: error,
      };
    }

    const rawExtract = data[0]?.raw; // Using optional chaining to handle undefined data safely

    // Check if rawExtract is null or undefined and return early
    if (rawExtract == null) {
      console.error("Cannot generate inferred points.");
      return { message: "Resume data is missing or invalid." };
    }

    // Proceed with processing since rawExtract is not null
    const result = await generateLiftedInferred(rawExtract, id);

    if (result.success) {
      // console.log("Successfully generated inferred points");
      return {
        message: "Successfully generate inferred points",
        success: true,
      };
    } else {
      console.error("Failed to generate inferred points.");
      throw error;
    }
  }
);
