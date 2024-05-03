import { inngest } from "@/lib/inngest/client";
import { GetEvents, Inngest } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateLiftedInferred } from "@/lib/candidate/ingest-resume/generate-inferred-points";

type Events = GetEvents<typeof inngest>;

export const resumeGenerateInferred = inngest.createFunction(
  { id: "candidate-generate-inferred-info" },
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
      await generateLiftedInferred(rawExtract, id);
    } else {
      console.error("Resume is empty. Cannot generate inferred points.");
    }

    return { count: "1" };
  }
);
