"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function countActiveJobs(employerId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error, count } = await supabase
      .from("job_postings")
      .select("job_id", { count: "exact" })
      .eq("employer_id", employerId)
      .eq("active", true);

    if (error) {
      throw error;
    }

    return count;
  } catch (error) {
    console.error("Failed to count active jobs:", error);
    throw new Error("Failed to count active jobs");
  }
}
