"use server";
import { cookies } from "next/headers";
import { inngest } from "@/lib/inngest/client";
import { JDAddDatabaseEntry } from "@/lib/dashboard/jd-add-new-entry";
import { v4 as uuidv4 } from "uuid";

/**
 * This is the connect for JB Builder Wizard to JD Upload
 * It takes a draft job description and sends it to upload process which starts the onboarding process.
 * Publishes a draft job description to Inngest for further processing.
 *
 * @param jdUUID - The UUID of the job description.
 * @param employerId - The ID of the employer.
 * @param sessionID - The ID of the session dynamically generated.
 * @param draftText - The text of the draft job description.
 * @returns An object containing the result of the publishing operation.
 */
export async function publishDraftJD(
  employerId: string,
  draftText: string
) {
  const cookieStore = cookies();

  const rawExtract = draftText;
  const sessionID = uuidv4();
  const filename = "jd-wizard-generator";
  let jobID = "";

  // Create new entry JDAddDatabaseEntry
  // This generates the job ID
  const { id, success, message } = await JDAddDatabaseEntry(
    employerId,
    filename
  );

  if (!success) {
    return {
      message: message,
    };
  } else {
    if (id) {
      jobID = id;
      console.log("Job ID: ", jobID);
    } else {
      console.error("Received undefined ID from JDAddDatabaseEntry.");
      return {
        message: "Failed to retrieve job ID from database entry.",
      };
    }
  }

  // Send an event to Inngest
  const { ids } = await inngest.send({
    name: "app/job-description-start-onboard",
    data: {
      job_description: {
        employer: employerId,
        id: jobID,
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
    jobID: jobID, // This is the job ID generated by JDAddDatabaseEntry
    session: sessionID,
  };
}