"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Adds a new candidate entry to the "candidates" table in the Supabase database.
 * This is used in "manual resume" creation. We have to manually add the candidate info
 *
 * @param userEmail - The email address of the candidate.
 * @param cuid - The unique identifier for the candidate.
 * @param full_name - The full name of the candidate.
 * @returns An object with a `success` boolean and the inserted data or an error message.
 */

export async function addCandidateEntryManually(
  userEmail: string,
  cuid: string,
  full_name: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("candidates")
    .insert({
      email: userEmail,
      matching_opt_in: true,
      filename: "manual.docx",
      onboarded: false,
      identity: cuid,
      interview_invite_opt_in: true,
      email_alert_opt_in: true,
      name: full_name,
      email_resume_view: true,
      email_invite: true,
    })
    .select();

  if (error) {
    console.error("Error adding candidate entry:", error);
    return { success: false, error: "Error adding candidate entry" };
  }

  return { success: true };
}
