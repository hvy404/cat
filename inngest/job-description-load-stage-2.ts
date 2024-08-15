// Job onboarding stage - final step after user confirms details

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { type generateJobDescriptionCypher } from "@/inngest/job-description-gen-cypher";
import { type jobDescriptionGenerateKeyworks } from "@/inngest/job-description-keyword-builder";
import { type jobDescriptionEmbeddings } from "@/inngest/job-generate-embeddings";
import { type jobDescriptionGenerateCompleted } from "@/inngest/job-description-completed";

export const jobDescriptionOnboardStage2 = inngest.createFunction(
  { id: "job-description-onboard-stage-2" },
  { event: "app/job-description-onboard-stage-2" },
  async ({ event, step }) => {

    // Data from the event
    const employerID = event.data.job_description.employer;
    const jobDescriptionID = event.data.job_description.id;
    //const session = event.data.job_description.session;
    const company = event.data.job_description.company;

    // Generate keywords for job description
    try {
      const buildJobKeywords = await step.invoke(
        "job-description-generate-role-keywords",
        {
          function: referenceFunction<typeof jobDescriptionGenerateKeyworks>({
            functionId: "job-description-generate-role-keywords",
          }),
          data: {
            job_description: {
              id: jobDescriptionID,
              employer: employerID,
              company: company,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating keywords for job description.", error);
    }

    // Build cypher for Neo
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
              company: company,
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
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating embeddings.", error);
    }

    return { message: "Successfully onboarded job description stage 2." };
  }
);
