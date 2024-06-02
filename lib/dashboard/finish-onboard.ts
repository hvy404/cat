"use server";
import { inngest } from "@/lib/inngest/client";

/**
 * Finish the onboarding process for a job description.
 *
 * @param jdUUID - The UUID of the job description.
 * @param employerId - The ID of the employer.
 * @param filename - The name of the file containing the job description.
 * @param sessionID - The ID of the session.
 * @returns An object with the result of the onboarding process.
 */
export async function jobDescriptionFinishOnboard(
  jdUUID: string,
  employerId: string,
  sessionID: string
) {

  // Send an event to Inngest
  const { ids } = await inngest.send({
    name: "app/job-description-onboard-stage-2",
    data: {
      job_description: {
        employer: employerId,
        id: jdUUID,
        session: sessionID,
      },
    },
  });

  // Check if the event was sent successfully by checking for ids
  if (!ids) {
    return {
      message: "Failed to finish adding opportunity.",
    };
  }

  return {
    message: "Success",
    success: true,
    event: ids,
  };
}
