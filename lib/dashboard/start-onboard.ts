"use server";
import { inngest } from "@/lib/inngest/client";
import { jdParserUpload } from "@/lib/dashboard/ingest-jd/retreiveJD";
//import createId from "@/lib/global/cuid-generate";

/**
 * Starts the onboarding process for a job description.
 * This is used in the job description upload process (not the JD wizard).
 * Returns ID of the event that was sent to Inngest.
 *
 * @param jdUUID - The UUID of the job description.
 * @param employerId - The ID of the employer.
 * @param filename - The name of the file containing the job description.
 * @param sessionID - The ID of the session.
 * @returns An object with the result of the onboarding process.
 */

export async function jobDescriptionStartOnboard(
  jdUUID: string,
  employerId: string,
  filename: string,
  sessionID: string
) {
  let rawExtract;

  try {
    rawExtract = await jdParserUpload(filename);
    if (rawExtract == null) {
      throw new Error("Extracted content is null");
    }
  } catch (error) {
    return {
      message: "Failed to process the job description",
    };
  }

  // Send an event to Inngest
  const { ids } = await inngest.send({
    name: "app/job-description-start-onboard",
    data: {
      job_description: {
        employer: employerId,
        id: jdUUID,
        rawExtract: rawExtract,
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
    session: sessionID,
  };
}
