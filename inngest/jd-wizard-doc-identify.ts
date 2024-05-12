import { inngest } from "@/lib/inngest/client";
import { getDocumentType } from "@/lib/jd-builder/get-doc-type";

/**
 * Finds the document type using the JD Wizard.
 *
 * @param event - The event object containing the data.
 * @param step - The step object.
 * @returns A Promise that resolves to an object with the result of the document type identification.
 * @throws If there is missing required data or an error occurs during the identification process.
 */

export const jdWizardFindDocType = inngest.createFunction(
  { id: "jd-wizard-identify-doc-type" },
  { event: "app/jd-wizard-identify-doc-type" },
  async ({ event, step }) => {
    const sowUUID = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;

    if (!sowUUID || !employerID) {
      throw new Error("Missing required data to chunk SOW");
    }

    try {
      const detectType = await getDocumentType(employerID, sowUUID);
      if (!detectType.success) {
        throw new Error("Error identifying document type");
      } else {
        return {
          success: true,
          message: "Successfully identified document type",
          type: detectType.type,
        };
      }
    } catch (error) {
      //console.error(error);
      throw new Error("Error identifying document type: " + error);
    }
  }
);
