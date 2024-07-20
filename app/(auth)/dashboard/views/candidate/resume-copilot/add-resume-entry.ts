"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { createId } from "@paralleldrive/cuid2";

export async function addResumeEntryAction(
  userId: string,
  path: string,
  name: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const address = createId();

  try {
    const { data, error } = await supabase
      .from("candidate_downloadable_resume")
      .insert([
        {
          candidate_identity: userId,
          path: path,
          address: address,
          resume_name: name,
        },
      ])
      .select();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error adding resume entry to database:", error);
    return { data: null, error };
  }
}
