/**
 * Extracts resume information and performs various operations on it.
 * Resume onboard step 1
 *
 * @param event - The event object containing the resume data.
 * @param step - The step object used for invoking other functions.
 * @returns A promise that resolves to an object with a success message or an error message.
 */

import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { resumeParserUpload } from "@/lib/candidate/ingest-resume/retrieve-resume";
import { type resumeGenerateStatic } from "@/inngest/resume-static"; // Part 1
import { type resumeGenerateInferred } from "@/inngest/resume-inferred"; // Part 1
import { type resumeGenerateIntroduction } from "@/inngest/resume-candidate-intro"; // Part 2
import { type generateCandidateCypher } from "@/inngest/resume-generate-cypher"; // Part 2
import { type resumeGenerateEmbeddings } from "@/inngest/resume-embeddings"; // Part 2
import { type resumeOnboardBooleanStatus } from "@/inngest/resume-onboard-boolean"; // Part 2
import { type resumeOnboardCleanup } from "@/inngest/resume-onboard-cleanup"; // Part 2

/**
 * Extracts resume information and performs additional processing steps.
 * Part 1 of the onboarding process.
 *
 * @param event - The event triggering the function.
 * @param step - The step object used for invoking other functions.
 * @returns A promise that resolves to an object with a success message or an error message.
 */
export const resumeExtract = inngest.createFunction(
  { id: "candidate-extract-resume" },
  { event: "app/candidate-start-onboard" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const filename = event.data.user.resume;

    const rawExtract = await resumeParserUpload(filename);

    const { error } = await supabase
      .from("candidate_create")
      .upsert([{ raw: rawExtract, user: event.data.user.id }], {
        onConflict: "user",
      });

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
        "candidate-generate-static-points",
        {
          function: referenceFunction<typeof resumeGenerateStatic>({
            functionId: "candidate-generate-static-info",
          }),
          data: {
            user: {
              id: event.data.user.id,
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
        "candidate-generate-inferred-points",
        {
          function: referenceFunction<typeof resumeGenerateInferred>({
            functionId: "candidate-generate-inferred-info",
          }),
          data: {
            user: {
              id: event.data.user.id,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error generating inferred points.", error);
    }

    return { message: "Resume successfully read." };
  }
);

/**
 * Finalizes the onboarding process for a candidate.
 * Part 2 of the onboarding process.
 * @param event - The event triggering the onboarding process.
 * @param step - The step in the onboarding process.
 * @returns A message indicating the success of the resume upload.
 */
export const finalizeOnboarding = inngest.createFunction(
  { id: "candidate-confirm-resume" },
  { event: "app/candidate-start-onboard-step-2" },
  async ({ event, step }) => {
    // Move the resume file to the final destination
    try {
      const moveResumetoFinal = await step.invoke(
        "candidate-resume-file-to-final-storage",
        {
          function: referenceFunction<typeof resumeOnboardCleanup>({
            functionId: "candidate-resume-file-to-final-storage",
          }),
          data: {
            user: {
              id: event.data.user.id,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error during while building cypher query.", error);
    }

    // Generate intro
    try {
      const generateIntro = await step.invoke(
        "candidate-generate-candidate-intro",
        {
          function: referenceFunction<typeof resumeGenerateIntroduction>({
            functionId: "candidate-generate-candidate-intro",
          }),
          data: {
            user: {
              id: event.data.user.id,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error during while building cypher query.", error);
    }

    // Build cypher query and send to Neo4j
    try {
      const buildCypher = await step.invoke("candidate-add-to-neo-workflow", {
        function: referenceFunction<typeof generateCandidateCypher>({
          functionId: "candidate-add-to-neo-workflow",
        }),
        data: {
          user: {
            id: event.data.user.id,
          },
        }
      });
    } catch (error) {
      console.error("Error during while building cypher query.", error);
    }

    // Generate and add embeddings to Neo4j
    try {
      const generateEmbeddings = await step.invoke(
        "candidate-generate-neo-embeddings",
        {
          function: referenceFunction<typeof resumeGenerateEmbeddings>({
            functionId: "candidate-generate-neo-embeddings",
          }),
          data: {
            user: {
              id: event.data.user.id,
            },
          },
        }
      );
    } catch (error) {
      console.error("Error during generating embeddings:", error);
    }

    // TODO: Add database entry that candidate has been onboarded
    try {
      const onboarded = await step.invoke("candidate-onboard-boolean-true", {
        function: referenceFunction<typeof resumeOnboardBooleanStatus>({
          functionId: "candidate-onboard-boolean-true",
        }),
        data: {
          user: {
            id: event.data.user.id,
          },
        },
      });
    } catch (error) {
      console.error("Error setting onboarded status.");
    }

    return { message: "Resume successfully uploaded." };
  }
);
