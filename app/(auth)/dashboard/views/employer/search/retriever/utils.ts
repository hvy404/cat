"use server";
import { write, read } from "@/lib/neo4j/utils";
import { findSimilarTalents } from "@/lib/engine/retreive-talent";

interface potentialRole {
  applicant_id: string;
  potential_role: string;
}

export async function getTopSimilarTalentsAndPotentialRoles(
  similarTalents: any[]
) {
  // sort the talents by score
  similarTalents.sort((a, b) => b.score - a.score);

  // Get the top 3 similar talents
  const topSimilarTalents = similarTalents.slice(0, 3);

  let potentialRoles: potentialRole[] = [];

  // Iterate over the top 3 similar talents
  for (let i = 0; i < topSimilarTalents.length; i++) {
    const talent = topSimilarTalents[i];
    const applicant_id = talent.applicant_id;

    try {
      // Retrieve the potential roles for each talent
      const potentialRolesResults = await write(
        `MATCH (t:Talent {applicant_id: '${applicant_id}'})-[:HAS_POTENTIAL_ROLE]->(r)
         RETURN t.applicant_id AS applicant_id, r.name AS potential_role`
      );

      // Map the potentialRoles to the potentialRole interface
      const mappedRoles: potentialRole[] = potentialRolesResults.map(
        (role: any) => ({
          applicant_id: role.applicant_id,
          potential_role: role.potential_role,
        })
      );

      // Merge the mapped roles into the potentialRoles array
      potentialRoles = potentialRoles.concat(mappedRoles);
    } catch (error) {
      console.error(
        `Error retrieving potential roles for talent ${applicant_id}:`,
        error
      );
    }
  }

  return { potentialRoles };
}

export async function getHighScoringRoles(
  potentialRolesWithScores: any[],
  scoreThreshold: number
) {
  const highScoringRoles = potentialRolesWithScores.filter(
    (role) => role.score >= scoreThreshold
  );

  const filteredHighScoringRoles = highScoringRoles.map((role) => ({
    potential_role: role.potential_role,
    embedding: role.potentialRoleEmbedding,
    score: role.score,
  }));

  return filteredHighScoringRoles;
}

/**
 * Retrieves similar talents for the given high scoring roles.
 *
 * @param highScoringRoles - An array of high scoring roles.
 * @returns An array of objects containing the potential role and its similar talents.
 */
export async function getSimilarTalentsForRoles(highScoringRoles: any[]) {
  const similarTalentsForRoles = await Promise.all(
    highScoringRoles.map(async (role) => {
      try {
        const similarTalents = await findSimilarTalents(role.embedding, 0.7);
        return {
          potential_role: role.potential_role,
          similarTalents,
        };
      } catch (error) {
        console.error(
          `Error finding similar talents for potential role ${role.potential_role}:`,
          error
        );
        return null;
      }
    })
  );

  const filteredSimilarTalentsForRoles = similarTalentsForRoles.filter(
    (result): result is { potential_role: string; similarTalents: any[] } =>
      result !== null
  );

  return filteredSimilarTalentsForRoles;
}

/**
 * Performs a full-text search on the "potentialRoleNameIndex" index to find potential roles that match the given search term.
 *
 * @param searchTerm - The search term to use for the full-text search.
 * @returns An array of objects containing the applicant ID, potential role, and score for each matching potential role.
 */
export async function fullTextSearchPotentialRoles(
  searchTerm: string
): Promise<any[]> {
  const query = `
    CALL db.index.fulltext.queryNodes("potentialRoleNameIndex", $searchTerm) YIELD node as potentialRole, score
    MATCH (talent:Talent)-[:HAS_POTENTIAL_ROLE]->(potentialRole)
    RETURN talent.applicant_id, potentialRole, score
    ORDER BY score DESC
  `;

  const params = { searchTerm: `${searchTerm}~2` };

  try {
    const result = await read(query, params);
    return result.map((record: any) => ({
      applicant_id: record["talent.applicant_id"],
      potentialRole: record.potentialRole.properties,
      score: record.score,
    }));
  } catch (error) {
    console.error("Error executing full-text search query:", error);
    throw error;
  }
}

/**
 * Fetches the complete node information for the applicant with the given ID.
 * Use in tandem with fullTextSearchPotentialRoles to fetch needed property
 *
 * @param applicantId - The ID of the applicant to fetch information for.
 * @returns An object containing the applicant's ID, title, clearance level, previous role, education, city, state, and zipcode.
 * @throws {Error} If no applicant is found with the given ID.
 */
export async function fetchCompleteNodeInfo(applicantId: string) {
  const query = `
    MATCH (talent:Talent {applicant_id: $applicantId})
    OPTIONAL MATCH (talent)-[:WORKED_AT]->(company)
    OPTIONAL MATCH (talent)-[:STUDIED_AT]->(education)
    RETURN talent {
      .applicant_id,
      .title,
      .clearance_level,
      .city,
      .state,
      .zipcode
    } AS talentInfo,
    collect(DISTINCT company.job_title) AS previous_role,
    collect(DISTINCT {degree: education.degree, institution: education.institution}) AS education
  `;

  const params = { applicantId };

  try {
    const result = await read(query, params);
    if (result.length > 0) {
      const { talentInfo, previous_role, education } = result[0];
      return {
        ...talentInfo,
        previous_role,
        education,
        score: '*',
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching complete node info:", error);
    throw error;
  }
}
