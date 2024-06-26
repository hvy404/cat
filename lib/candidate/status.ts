"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Retrieves the onboarded status of a candidate.
 * @param candidateId - The ID of the candidate.
 * @returns A Promise that resolves to a boolean indicating if the candidate is onboarded, or null if there's an error.
 */
export async function candidateStatus(
  candidateId: string
): Promise<boolean | null> {
  if (!candidateId) {
    return null;
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("candidates")
      .select("onboarded")
      .eq("uuid", candidateId)
      .single();

    if (error) {
      console.error("Error fetching candidate status");
      return null;
    }

    return data.onboarded;
  } catch (error) {
    console.error("Unexpected error in candidateStatus");
    return null;
  }
}