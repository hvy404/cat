"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Updates the email notification settings for an employer.
 *
 * @param userId - The ID of the employer.
 * @param type - The type of email notification to update, either 'app' or 'match'.
 * @returns An object with a `success` boolean and the updated data or error.
 */

export async function updateEmployerEmailSettings(
  userId: string,
  type: "app" | "match"
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check type
  const columnToUpdate = type === "app" ? "email_applicant" : "email_match";

  try {
    const { data, error } = await supabase
      .from("employers")
      .update({ [columnToUpdate]: false })
      .eq("employer_id", userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error(`Error updating employer ${columnToUpdate}:`, error);
    return { success: false };
  }
}
