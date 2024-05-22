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
