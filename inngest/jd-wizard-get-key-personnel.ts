import { inngest } from "@/lib/inngest/client";
import { getKeyPersonnel } from "@/lib/jd-builder/get-key-personnel";

export const jdWizardGetKeyPersonnel = inngest.createFunction(
  { id: "jd-wizard-get-key-personnel" },
  { event: "app/jd-wizard-get-key-personnel" },
  async ({ event, step }) => {
    const sowUUID = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;

    if (!sowUUID || !employerID) {
      throw new Error("Missing required data to chunk SOW");
    }

    try {
      const identifyRoles = await getKeyPersonnel(employerID, sowUUID);
      return {
        message: "Successfully identified key personnel roles",
        roles: identifyRoles.roles,
      };
    } catch (error) {
      //console.error("Error identifying roles", error);
      throw new Error("Error identifying key personnel roles: " + error);
    }
  }
);
