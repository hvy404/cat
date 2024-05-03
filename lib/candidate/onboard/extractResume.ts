"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";

export async function candidateStartOnboard(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("candidates")
    .select("filename")
    .eq("uuid", userId);

  if (error) {
    console.error(error);
    return {
      message: "Failed to get resume filename.",
      error: error,
    };
  }
  // Send an event to Inngest
  await inngest.send({
    name: "app/candidate-start-onboard",
    data: {
      user: {
        id: userId,
        resume: data[0].filename,
      },
    },
  });

  return {
    message: "Success",
  };
}
