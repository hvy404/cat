// Initial job description onboarding process - this get called to begin ingesting a job description

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { type jobDescriptionGenerateStatic } from "@/inngest/job-description-static";
import { type jobDescriptionGenerateInferred } from "@/inngest/job-description-inferred";
import { type generateJobDescriptionCypher } from "@/inngest/job-description-gen-cypher";
import { type jobDescriptionEmbeddings } from "@/inngest/job-generate-embeddings";
import { jobDescriptionAddStructured } from "@/inngest/job-description-sql";
import { type jobDescriptionGenerateCompleted } from "@/inngest/job-description-completed";

export const jobDescriptionOnboard = inngest.createFunction(
  { id: "job-description-start-onboard" },
  { event: "app/job-description-start-onboard" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Data from the event
    const employerID = event.data.job_description.employer;
    const jobDescriptionID = event.data.job_description.id;
    const session = event.data.job_description.session;
    const rawExtract = event.data.job_description.rawExtract;

    // Insert the extracted job posting into the database, s table, rawExtract in the raw column, where the row .eq is the jobDescriptionID
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

    // Should subsequent steps after this be in a seperate file? because user should be able to confirm before adding to Neo4j

    /* // Build cypher and send cypher query to Neo
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

    // Mark job description as onboarded
    try {
      const generateCompleted = await step.invoke(
        "job-description-onboard-complete",
        {
          function: referenceFunction<typeof jobDescriptionGenerateCompleted>({
            functionId: "job-description-onboard-complete",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
              employer: employerID,
              session: session,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating embeddings.", error);
    } */

    return { message: "Successfully onboarded job description." };
  }
);
