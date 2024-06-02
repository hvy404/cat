// Reminder: this function is used to start the JD Wizard onboarding process

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { type jdGenerateDescription } from "@/inngest/jd-wizard-generate-jd";

export const jdWizardWriteDraft = inngest.createFunction(
  { id: "jd-wizard-start-draft" },
  { event: "app/jd-wizard-start-draft" },
  async ({ event, step }) => {
    let generatedDraftID = "";

    try {
      const writeDraft = await step.invoke(
        "jd-wizard-generate-job-description",
        {
          function: referenceFunction<typeof jdGenerateDescription>({
            functionId: "jd-wizard-generate-job-description",
          }),
          data: {
            sow: {
              uuid: event.data.sow.uuid,
              employerID: event.data.sow.employerID,
              roleName: event.data.sow.roleName,
            },
          },
        }
      );

      generatedDraftID = writeDraft.jd_id;
    } catch (error) {
      throw new Error("Error writing draft for job description");
    }

    return {
      message: "Successfully written draft",
      success: true,
      draftID: generatedDraftID,
    };
  }
);
