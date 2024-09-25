"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function LoadPreviousJDSessions(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: previous, error } = await supabase
    .from("sow_meta")
    .select(
      "sow_id, created_at, name, detected_personnel, key_personnel, completed_onboard"
    )
    .eq("owner", userId);

  // If there is an error, throw it
  if (error) {
    throw error;
  }

  // We only return 'previous' where 'completed_onboard' is true
  // This is to ensure that we only show JDs that have been completed

  // Filter out the JDs that have not been completed
  const previousSessions = previous.filter(
    (row) => row.completed_onboard === true
  );

  // Return the data
  return previousSessions;
}

/**
 * Renames a SOW (Statement of Work) in the Supabase database.
 *
 * @param sowId - The ID of the SOW to be renamed.
 * @param newName - The new name for the SOW.
 * @returns The updated SOW data.
 * @throws {Error} If there is an error updating the SOW name in the database.
 */
export async function renameSow(sowId: string, newName: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sow_meta")
    .update({ name: newName })
    .eq("sow_id", sowId);

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Deletes the SOW (Statement of Work) metadata from the Supabase database.
 *
 * @param sowId - The ID of the SOW to be deleted.
 * @returns An object with a `success` flag and a `message` indicating the result of the deletion operation.
 * @throws {Error} If there is an error deleting the SOW metadata from the database.
 */
export async function deleteSowMeta(sowId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sow_meta")
    .delete()
    .eq("sow_id", sowId);

  if (error) {
    throw error;
  }

  return { success: true, message: "SOW metadata deleted successfully" };
}
