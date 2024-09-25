"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Checks the subscription level for the given employer ID.
 *
 * @param cuid - The employer ID to check the subscription for.
 * @returns An object with the subscription level, start date, and end date, or `null` values if no subscription is found.
 */
export async function checkUserSubscription(cuid: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("subscription")
      .select("level, start_date, end_date")
      .eq("employer_id", cuid)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      return {
        level: null,
        startDate: null,
        endDate: null,
      };
    }

    return {
      level: data.level,
      startDate: data.start_date,
      endDate: data.end_date,
    };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    throw new Error("Failed to fetch subscription data");
  }
}
