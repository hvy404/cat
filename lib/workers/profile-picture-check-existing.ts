"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function checkProfilePicture(
  userId: string
): Promise<string | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("avatars")
    .select("address")
    .eq("identity", userId)
    .single();

  if (error || !data) {
    return null;
  }

  if (data.address) {
    // Instead of getting the Supabase public URL, we ask using our API route URL
    return `/api/avatar?id=${encodeURIComponent(data.address)}`;
  }

  return null;
}