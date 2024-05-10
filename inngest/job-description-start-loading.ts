// Initial job description onboarding process - this get called to begin ingesting a job description

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { jdParserUpload } from "@/lib/dashboard/ingest-jd/retreiveJD";
import { type jobDescriptionGenerateStatic } from "@/inngest/job-description-static";
import { type jobDescriptionGenerateInferred } from "@/inngest/job-description-inferred";
import { type generateJobDescriptionCypher } from "@/inngest/job-description-gen-cypher";
import { type jobDescriptionEmbeddings } from "@/inngest/job-generate-embeddings";

export const jobDescriptionOnboard = inngest.createFunction(
  { id: "job-description-start-onboard" },
  { event: "app/job-description-start-onboard" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Data from the event
    const employerID = event.data.job_description.employer;
    const jobDescriptionID = event.data.job_description.id;
    const filename = event.data.job_description.filename;

    const rawExtract = await jdParserUpload(filename);

    // Insert the extracted job posting into the database, job_postings table, rawExtract in the raw column, where the row .eq is the jobDescriptionID
    const { error } = await supabase
      .from("job_postings")
      .update({
        raw: rawExtract,
      })
      .eq("jd_uuid", jobDescriptionID);

    if (error) {
      console.error(error);
      return {
        message: "Failed to insert extracted resume.",
        error: error,
      };
    }

    console.log("Step 0 Started");

    // Generate static and inferred points from the raw resume text

    // Generate static points
    try {
      const generateStatic = await step.invoke(
        "job-description-generate-static-details",
        {
          function: referenceFunction<typeof jobDescriptionGenerateStatic>({
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

    // Build cypher and send cypher query to Neo
    try {
      const buildCypherForNeo = await step.invoke(
        "job-description-add-to-neo-workflow",
        {
          function: referenceFunction<typeof generateJobDescriptionCypher>({
            functionId: "job-description-add-to-neo-workflow",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
              employer: employerID,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error building cypher for Neo.", error);
    }

    // Generate embeddings and add to Neo Node
    try {
      const generateEmbeddings = await step.invoke(
        "job-description-generate-neo-embeddings",
        {
          function: referenceFunction<typeof jobDescriptionEmbeddings>({
            functionId: "job-description-generate-neo-embeddings",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating embeddings.", error);
    }

    // TODO: Add database entry that JD has been added
    

    return { message: "Successfully onboarded job description." };
  }
);
