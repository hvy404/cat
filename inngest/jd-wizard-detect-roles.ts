// Reminder: this function is used to grab all roles detected by the JD Wizard

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { type jdWizardGetKeyPersonnel } from "@/inngest/jd-wizard-get-key-personnel";
import { type jdWizardGetPersonnel } from "@/inngest/jd-wizard-get-personnel";

/**
 * Detects all roles using the JD Wizard.
 *
 * @param event - The event object containing the data for the JD Wizard.
 * @param step - The step object used to invoke the JD Wizard functions.
 * @returns A promise that resolves to an object with a success message.
 */

export const jdWizardDetectRoles = inngest.createFunction(
  { id: "jd-wizard-detect-all-roles" },
  { event: "app/jd-wizard-detect-all-roles" },
  async ({ event, step }) => {
    const uuid = event.data.sow.uuid;
    const employerID = event.data.sow.employerID;

    if (!uuid || !employerID) {
      throw new Error("Missing required data to detect roles");
    }

    let personnelRoles = [];
    let keyPersonnelRoles = [];

    // Step 1 of JD Wizard - Dectect personnel roles
    try {
      const detectPersonnel = await step.invoke("jd-wizard-detect-personnel", {
        function: referenceFunction<typeof jdWizardGetPersonnel>({
          functionId: "jd-wizard-get-personnel",
        }),
        data: {
          sow: {
            uuid: uuid,
            employerID: employerID,
          },
        },
      });

      personnelRoles = detectPersonnel.roles.personnel_roles;
    } catch (error) {
      console.error("Error detecting personnel roles", error);
      throw new Error("Error detecting personnel roles");
    }

    // Step 2 of JD Wizard - Detect key personnel roles
    try {
      const detectKeyPersonnel = await step.invoke(
        "jd-wizard-detect-key-personnel",
        {
          function: referenceFunction<typeof jdWizardGetKeyPersonnel>({
            functionId: "jd-wizard-get-key-personnel",
          }),
          data: {
            sow: {
              uuid: uuid,
              employerID: employerID,
            },
          },
        }
      );

      keyPersonnelRoles = detectKeyPersonnel.roles.key_personnel_roles;
    } catch (error) {
      console.error("Error detecting key personnel roles", error);
      throw new Error("Error detecting key personnel roles");
    }

    // Merge the roles
    const allRoles = personnelRoles.concat(keyPersonnelRoles);
    const allDetectedRoles = Array.from(new Set(allRoles));
    console.log(allDetectedRoles);

    return {
      success: true,
      message: "Successfully detected all roles",
      roles: allDetectedRoles,
    };
  }
);
