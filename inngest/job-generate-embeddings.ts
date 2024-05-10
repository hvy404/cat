/**
 * Generates embeddings for a job description and writes them to the Neo4j node.
 *
 * @param event - The event triggering the function.
 * @param step - The step object containing additional information.
 * @returns A promise that resolves to an object with a success message.
 */

import { inngest } from "@/lib/inngest/client";
import { generateJobDescriptionEmbeddings } from "@/lib/dashboard/generate-jd-embeddings";
import { read, write } from "@/lib/neo4j/utils";

function buildCypherQuery(jobUUID: string, embeddings: number[]): string {
  let embeddingsString = embeddings.join(", ");
  let query = `MATCH (j:Job {job_id: "${jobUUID}"}) SET j.embedding = [${embeddingsString}] RETURN j`;
  return query;
}

export const jobDescriptionEmbeddings = inngest.createFunction(
  { id: "job-description-generate-neo-embeddings" },
  { event: "app/job-description-generate-neo-embeddings" },
  async ({ event, step }) => {
    const jobID = event.data.job_description.id;

    const embeddings = await generateJobDescriptionEmbeddings(jobID);

    // Check if embeddings is an array of numbers
    if (Array.isArray(embeddings)) {
      // Build the cypher query
      const cypherQuery = buildCypherQuery(jobID, embeddings);

      //console.log("Writing the job embeddings to Neo4j");

      //console.log(cypherQuery);

      // Run the cypher query on the Neo4j database
      await write(cypherQuery);
    } else {
      console.error("Invalid embeddings");
    }

    return { message: "Candidate embeddings added successfully." };
  }
);
