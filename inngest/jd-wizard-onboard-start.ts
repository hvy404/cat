// Reminder: this function is used to start the JD Wizard onboarding process

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { type jdWizardProcessSow } from "@/inngest/jd-wizard-chunk";
import { type jdWizardFindDocType } from "@/inngest/jd-wizard-doc-identify";

/**
 * Initializes the JD Wizard onboarding process.
 * @param event - The event object containing the data for the onboarding process.
 * @param step - The step object used for invoking other functions in the onboarding process.
 * @returns A promise that resolves to an object with a success message.
 */

export const jdWizardOnboardDocs = inngest.createFunction(
  { id: "jd-wizard-initialize" },
  { event: "app/jd-wizard-initialize" },
  async ({ event, step }) => {

    // Step 1 of JD Wizard - Chunk SOW
    try {
      const chunkUploadedDocs = await step.invoke(
        "jd-wizard-sow-chunk",
        {
          function: referenceFunction<typeof jdWizardProcessSow>({
            functionId: "jd-wizard-sow-chunk",
          }),
          data: {
            sow: {
              uuid: event.data.sow.uuid,
              employerID: event.data.sow.employerID,
              filename: event.data.sow.filename,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error chunking SOW", error);
      throw new Error("Error chunking SOW");
    }

    // Step 2 of JD Wizard - Identify Document Type
    try {
      const identifyDocType = await step.invoke(
        "jd-wizard-identify-doc-type",
        {
          function: referenceFunction<typeof jdWizardFindDocType>({
            functionId: "jd-wizard-identify-doc-type",
          }),
          data: {
            sow: {
              uuid: event.data.sow.uuid,
              employerID: event.data.sow.employerID,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error identifying document type", error);
      throw new Error("Error identifying document type");
    }

    return { message: "Successfully initialized SOW", success: true};
  }
);
