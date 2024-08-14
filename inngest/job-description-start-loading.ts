// Initial job description onboarding process - this get called to begin ingesting a job description

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { type jobDescriptionGenerateStatic } from "@/inngest/job-description-static";
import { type jobDescriptionGenerateInferred } from "@/inngest/job-description-inferred";
import { jobDescriptionAddStructured } from "@/inngest/job-description-sql";

export const jobDescriptionOnboard = inngest.createFunction(
  { id: "job-description-start-onboard",
    cancelOn: [
      {
        event: "app/job-description-parser-cancel",
        if: "async.data.processId == event.data.job_description.processId",
      },
    ],
   },
  { event: "app/job-description-start-onboard" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Data from the event
    const jobDescriptionID = event.data.job_description.id;
    const rawExtract = event.data.job_description.rawExtract;

    // Insert the extracted job posting into the database, s table, rawExtract in the raw column, where the row .eq is the jobDescriptionID
    const { error } = await supabase
      .from("job_postings")
      .update({
        raw: rawExtract,
      })
      .eq("jd_id", jobDescriptionID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to insert extracted resume.",
        error: error,
      };
    }

    // Generate static points
    try {
      const generateStatic = await step.invoke(
        // Name of the step and not a reference to an Inngest function
        "job-description-generate-static-details",
        {
          function: referenceFunction<typeof jobDescriptionGenerateStatic>({
            // Name of the Inngest function
            functionId: "job-description-generate-static-info",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating static points", error);
    }

    // Generate inferred points
    try {
      const generateInferred = await step.invoke(
        "job-description-generate-inferred-details",
        {
          function: referenceFunction<typeof jobDescriptionGenerateInferred>({
            functionId: "job-description-generate-inferred-info",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating inferred points.", error);
    }

    // Add data points to SQL database
    try {
      const addStructuredData = await step.invoke(
        "job-description-add-structured-datapoints",
        {
          function: referenceFunction<typeof jobDescriptionAddStructured>({
            functionId: "job-description-add-structured-datapoints",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error adding structured data.", error);
    }

    return { message: "Successfully onboarded job description." };
  }
);
