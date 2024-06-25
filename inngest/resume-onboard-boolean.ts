import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Updates the onboarded status of a candidate in the database.
 * @param event - The event object containing the user ID.
 * @param step - The step object.
 * @returns A message indicating the success or failure of the operation.
 * @throws An error if there was an error setting the onboarded status.
 */
export const resumeOnboardBooleanStatus = inngest.createFunction(
  { id: "candidate-onboard-boolean-true" },
  { event: "app/candidate-onboard-boolean-true" },
  async ({ event, step }) => {
    const id = event.data.user.id;

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    try {
      const { data, error } = await supabase
        .from("candidates")
        .update({ onboarded: true })
        .eq("uuid", id);

        console.log(error);

      if (error) throw new Error(error.message);

      return { message: "Candidate onboarded successfully." };
    } catch (err) {
      throw new Error("There was an error setting onboarded status.");
    }
  }
);
