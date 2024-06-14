"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";


export async function LoadPreviousJDSessions(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Query 'sow_meta' table in Supabase, get all rows where 'owner' is equal to the userId
  const { data: previous, error } = await supabase
    .from("sow_meta")
    .select("sow_id, created_at, name, detected_personnel, key_personnel, completed_onboard") 
    .eq("owner", userId);

  // If there is an error, throw it
  if (error) {
    throw error;
  }

  // We only return 'previous' wheere 'completed_onboard' is true
  // This is to ensure that we only show JDs that have been completed

  // Filter out the JDs that have not been completed
  const previousSessions = previous.filter((row) => row.completed_onboard === true);

  // Return the data
  return previousSessions;
}
