import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateResumeIntro } from "@/lib/candidate/ingest-resume/generate-intro";

export const resumeGenerateIntroduction = inngest.createFunction(
  { id: "candidate-generate-candidate-intro" },
  { event: "app/candidate-generate-candidate-intro" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const id = event.data.user.id;

    const { data, error } = await supabase
      .from("candidate_create")
      .select("inferred, modified_static")
      .eq("user", id);

    if (error) {
      console.error(error);
      return {
        message: "Failed to get extracted resume.",
        error: error,
      };
    }

    const inferred = data[0].inferred;
    const modifiedStatic = data[0].modified_static;
    const candidate = { ...inferred, ...modifiedStatic };

    const introResult = await generateResumeIntro(candidate);

    if (!introResult.success) {
      console.error("Error generating introduction:", introResult.message);
      return {
        message: "Failed to generate introduction.",
        error: introResult.message,
      };
    }

    // Add introResult.intro into modified_static
    const updatedModifiedStatic = {
      ...modifiedStatic,
      intro: introResult.intro,
    };

    // Update the database with the new modified_static object
    const { error: updateError } = await supabase
      .from("candidate_create")
      .update({ modified_static: updatedModifiedStatic })
      .eq("user", id);

    if (updateError) {
      console.error("Error updating database:", updateError);
      return {
        message: "Failed to save introduction to database.",
        error: updateError,
      };
    }

    return {
      message: "Successfully generated and saved introduction.",
    };
  }
);
