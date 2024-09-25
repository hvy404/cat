/**
 * Generates embeddings for a candidate and writes them to a Neo4j database.
 *
 * @param event - The event triggering the function.
 * @param step - The step object containing additional information.
 * @returns A promise that resolves to an object with a success message.
 */

import { inngest } from "@/lib/inngest/client";
import { generateCandidateEmbeddings } from "@/lib/candidate/ingest-resume/generate-embedding";
import { read, write } from "@/lib/neo4j/utils";

function buildCypherQuery(applicantId: string, embeddings: number[]): string {
  let embeddingsString = embeddings.join(", ");
  let query = `MATCH (t:Talent {applicant_id: "${applicantId}"}) SET t.embedding = [${embeddingsString}] RETURN t`;
  return query;
}

export const resumeGenerateEmbeddings = inngest.createFunction(
  { id: "candidate-generate-neo-embeddings" },
  { event: "app/candidate-generate-neo-embeddings" },
  async ({ event, step }) => {
    const id = event.data.user.id;

    try {
      const embeddings = await generateCandidateEmbeddings(id);

      // Check if embeddings is an array of numbers
      if (Array.isArray(embeddings) && embeddings.length > 0) {
        // Build the cypher query
        const cypherQuery = buildCypherQuery(id, embeddings);

        // Add a 1.5 second delay before next step
        // Prevent timing issues
        await new Promise((resolve) => setTimeout(resolve, 1500));
        // Run the cypher query on the Neo4j database
        await write(cypherQuery);
      } else {
        throw new Error("Invalid or empty embeddings");
      }

      return { message: "Candidate embeddings added successfully." };
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error; // This will cause Inngest to retry the function
    }
  }
);
