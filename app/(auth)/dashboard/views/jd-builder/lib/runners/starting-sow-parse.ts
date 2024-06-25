"use server";
import { inngest } from "@/lib/inngest/client";

/**
 * Starts the SOW parse process in the JD Wizard onboarding.
 * @param {JDWizardOnboardDocsEvent} params - The parameters for starting the SOW parse process.
 * @returns {Promise<{ success: boolean, message: string, runner: string }>} A promise that resolves to an object containing the success status, message, and runner ID.
 * @throws {Error} If there is an error initializing the JD Wizard onboarding process.
 */

interface JDWizardOnboardDocsEvent {
  sowID: string;
  employerID: string;
  filename: string;
}

export async function StartSOWParse({
  sowID,
  employerID,
  filename,
}: JDWizardOnboardDocsEvent) {

  let runnerId = "";

  try {
    const { ids } = await inngest.send({
      name: "app/jd-wizard-initialize",
      data: {
        sow: {
          uuid: sowID,
          employerID: employerID,
          filename: filename,
        },
      },
    });

    // Return the event ID
    runnerId = ids[0];
  } catch (error) {
    console.error("Error initializing JD Wizard onboarding process", error);
    throw new Error("Error initializing JD Wizard onboarding process");
  }

  return {
    success: true,
    message: "Successfully initialized",
    runner: runnerId, // This is the event ID
  };
}
