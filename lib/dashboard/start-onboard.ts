"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";

export async function jobDescriptionStartOnboard(jdUUID: string, employerId: string, filename: string, sessionID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Send an event to Inngest
  const { ids } = await inngest.send({
    name: "app/job-description-start-onboard",
    data: {
      job_description: {
        employer: employerId,
        id: jdUUID,
        filename: filename,
        session: sessionID,
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
    success: true,
    event: ids,
  };
}
