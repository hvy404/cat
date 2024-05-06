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

    const embeddings = await generateCandidateEmbeddings(id);

    // Check if embeddings is an array of numbers
    if (Array.isArray(embeddings)) {
      // Build the cypher query
      const cypherQuery = buildCypherQuery(id, embeddings);

      console.log("Writing the embeddings to Neo4j");

      // Run the cypher query on the Neo4j database
      await write(cypherQuery);
    } else {
      console.error("Invalid embeddings");
    }

    return { message: "Candidate embeddings added successfully." };
  }
);
