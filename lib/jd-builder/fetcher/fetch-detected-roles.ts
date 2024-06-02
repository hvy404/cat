"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GrabDetectedRoles(sowID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sow_meta")
    .select("detected_personnel")
    .eq("sow_id", sowID);

  if (error) {
    console.error("Error fetching detected roles", error);
    return;
  }

  const roles = data[0].detected_personnel.personnel_roles;

  if (data) {
    return roles;
  }
}

export async function GrabDetectedKeyPersonnel(sowID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sow_meta")
    .select("key_personnel")
    .eq("sow_id", sowID);

  if (error) {
    console.error("Error fetching detected key personnel", error);
    return;
  }

  const keyPersonnel = data[0].key_personnel.key_personnel_roles;

  if (data) {
    return keyPersonnel;
  }
}

/**
 * Fetches the detected roles and key personnel for a given SOW ID.
 * @param sowID - The ID of the SOW (Statement of Work).
 * @returns An object containing the detected roles and key personnel.
 */

export async function grabRolesAndPersonnel(sowID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const results = await Promise.allSettled([
    supabase
      .from("sow_meta")
      .select("detected_personnel")
      .eq("sow_id", sowID),
    supabase
      .from("sow_meta")
      .select("key_personnel")
      .eq("sow_id", sowID)
  ]);

  const rolesResult = results[0];
  const personnelResult = results[1];

  const roles = rolesResult.status === "fulfilled" && rolesResult.value.data ? rolesResult.value.data[0].detected_personnel.personnel_roles : [];
  const keyPersonnel = personnelResult.status === "fulfilled" && personnelResult.value.data ? personnelResult.value.data[0].key_personnel.key_personnel_roles : [];

  // Log errors if any
  if (rolesResult.status === "rejected") {
    console.error("Error fetching detected roles:", rolesResult.reason.message);
  }
  if (personnelResult.status === "rejected") {
    console.error("Error fetching key personnel:", personnelResult.reason.message);
  }

  return { roles, keyPersonnel };
}