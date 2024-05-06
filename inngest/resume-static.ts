import { inngest } from "@/lib/inngest/client";
import { GetEvents, Inngest } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateLiftedStatic } from "@/lib/candidate/ingest-resume/generate-static-points";

type Events = GetEvents<typeof inngest>;

export const resumeGenerateStatic = inngest.createFunction(
  { id: "candidate-generate-static-info" },
  { event: "app/candidate-onboard-generate-static" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const id = event.data.user.id;

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

    const rawExtract = data[0]?.raw; // Using optional chaining for safety

    // Check if rawExtract is null or undefined and return early
    if (rawExtract == null) {
      console.error("Resume is null. Cannot generate static points.");
      return { message: "Resume data is missing or invalid." };
    }

    // Proceed with processing since rawExtract is not null
    const result = await generateLiftedStatic(rawExtract, id);
    if (result.success) {
      // Proceed to generate Step 2 - Generate inferred points
      await step.sendEvent("onboard-generate-inferred", {
        name: "app/candidate-onboard-generate-inferred-points",
        data: { user: { id: event.data.user.id } },
      });
      return { message: "Successfully generate static points" };
    } else {
      console.error("Failed to generate static points.");
      throw error;
    }
  }
);
