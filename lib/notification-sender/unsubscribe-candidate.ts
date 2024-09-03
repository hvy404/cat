"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Updates the email notification settings for a candidate.
 *
 * @param userId - The ID of the candiate.
 * @param type - The type of email notification to update, either 'resume' or 'invite'.
 * @returns An object with a `success` boolean and the updated data or error.
 */

export async function updateCandidateEmailSettings(
  userId: string,
  type: "resume" | "invite"
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check type
  const columnToUpdate =
    type === "resume" ? "email_resume_view" : "email_invite";

  try {
    const { data, error } = await supabase
      .from("candidates")
      .update({ [columnToUpdate]: false })
      .eq("identity", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating candidate ${columnToUpdate}:`, error);
    return { success: false };
  }
}
