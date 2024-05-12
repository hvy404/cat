import { inngest } from "@/lib/inngest/client";
import { getJobDescription } from "@/lib/jd-builder/generate-job-description";

export const jdGenerateDescription = inngest.createFunction(
  { id: "jd-wizard-generate-job-description" },
  { event: "app/jd-wizard-generate-job-description" },
  async ({ event, step }) => {
    const sowUUID = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;
    const roleName = event.data.sow.roleName;

    if (!sowUUID || !employerID || !roleName) {
      throw new Error("Missing required data to generate job description");
    }

    try {
      const generateJD = await getJobDescription(employerID, roleName, sowUUID);
      return {
        jd_id: generateJD.jd_id,
      };
    } catch (error) {
      throw new Error("Failed to generate job description");
    }
  }
);
