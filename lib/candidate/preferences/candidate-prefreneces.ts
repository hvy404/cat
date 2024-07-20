"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface CandidatePreferences {
  matching_opt_in: boolean;
  email_alert_opt_in: boolean;
  interview_invite_opt_in: boolean;
}

/**
 * Retrieves the current preferences for a given candidate.
 * @param identity - The unique identifier for the candidate.
 * @returns A promise that resolves to the candidate's preferences.
 * @throws If there is an error while fetching the preferences.
 */
export async function getCandidatePreferences(identity: string): Promise<CandidatePreferences> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("candidates")
      .select("matching_opt_in, email_alert_opt_in, interview_invite_opt_in")
      .eq("identity", identity)
      .single();

    if (error) {
      console.error("Error fetching candidate preferences:", error.message);
      throw new Error("Failed to fetch candidate preferences");
    }

    return data as CandidatePreferences;
  } catch (error) {
    console.error("Unexpected error in getCandidatePreferences:", error);
    throw new Error("An unexpected error occurred while fetching candidate preferences");
  }
}

/**
 * Updates the preferences for a given candidate.
 * @param identity - The unique identifier for the candidate.
 * @param preferences - An object containing the preferences to update.
 * @returns A promise that resolves to a boolean indicating success or failure.
 * @throws If there is an error while updating the preferences.
 */
export async function updateCandidatePreferences(
  identity: string,
  preferences: Partial<CandidatePreferences>
): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
      .from("candidates")
      .update(preferences)
      .eq("identity", identity);

    if (error) {
      console.error("Error updating candidate preferences:", error.message);
      throw new Error("Failed to update candidate preferences");
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in updateCandidatePreferences:", error);
    throw new Error("An unexpected error occurred while updating candidate preferences");
  }
}