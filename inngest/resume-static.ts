import { inngest } from "@/lib/inngest/client";
import { GetEvents, Inngest } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateLiftedStatic } from "@/lib/candidate/ingest-resume/generate-static-points";

type Events = GetEvents<typeof inngest>;

export const resumeGenerateStatic = inngest.createFunction(
  { id: "candidate-generate-static-info" },
  { event: "app/candidate-onboard-generate-details" },
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

    const rawExtract = data[0].raw;

    // Ensure rawExtract is not null before generating static points from the raw resume
    if (rawExtract !== null) {
      await generateLiftedStatic(rawExtract, id);
    } else {
      console.error("Resume is null. Cannot generate static points.");
    }

    return { count: "1" };
  }
);
