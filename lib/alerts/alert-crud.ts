"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export interface Alert {
  id: string;
  user_id: string;
  type: "match" | "invite" | "application";
  reference_id: string;
  status: "unread" | "read";
  created_at: string;
  description: string;
  action_required: boolean;
}

export async function getAlerts(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  /* // Use the auth() function directly
  const { getToken } = auth();
  const token = await getToken(
    { template: "supabase-talent" }
  );

  if (!token) {
    console.log("No token found");
    return null;
  }

  console.log("Decoded JWT:", token); */
  

  const { data, error } = await supabase
    .from("alerts")
    .select(
      `
      id,
      type,
      reference_id,
      status,
      created_at,
      description,
      action_required
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    //console.error("Error fetching alerts:", error);
    return null;
  }

  return data;
}

export async function createAlert(alert: Omit<Alert, "id">) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("alerts")
    .insert([alert])
    .select();

  if (error) {
    console.error("Error creating alert:", error);
    return null;
  }

  return data[0];
}

export async function updateAlert(id: string, updates: Partial<Alert>) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("alerts")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error updating alert:", error);
    return null;
  }

  return data[0];
}

export async function deleteAlert(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from("alerts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting alert:", error);
    return false;
  }

  return true;
}

// Logic to retreive data of "Application" alert for employer view
