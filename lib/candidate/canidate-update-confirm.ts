"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function updateCandidateConfirmStatus(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Update the candidate status by updating "email_confiremd" to true in row eq to the userId
  const { data, error } = await supabase
    .from("candidates")
    .update({ email_confirmed: true })
    .match({ uuid: userId });

  if (error) {
    return {
      message: "Failed to update candidate status.",
      error: error,
    };
  }

  return {
    message: "Successful.",
  };
}