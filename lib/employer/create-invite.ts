"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

export async function checkExistingInvite(
  employerId: string,
  candidateId: string,
  jobId: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("invites")
    .select()
    .match({
      employer_id: employerId,
      candidate_id: candidateId,
      job_id: jobId,
    })
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows returned, which is fine
    console.error("Error checking existing invite:", error);
    return false;
  }

  return !!data;
}

export async function createInvite(
  employerId: string,
  candidateId: string,
  jobId: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  //console.log("Creating new invite");

  try {
    // Check for existing invite
    const existingInvite = await checkExistingInvite(
      employerId,
      candidateId,
      jobId
    );
    if (existingInvite) {
      return { success: false, message: "Invite already sent for this job" };
    }

    // Generate a unique ID for the invite
    const inviteId = createId();

    // 1. Add an entry to the invites table in Supabase
    const { data: invite, error: inviteError } = await supabase
      .from("invites")
      .insert({
        id: inviteId,
        employer_id: employerId,
        candidate_id: candidateId,
        job_id: jobId,
        status: "sent",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (inviteError) throw inviteError;

    // 2. Create an entry in the alerts table in Supabase
    const { error: alertError } = await supabase.from("alerts").insert({
      id: createId(),
      user_id: candidateId,
      type: "invite",
      reference_id: inviteId,
      status: "unread",
      created_at: new Date().toISOString(),
      description: "You have received a new job invitation",
      action_required: true,
    });

    if (alertError) throw alertError;

    return { success: true, message: "Invite sent successfully" };
  } catch (error) {
    console.error("Error creating invite:", error);
    return { success: false, message: "Failed to send invite" };
  }
}
