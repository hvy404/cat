"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const cookieStore = cookies();
const supabase = createClient(cookieStore);

export async function jobPostStatus(userID: string, jobID: string, status: boolean) {
  const { error } = await supabase
    .from("job_postings")
    .update({ active: status })
    .eq("jd_uuid", jobID)
    .eq("employer_id", userID);

  if (error) {
    console.error(error);
    return {
      error: error,
    };
  }

  return { message: "Success" };
}
