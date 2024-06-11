"use server";
import { read } from "@/lib/neo4j/utils";

/**
 * Retrieves a job from the database based on the provided job ID.
 * @param jobID - The ID of the job to retrieve.
 * @returns The retrieved job object.
 * @throws If there is an error executing the Neo4j query.
 */
export async function getJobByJobID(jobID: string) {
  const query = `
      MATCH (j:Job {job_id: $jobID})
      RETURN j
    `;

  const params = { jobID };

  try {
    const result = await read(query, params);
    const job = result[0]?.j;
    console.log(job);
    return job;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}

/**
 * Retrieves the relationships of a job from the Neo4j database.
 * @param jobID - The ID of the job.
 * @returns An array of job relationships, where each relationship contains the type and node properties.
 * @throws If there is an error executing the Neo4j query.
 */
export async function getJobRelationships(jobID: string) {
  const query = `
      MATCH (j:Job {job_id: $jobID})-[r]->(n)
      RETURN type(r) AS type, n
    `;

  const params = { jobID };

  try {
    const result = await read(query, params);
    const jobRelationships = result.map((record) => ({
      type: record.type,
      node: record.n.properties,
    }));
    console.log("Job Relationships:", jobRelationships);
    return jobRelationships;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}

/**
 * Retrieves the responsibilities of a job based on the specified job ID and relationship type.
 * Possible relationshipType: REQUIRES_SKILL, OFFERS_BENEFIT, REQUIRES_QUALIFICATION, PREFERS_SKILL, HAS_RESPONSIBILITY, SUITABLE_FOR_ROLE
 * @param jobID - The ID of the job.
 * @param relationshipType - The type of relationship between the job and its responsibilities.
 * @returns An array of job responsibilities.
 * @throws If there is an error executing the Neo4j query.
 */
export async function getJobRelationshipDetails(
  jobID: string,
  relationshipType: string
) {
  const query = `
        MATCH (j:Job {job_id: $jobID})-[r:${relationshipType}]->(n)
        RETURN n
      `;

  const params = { jobID };

  try {
    const result = await read(query, params);
    const responsibilities = result.map((record) => record.n.properties.name);
    //console.log(`Job ${relationshipType}:`, responsibilities);
    return responsibilities;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}
