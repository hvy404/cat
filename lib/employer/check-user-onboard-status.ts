"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Checks the onboarding status of an employer.
 * CURRENTLY UNIMPLEMENTED. Using a flag in Clerk metadata to indicate onboarding status.
 *
 * @param cuid - The unique identifier of the employer.
 * @returns The onboarded status of the employer.
 * @throws {Error} If the user is not found or there is an error checking the onboarding status.
 */
export async function checkOnboardingStatus(cuid: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("employers")
      .select("onboarded")
      .eq("employer_id", cuid)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("User not found");
    }

    return data.onboarded;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}

/**
 * Sets the onboarding status of an employer to true.
 *
 * @param cuid - The unique identifier of the employer.
 * @returns A boolean indicating whether the update was successful.
 * @throws {Error} If there is an error updating the onboarding status.
 */
export async function setOnboardingStatusComplete(
  cuid: string
): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("employers")
      .update({ onboarded: true })
      .eq("employer_id", cuid);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error setting onboarding status:", error);
    throw new Error("Failed to set onboarding status");
  }
}
