import { inngest } from "@/lib/inngest/client";
import { GetEvents, Inngest } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateLiftedInferred } from "@/lib/candidate/ingest-resume/generate-inferred-points";

type Events = GetEvents<typeof inngest>;

export const resumeGenerateInferred = inngest.createFunction(
  { id: "candidate-generate-inferred-info" },
  { event: "app/candidate-onboard-generate-inferred-points" },
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

    const rawExtract = data[0]?.raw; // Using optional chaining to handle undefined data safely

    // Check if rawExtract is null or undefined and return early
    if (rawExtract == null) {
      console.error("Cannot generate inferred points.");
      return { message: "Resume data is missing or invalid." };
    }

    // Proceed with processing since rawExtract is not null
    const result = await generateLiftedInferred(rawExtract, id);

    if (result.success) {
      // Proceed to generate Step 3 - Generate cypher
      await step.sendEvent("onboard-add-to-neo-workflow", {
        name: "app/candidate-add-to-neo-workflow",
        data: { user: { id: event.data.user.id } },
      });
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
