"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Retrieves the resumes for a given user.
 * Use to display the resume choices when the user is applying for a job.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of resumes.
 * @throws If there is an error while fetching the resumes.
 */
export async function getResumes(userId: string) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
      .from("candidate_resume")
      .select("resume_name, address, default")
      .eq("candidate_identity", userId);

    if (error) {
      console.error("Supabase error:", error.message);
      throw new Error("Failed to fetch resumes");
    }

    if (!data || data.length === 0) {
      console.log("No resumes found for user:", userId);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Unexpected error in getResumes:", error);
    throw new Error("An unexpected error occurred while fetching resumes");
  }
}