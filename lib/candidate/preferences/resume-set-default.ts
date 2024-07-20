"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Sets the default resume for a given user.
 * @param userId - The ID of the user.
 * @param resumeAddress - The address of the resume to set as default.
 * @returns A promise that resolves to a boolean indicating success or failure.
 * @throws If there is an error while updating the default resume.
 */
export async function setDefaultResume(userId: string, resumeAddress: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // First, set all resumes for this user to not be default
    const { error: updateError } = await supabase
      .from("candidate_resume")
      .update({ default: false })
      .eq("candidate_identity", userId);

    if (updateError) {
      console.error("Error resetting default resumes:", updateError.message);
      throw new Error("Failed to update resumes");
    }

    // Then, set the selected resume as default
    const { error: setDefaultError } = await supabase
      .from("candidate_resume")
      .update({ default: true })
      .eq("address", resumeAddress)
      .eq("candidate_identity", userId);

    if (setDefaultError) {
      console.error("Error setting default resume:", setDefaultError.message);
      throw new Error("Failed to set default resume");
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in setDefaultResume:", error);
    throw new Error(
      "An unexpected error occurred while setting the default resume"
    );
  }
}