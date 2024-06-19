"use server";
import { write } from "@/lib/neo4j/utils";
import { findSimilarTalents } from "@/lib/engine/retreive-talent";


interface potentialRole {
  applicant_id: string;
  potential_role: string;
}

export async function getTopSimilarTalentsAndPotentialRoles(similarTalents: any[]) {
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

export async function getHighScoringRoles(potentialRolesWithScores: any[], scoreThreshold: number) {
  const highScoringRoles = potentialRolesWithScores.filter(
    (role) => role.score >= scoreThreshold
  );

  const filteredHighScoringRoles = highScoringRoles.map((role) => ({
    potential_role: role.potential_role,
    embedding: role.embedding,
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
          const similarTalents = await findSimilarTalents(role.embedding, 0.67);
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

  