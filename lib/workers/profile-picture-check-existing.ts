// app/actions/checkProfilePicture.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function checkProfilePicture(userId: string): Promise<string | null> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("avatars")
    .select("address")
    .eq("identity", userId)
    .single();

  if (error || !data) {
    console.error("Error fetching profile picture:", error);
    return null;
  }

  if (data.address) {
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(`public/${data.address}`);
    return urlData.publicUrl;
  }

  return null;
}