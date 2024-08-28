/**
 * Retrieves the AI recommendations for the specified employer, including the count of recommendations within the last 7 days.
 *
 * @param employerId - The ID of the employer to fetch recommendations for.
 * @returns An object containing the recommendations and the count of recommendations.
 */
"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/supabaseClerkServer";

export async function getAIRecommendations(employerId: string) {
  const supabase = createClerkSupabaseClient();

  try {
    // Get the current timestamp
    const now = new Date();
    // Calculate the timestamp for 7 days ago
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .eq("employer_id", employerId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    const count = data.length;

    return {
      recommendations: data,
      count: count,
    };
  } catch (error) {
    console.error("Error fetching AI recommendations");
    throw error;
  }
}
