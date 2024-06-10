"use server";
import { read } from "@/lib/neo4j/utils";

export async function MatchWideJobToRole(/* jobID: string */) {
  let jobID = "6d98e834-6513-4736-8cc8-b190a473ed3b";
  let query = `MATCH (j:Job {job_id: "${jobID}"}) RETURN j`;

  try {
    const job = await read(query);
    const embedding = job[0]?.j.properties.embedding;
    console.log(embedding);
    return embedding;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    // Handle the error appropriately (e.g., return an error response)
    throw error; // or return { success: false, error: error.message };
  }
}

// Get embedding for JobID
export async function getJobEmbedding(jobID: string) {
  const query = `
    MATCH (j:Job {job_id: $jobID})
    RETURN j.embedding AS embedding
  `;

  const params = { jobID };

  try {
    const result = await read(query, params);
    const embedding = result[0]?.embedding;
    console.log(embedding);
    return embedding;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}