import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { moveResumeFile } from "@/lib/candidate/ingest-resume/move-resume-to-final";

/**
 * Cleanup operations for the onboarding process.
 * 1) Move user uploaded resume to resume bucket and set as default resume to use.
 * @param event - The event object containing the user ID.
 * @param step - The step object.
 * @returns A message indicating the success or failure of the operation.
 * @throws An error if there was an error setting the onboarded status.
 */
export const resumeOnboardCleanup = inngest.createFunction(
  { id: "candidate-resume-file-to-final-storage" },
  { event: "app/candidate-resume-file-to-final-storage" },
  async ({ event, step }) => {
    const id = event.data.user.id;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Move the resume file to the final destination
    const moveResult = await step.run("Move resume file", async () => {
      return await moveResumeFile(id);
    });

    if (!moveResult.success) {
      throw new Error(`Failed to move resume file`);
    }
  }
);
