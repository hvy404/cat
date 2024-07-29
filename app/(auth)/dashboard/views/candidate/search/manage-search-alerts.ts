"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

export async function createJobAlert(userId: string, searchQuery: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const newAlertId = createId();
    const { data, error } = await supabase.from("job_search_alerts").insert([
      {
        id: newAlertId,
        user_id: userId,
        search_query: searchQuery,
        frequency: "daily",
      },
    ]);

    if (error) throw error;

    return {
      success: true,
      alertId: newAlertId,
      message: `Job alert for "${searchQuery}" created successfully!`,
    };
  } catch (error) {
    console.error("Error creating job alert:", error);
    return {
      success: false,
      message: "Failed to create job alert. Please try again.",
    };
  }
}

export async function disableJobAlert(userId: string, searchQuery: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("job_search_alerts")
      .update({ is_active: false })
      .match({ user_id: userId, search_query: searchQuery });

    if (error) throw error;

    return {
      success: true,
      message: `Job alert for "${searchQuery}" disabled successfully.`,
    };
  } catch (error) {
    console.error("Error disabling job alert:", error);
    return {
      success: false,
      message: "Failed to disable job alert. Please try again.",
    };
  }
}

export async function getJobAlerts(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("job_search_alerts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, alerts: data };
  } catch (error) {
    console.error("Error fetching job alerts:", error);
    return {
      success: false,
      message: "Failed to fetch job alerts. Please try again.",
    };
  }
}
