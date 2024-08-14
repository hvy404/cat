import { inngest } from "@/lib/inngest/client";
import { getJobDescription } from "@/lib/jd-builder/generate-job-description";

/**
 * Generates a job description based on the provided event data.
 * @param event - The event data containing the SOW UUID, employer ID, and role name.
 * @param step - The step data.
 * @returns The generated job description ID.
 * @throws Error if any required data is missing or if the job description generation fails.
 */
export const jdGenerateDescription = inngest.createFunction(
  {
    id: "jd-wizard-generate-job-description",
    cancelOn: [
      {
        event: "app/jd-wizard-cancel-draft",
        if: "async.data.processId == event.data.sow.processId",
      },
    ],
  },
  { event: "app/jd-wizard-generate-job-description" },
  async ({ event, step }) => {
    const sowUUID = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;
    const roleName = event.data.sow.roleName;

    console.log(sowUUID, employerID, roleName);

    if (!sowUUID || !employerID || !roleName) {
      throw new Error("Missing required data to generate job description");
    }

    try {
      const generateJD = await getJobDescription(employerID, roleName, sowUUID);
      return {
        jd_id: generateJD.jd_id,
      };
    } catch (error) {
      console.error("Error", error);
      throw new Error("Failed to generate job description");
    }
  }
);
