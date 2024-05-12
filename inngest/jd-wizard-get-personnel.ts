import { inngest } from "@/lib/inngest/client";
import { getPersonnel } from "@/lib/jd-builder/get-personnel";

export const jdWizardGetPersonnel = inngest.createFunction(
  { id: "jd-wizard-get-personnel" },
  { event: "app/jd-wizard-get-personnel" },
  async ({ event, step }) => {
    const sowUUID = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;

    if (!sowUUID || !employerID) {
      throw new Error("Missing required data to chunk SOW");
    }

    try {
      const identifyRoles = await getPersonnel(employerID, sowUUID);
      return {
        message: "Successfully identified roles",
        roles: identifyRoles.roles,
      };
    } catch (error) {
      //console.error("Error identifying roles", error);
      throw new Error("Error identifying roles: " + error);
    }
  }
);
