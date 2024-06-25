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
import { type resumeGenerateStatic } from "@/inngest/resume-static";
import { type resumeGenerateInferred } from "@/inngest/resume-inferred";
import { type generateCandidateCypher } from "@/inngest/resume-generate-cypher"; // Should be part 2
import { resumeGenerateEmbeddings } from "@/inngest/resume-embeddings"; // Should be part 2

export const resumeExtract = inngest.createFunction(
  { id: "candidate-extract-resume" },
  { event: "app/candidate-start-onboard" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const filename = event.data.user.resume;

    const rawExtract = await resumeParserUpload(filename);

    const { error } = await supabase
      .from("candidate_resume")
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

    console.log("Step 0 Started");

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

    // TODO: this should be split into a two separate functions

    // Build cypher query and send to Neo4j
    /* try {
      const buildCypher = await step.invoke("candidate-add-to-neo-workflow", {
        function: referenceFunction<typeof generateCandidateCypher>({
          functionId: "candidate-add-to-neo-workflow",
        }),
        data: {
          user: {
            id: event.data.user.id,
          },
        },
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
    } */

    // TODO: Add database entry that candidate has been onboarded

    return { message: "Resume successfully uploaded." };
  }
);
