/**
 * Generates a Cypher query to add a candidate to Neo4j and start embeddings generation.
 *
 * @param event - The event object containing the data for the candidate.
 * @param step - The step object containing additional information about the workflow step.
 * @returns A Promise that resolves to an object with a success message if the operation is successful, or an error message if it fails.
 */
import { inngest } from "@/lib/inngest/client";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateCandidateCypherQuery } from "@/lib/candidate/ingest-resume/generate-cypher-query";
import { read, write } from "@/lib/neo4j/utils";

export const generateCandidateCypher = inngest.createFunction(
  { id: "candidate-add-to-neo-workflow" },
  { event: "app/candidate-add-to-neo-workflow" },
  async ({ event, step }) => {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const userId = event.data.user.id;

    // TODO: this can pull the combined column so remove the need for the two separate queries
    try {
      const { data, error } = await supabase
        .from("candidate_resume")
        .select("static, inferred")
        .eq("user", userId);

      if (error) throw new Error(error.message);

      const staticData = data[0].static;
      const inferredData = data[0].inferred;
      const candidateData = { ...staticData, ...inferredData };
      const cypherQuery = generateCandidateCypherQuery(candidateData, userId);

      console.log(
        "Writing then sending cypher query to Neo4j from candidate-add-to-neo-workflow Inngest function."
      );

      // Run the Cypher query and wait for it to complete successfully
      // TODO: Write doesn't return an error and thus does not throw an error. This needs enhancement

      await write(cypherQuery);

      return {
        message:
          "Successfully added candidate to Neo and started embeddings generation.",
        success: true,
      };
    } catch (err) {
      //console.error(err);
      throw new Error("There was an error executing the operation: " + err);
      /* return {
        message: "Failed to execute the operation.",
        error: "Error executing write operation in Neo4j:",
        success: false,
      }; */
    }
  }
);
