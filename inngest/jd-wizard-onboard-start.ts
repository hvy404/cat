// Reminder: this function is used to start the JD Wizard onboarding process

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { type jdWizardProcessSow } from "@/inngest/jd-wizard-chunk";
import { type jdWizardFindDocType } from "@/inngest/jd-wizard-doc-identify";
import { type jdWizardGetPersonnel } from "@/inngest/jd-wizard-get-personnel";
import { type jdWizardGetKeyPersonnel } from "@/inngest/jd-wizard-get-key-personnel";

/**
 * Initializes the JD Wizard onboarding process
 * @param event - The event object containing the data for the onboarding process.
 * @param step - The step object used for invoking other functions in the onboarding process.
 * @returns A promise that resolves to an object with a success message.
 */

export const jdWizardOnboardDocs = inngest.createFunction(
  { id: "jd-wizard-initialize" },
  { event: "app/jd-wizard-initialize" },
  async ({ event, step }) => {

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const employerID = event.data.sow.employerID;
    const soqID = event.data.sow.uuid;

    // Step 1 of JD Wizard - Chunk SOW
    try {
      const chunkUploadedDocs = await step.invoke("jd-wizard-sow-chunk", {
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
      });
    } catch (error) {
      console.error("Error chunking SOW", error);
      throw new Error("Error chunking SOW");
    }

    // Step 2 of JD Wizard - Identify Document Type
    try {
      const identifyDocType = await step.invoke("jd-wizard-identify-doc-type", {
        function: referenceFunction<typeof jdWizardFindDocType>({
          functionId: "jd-wizard-identify-doc-type",
        }),
        data: {
          sow: {
            uuid: event.data.sow.uuid,
            employerID: event.data.sow.employerID,
          },
        },
      });
    } catch (error) {
      console.error("Error identifying document type", error);
      throw new Error("Error identifying document type");
    }

    // Step 3 - Get Personnel Roles
    try {
      const getPersonnelRoles = await step.invoke("jd-wizard-get-personnel", {
        function: referenceFunction<typeof jdWizardGetPersonnel>({
          functionId: "jd-wizard-get-personnel",
        }),
        data: {
          sow: {
            uuid: event.data.sow.uuid,
            employerID: event.data.sow.employerID,
          },
        },
      });
    } catch (error) {
      console.error("Error identifying document type", error);
      throw new Error("Error identifying document type");
    }

    // Step 4 - Get Key Personnel Roles
    try {
      const getKeyPersonnelRoles = await step.invoke(
        "jd-wizard-get-key-personnel",
        {
          function: referenceFunction<typeof jdWizardGetKeyPersonnel>({
            functionId: "jd-wizard-get-key-personnel",
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

    // In Supabase table "sow_meta", set TRUE boolean to "completed_onboard" column in row eq. to 'owner'
    const { error } = await supabase
      .from("sow_meta")
      .update({
        completed_onboard: true,
      })
      .eq("owner", employerID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to update SOW.",
        error: error,
      };
    }

    return { message: "Successfully processed SOW", success: true };
  }
);
