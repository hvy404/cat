"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";

/**
 * Starts the onboarding process for a candidate.
 * 
 * @param userId - The ID of the user/candidate.
 * @returns An object containing the result of the onboarding process.
 */
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

  const { ids } = await inngest.send({
    name: "app/candidate-start-onboard",
    data: {
      user: {
        id: userId,
        resume: data[0].filename,
      },
    },
  });

  // Check if the event was sent successfully by checking for ids
  if (!ids) {
    return {
      message: "Failed to trigger resume extraction.",
    };
  }

  return {
    message: "Success",
    event: ids,
  };
}

/**
 * Finalizes the onboarding process for a candidate.
 * 
 * @param userId - The ID of the user to finalize the onboarding for.
 * @returns An object containing a success message and the event IDs.
 */
export async function candidateFinalizeOnboard(userId: string) {
  const { ids } = await inngest.send({
    name: "app/candidate-start-onboard-step-2",
    data: {
      user: {
        id: userId,
      },
    },
  });

  // Check if the event was sent successfully by checking for ids
  if (!ids) {
    return {
      message: "Failed to finalize onboard.",
    };
  }

  return {
    message: "Success",
    event: ids,
  };
}
