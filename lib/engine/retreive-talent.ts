"use server";
import { read } from "@/lib/neo4j/utils";

/**
 * Retrieves the job embedding for a given job ID.
 * @param jobID - The ID of the job.
 * @returns The job embedding.
 * @throws If there is an error executing the Neo4j query.
 */
export async function getJobEmbedding(jobID: string) {
  const query = `
    MATCH (j:Job {job_id: $jobID})
    RETURN j.embedding AS embedding
  `;

  const params = { jobID };

  try {
    const result = await read(query, params);
    const embedding = result[0]?.embedding;
    return embedding;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}

/**

Finds similar talents based on the provided embedding vector.
@param {number[]} embedding - The embedding vector used to find similar talents.
@returns {Promise<Object[]>} A promise that resolves to an array of plain objects representing the similar talents.
Each object contains the applicant_id and score properties.
@throws {Error} If an error occurs while executing the Neo4j query.
@example
const embedding = [0.1, 0.2, 0.3, ...];
const similarTalents = await findSimilarTalents(embedding);
console.log(similarTalents);
// Output: [
//   { applicant_id: '96eda40b-5fd1-4378-a4dd-e2ef63dc7a75', score: 0.8, title: 'Software Engineer', clearance_level: 'TS/SCI' },
//   { applicant_id: '70689ca0-ea2c-4a92-ac06-84ecfcd0a08e', score: 0.7, title: 'Data Scientist', clearance_level: 'Secret' },
//   ...
// ]
*/
export async function findSimilarTalents(
  embedding: number[],
  threshold: number
) {
  const query = `
    CALL db.index.vector.queryNodes('talent-embeddings', 15, $embedding)
    YIELD node AS similarTalent, score
    WHERE score >= $threshold
    OPTIONAL MATCH (similarTalent)-[:WORKED_AT]->(company)
    OPTIONAL MATCH (similarTalent)-[:STUDIED_AT]->(education)
    RETURN 
      similarTalent { 
        .applicant_id, 
        .title, 
        .clearance_level,
        .city,
        .state,
        .zipcode
      } AS similarTalent,
      score,
      collect(DISTINCT company.job_title) AS worked_at,
      collect(DISTINCT {degree: education.degree, institution: education.institution}) AS education
  `;

  const params = { embedding, threshold };

  try {
    const result = await read(query, params);

    // Map the result to the desired structure
    const similarTalentsPlain = result.map(({ similarTalent, score, worked_at, education }) => ({
      applicant_id: similarTalent.applicant_id,
      title: similarTalent.title,
      clearance_level: similarTalent.clearance_level,
      city: similarTalent.city,
      state: similarTalent.state,
      zipcode: similarTalent.zipcode,
      score,
      previous_role: worked_at.filter(Boolean), // Remove any null or undefined values
      education: education.filter(Boolean) // Remove any null or undefined values
    }));

    //console.log("Similar Talents:", similarTalentsPlain);

    return similarTalentsPlain;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}

/**
 * Retrieves the properties of a talent node based on the provided applicant_id.
 *
 * @param {string} applicantId - The applicant_id of the talent node to retrieve.
 * @returns {Promise<Object>} A promise that resolves to an object containing the properties of the talent node.
 *
 * @throws {Error} If an error occurs while executing the Neo4j query.
 *
 * @example
 * const applicantId = '96eda40b-5fd1-4378-a4dd-e2ef63dc7a75';
 * const talentProperties = await getTalentProperties(applicantId);
 * console.log(talentProperties);
 * // Output: {
 * //   name: 'John Doe',
 * //   skills: ['JavaScript', 'React'],
 * //   experience: 5,
 * //   ...
 * // }
 */
export async function getTalentProperties(applicantId: string) {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})
    RETURN t
  `;

  const params = { applicantId };

  try {
    const result = await read(query, params);
    const talentProperties = result[0]?.t.properties;
    console.log("Talent Properties:", talentProperties);
    return talentProperties;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}

/**
 * Retrieves the relationships and connected nodes of a talent node based on the provided applicant_id.
 *
 * @param {string} applicantId - The applicant_id of the talent node.
 * @returns {Promise<Object[]>} A promise that resolves to an array of objects representing the relationships and connected nodes of the talent node.
 * Each object contains the `type` of the relationship and the `node` connected to the talent node.
 *
 * @throws {Error} If an error occurs while executing the Neo4j query.
 *
 * @example
 * const applicantId = '96eda40b-5fd1-4378-a4dd-e2ef63dc7a75';
 * const talentRelationships = await getTalentRelationships(applicantId);
 * console.log(talentRelationships);
 * // Output: [
 * //   { type: 'KNOWS', node: { name: 'John Smith', age: 30 } },
 * //   { type: 'WORKED_AT', node: { name: 'ABC Company', industry: 'Technology' } },
 * //   ...
 * // ]
 */
export async function getTalentRelationships(applicantId: string) {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})-[r]->(n)
    RETURN type(r) AS type, n
  `;

  const params = { applicantId };

  try {
    const result = await read(query, params);
    const talentRelationships = result.map((record) => ({
      type: record.type,
      node: record.n.properties,
    }));
    console.log("Talent Relationships:", talentRelationships);
    return talentRelationships;
  } catch (error) {
    console.error("Error executing Neo4j query:", error);
    throw error;
  }
}

/**
 * Retrieves the relationship details of a talent based on the provided applicant ID and relationship type.
 * relationshipType: STUDIED_AT, WORKED_AT, HAS_SKILL, HAS_CERTIFICATION, HAS_INDUSTRY_EXPERIENCE, HAS_SOFT_SKILL, HAS_POTENTIAL_ROLE, HAS_MENTOR, HAS_REFERENCE, HAS_COLLEAGUE
 * @param applicantId The ID of the talent applicant.
 * @param relationshipType The type of relationship to retrieve.
 * @returns An array of relationship details.
 * @throws If there is an error executing the Neo4j query.
 */
export async function getTalentRelationshipDetails(
  applicantId: string,
  relationshipType: string
) {
  const query = `
    MATCH (t:Talent {applicant_id: $applicantId})-[r:${relationshipType}]->(n)
    RETURN type(r) AS type, properties(r) AS properties, properties(n) AS node
  `;

  const params = { applicantId };

  try {
    const result = await read(query, params);
    let relationships: string[] = [];

    switch (relationshipType) {
      case "STUDIED_AT":
        relationships = result.map(
          (record) =>
            `Degree: ${record.node.degree} at ${record.node.institution}`
        );
        break;
      case "WORKED_AT":
        relationships = result.map(
          (record) =>
            `Job Title: ${record.node.job_title} at Organization: ${record.node.organization} from ${record.node.start_date} to ${record.node.end_date}. Responsibilities: ${record.node.responsibilities}`
        );
        break;
      case "HAS_SKILL":
      case "HAS_CERTIFICATION":
      case "HAS_INDUSTRY_EXPERIENCE":
      case "HAS_SOFT_SKILL":
      case "HAS_POTENTIAL_ROLE":
      case "HAS_MENTOR":
      case "HAS_REFERENCE":
      case "HAS_COLLEAGUE":
        relationships = result.map((record) => record.node.name);
        break;
      default:
        relationships = result.map(
          (record) =>
            `Type: ${record.type}, Node: ${JSON.stringify(record.node)}`
        );
        break;
    }

    return relationships;
  } catch (error) {
    console.error("Error retrieving talent relationship details:", error);
    throw error;
  }
}
