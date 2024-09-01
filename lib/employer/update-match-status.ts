"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { AIMatch } from "@/lib/employer/get-match-details"; // Type

export type MatchStatus = "new" | "reviewed" | "contacted" | "rejected";

/**
 * Updates the status of an AI match in the database.
 *
 * @param matchId - The ID of the match to update.
 * @param newStatus - The new status to set for the match.
 * @returns The updated AI match object.
 * @throws {Error} If the match is not found or the update fails.
 */
export async function updateMatchStatus(
  matchId: string,
  newStatus: MatchStatus
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("matches")
      .update({ status: newStatus })
      .eq("id", matchId)
      .select();

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Match not found or update failed");
    }

    return data[0] as AIMatch;
  } catch (error) {
    console.error("Error updating match status:", error);
    throw error;
  }
}
