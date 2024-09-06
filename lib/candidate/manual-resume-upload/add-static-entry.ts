"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { FormValues } from "@/lib/candidate/manual-resume-upload/schema";

/**
 * Saves the resume data for a candidate in the Supabase database. Main step that fires candidate onboard of manual resume process.
 *
 * @param formData - The form data containing the resume information.
 * @param cuid - The unique identifier of the candidate.
 * @returns An object with a `success` boolean and the saved data or an error message.
 */
export async function saveResumeData(formData: FormValues, cuid: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("candidate_create")
    .insert({
      static: formData,
      user: cuid,
    })
    .select();

  if (error) {
    console.error("Error saving resume data:", error);
    return { success: false, error: error.message };
  }


  return { success: true, data };
}
