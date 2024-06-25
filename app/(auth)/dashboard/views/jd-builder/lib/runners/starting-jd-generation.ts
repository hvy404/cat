"use server";
import { inngest } from "@/lib/inngest/client";

/**
 * This function triggers the job description generation process.
 * Proivde the role name to generate the JD.
 * It returns a runner ID which can be used to query the status of the JD generation process in function: queryJDGeneratorStatus
 * 
 * @param {object} options - The options for starting the JD generation process.
 * @param {string} options.sowID - The ID of the SOW.
 * @param {string} options.employerID - The ID of the employer.
 * @param {string} options.roleName - The name of the role.
 * @returns {object} - The result of the JD generation process.
 */

interface JDDraftGeneration {
  sowID: string;
  employerID: string;
  roleName: string;
}

export async function StartJDGeneration({
  sowID,
  employerID,
  roleName,
}: JDDraftGeneration) {
  let runnerId = "";

  try {
    const { ids } = await inngest.send({
      name: "app/jd-wizard-start-draft",
      data: {
        sow: {
          uuid: sowID,
          employerID: employerID,
          roleName: roleName,
        },
      },
    });

    // Return the event ID
    runnerId = ids[0];
  } catch (error) {
    console.error("Error initializing JD draft generation process", error);
    throw new Error("Error initializing JD draft generation process");
  }

  return {
    success: true,
    message: "Successfully initialized",
    id: runnerId, // This is the event ID
  };
}
