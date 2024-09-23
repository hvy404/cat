import { inngest } from "@/lib/inngest/client";
import { sowParser } from "@/lib/jd-builder/sow-parse";

/**
 * Processes a chunk of a Statement of Work (SOW) for the JD Wizard app.
 * @param event - The event object containing the SOW data.
 * @param step - The step object containing additional information.
 * @returns A promise that resolves to an object indicating the success or failure of the chunking process.
 * @throws An error if any required data is missing or if there is an error parsing or processing the SOW.
 */

export const jdWizardProcessSow = inngest.createFunction(
  { id: "jd-wizard-sow-chunk" },
  { event: "app/jd-wizard-sow-chunk" },
  async ({ event, step }) => {
    const sowUUID = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;
    const sowFilename = event.data.sow.filename;

    //console.log("Processing SOW", { sowUUID, employerID, sowFilename });

    if (!sowUUID || !employerID || !sowFilename) {
      throw new Error("Missing required data to chunk SOW");
    }

    try {
      const parse = await sowParser(sowUUID, employerID, sowFilename);
      if (!parse.success) {
        throw new Error("Error parsing SOW");
      } else {
        return { success: true, message: "Successfully chunked SOW" };
      }
    } catch (error) {
      console.error(error);
      throw new Error("Error processing SOW");
    }
  }
);
