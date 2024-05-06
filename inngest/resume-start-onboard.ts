import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { resumeParserUpload } from "@/lib/candidate/ingest-resume/retrieve-resume";

export const resumeExtract = inngest.createFunction(
  { id: "candidate-extract-resume" },
  { event: "app/candidate-start-onboard" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const filename = event.data.user.resume;

    const rawExtract = await resumeParserUpload(filename);

    const { error } = await supabase
      .from("candidate_resume")
      .upsert([{ raw: rawExtract, user: event.data.user.id }], {
        onConflict: "user",
      });

    if (error) {
      console.error(error);
      return {
        message: "Failed to insert extracted resume.",
        error: error,
      };
    }

    console.log("Step 0 Started");

    // Extract details from the resume
    await step.sendEvent("onboard-move-to-extract-details", {
      name: "app/candidate-onboard-generate-static",
      data: {
        user: {
          id: event.data.user.id,
        },
      },
    });

    return { message: "Resume extracted successfully." };
  }
);
