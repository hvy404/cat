"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";

export async function jobDescriptionStartOnboard(jdUUID: string, employerId: string, filename: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  console.log("Starting job description onboarding");
  console.log("JD UUID: ", jdUUID);
  console.log("Employer ID: ", employerId);

  // Send an event to Inngest
  const { ids } = await inngest.send({
    name: "app/job-description-start-onboard",
    data: {
      job_description: {
        employer: employerId,
        id: jdUUID,
        filename: filename,
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
