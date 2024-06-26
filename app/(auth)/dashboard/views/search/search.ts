"use server";
import { findSimilarTalents } from "@/lib/engine/retreive-talent";
import { generateEmbeddings } from "@/lib/llm/generate-embeddings";
import { calculateSimilarity } from "@/lib/engine/calculate-distance";
import {
  getTopSimilarTalentsAndPotentialRoles,
  getHighScoringRoles,
  getSimilarTalentsForRoles,
} from "./retriever/utils";
import { contentModerationWordFilter } from "@/lib/content-moderation/explicit_word_filter";

export type SearchResult = {
  match: boolean;
  similarTalents: {
    applicant_id: string;
    title: string;
    clearance_level: string;
    score: number;
    previous_role: string[];
    education: Array<{ degree: string; institution: string }>;
    city: string;
    state: string;
    zipcode: string;
  }[];
  overlappingRoles?: { similar: any; score: any }[];
};

// Add remapping functions
// Remap internal clearance levels to standard clearance levels
function remapClearanceLevel(level: string) {
  switch (level) {
    case "none":
      return "Unclassified";
    case "basic":
      return "Public Trust";
    case "confidential":
      return "Secret";
    case "critical":
      return "Top Secret";
    case "paramount":
      return "Top Secret/SCI";
    case "q_clearance":
      return "Q Clearance";
    case "l_clearance":
      return "L Clearance";
    default:
      return level;
  }
}

/**
 * The `searchHandler` function handles the search functionality based on the main search query.
 * It performs the following steps:
 * 1. Generates embeddings for the main search query using the `generateEmbeddings` function.
 * 2. Finds similar talents based on the embeddings using the `findSimilarTalents` function with a threshold of 0.67.
 * 3. Retrieves the top similar talents and their potential roles using the `getTopSimilarTalentsAndPotentialRoles` function.
 * 4. Generates embeddings for the main search query again, but with a slightly different query format.
 * 5. Calculates the similarity between the main search query embeddings and the embeddings of each potential role using the `calculateSimilarity` function.
 * 6. Filters out any potential roles that failed to generate embeddings.
 * 7. Retrieves the high scoring roles based on a score threshold of 0.62 using the `getHighScoringRoles` function.
 * 8. Finds similar talents for each high scoring role using the `getSimilarTalentsForRoles` function.
 * 9. Merges the similar talents found based on the main search query and the similar talents found for each high scoring role.
 * 10. Removes any duplicate talents from the merged results to obtain a list of unique similar talents.
 *
 * Finally, the function returns an object containing the unique similar talents found.
 *
 * The `searchHandler` function utilizes several helper functions:
 * - `generateEmbeddings`: Generates embeddings for a given query.
 * - `findSimilarTalents`: Finds similar talents based on embeddings and a similarity threshold.
 * - `getTopSimilarTalentsAndPotentialRoles`: Retrieves the top similar talents and their potential roles.
 * - `calculateSimilarity`: Calculates the similarity between two embeddings.
 * - `getHighScoringRoles`: Retrieves the high scoring roles based on a score threshold.
 * - `getSimilarTalentsForRoles`: Finds similar talents for each high scoring role.
 *
 * These helper functions are defined in separate utility modules and are imported into the main module where the `searchHandler` function is defined.
 *
 * The `searchHandler` function plays a crucial role in the search functionality of the application by taking the main search query, evaluating it against the candidates' potential roles, and returning a list of unique similar talents based on both the main search query and the high scoring potential roles.
 * @param mainSearchQuery - The main search query.
 * @returns An object containing the unique similar talents found.
 * @throws If an error occurs during the search process.
 */

export async function searchHandler(mainSearchQuery: string) {
  // Power user flags
  let eagleEyeDetected = false;

  // Validate the mainSearchQuery
  const isValid =
    /^(?=.*[a-zA-Z0-9])(?:(?:!wildwildwest|!eagleeye|\s|[a-zA-Z0-9])+)$/.test(
      mainSearchQuery
    );
  if (!isValid) {
    return {
      match: false,
      similarTalents: [],
      overlappingRoles: [],
    };
  }

  // Check for easter eggs and log them
  if (mainSearchQuery.includes("!wildwildwest")) {
    console.log("Easter egg detected: Wild Wild West");
  }
  if (mainSearchQuery.includes("!eagleeye")) {
    console.log("Easter egg detected: Eagle Eye");
    eagleEyeDetected = true;
  }

  // Check for explicit content in the main search query
  const explicitContent = await contentModerationWordFilter(mainSearchQuery);
  if (explicitContent) {
    return {
      match: false,
      socket: true,
    };
  }

  // Clean the query Remove easter egg flags
  let cleanedSearchQuery = mainSearchQuery;
  cleanedSearchQuery = cleanedSearchQuery.replace(/!wildwildwest/g, "").trim();
  cleanedSearchQuery = cleanedSearchQuery.replace(/!eagleeye/g, "").trim();

  try {
    const buildQuery = `I need candidate that has experience as a ${cleanedSearchQuery}`;
    const embeddings = await generateEmbeddings(buildQuery);
    const threshold = 0.715;
    const similarTalents = await findSimilarTalents(embeddings, threshold);

    // Get the top similar talents and their potential roles
    const { potentialRoles } = await getTopSimilarTalentsAndPotentialRoles(
      similarTalents
    );

    const embedddingToMatchPotentialRoles = await generateEmbeddings(
      `Candidate that has experience as a ${cleanedSearchQuery}`
    );

    // Calculate similarity between the main search query and the potential roles
    const potentialRolesWithScores = await Promise.all(
      potentialRoles.map(async (role) => {
        try {
          const queryToEmbed = `Has experience as a ${role.potential_role}`;
          const embedding = await generateEmbeddings(queryToEmbed);

          // Calculate similarity between the query and the potential role
          const score = await calculateSimilarity(
            embedddingToMatchPotentialRoles,
            embedding
          );
          return {
            potential_role: role.potential_role,
            score,
            embedding,
          };
        } catch (error) {
          console.error(
            `Error calculating similarity for potential role ${role.potential_role}:`,
            error
          );
          return null;
        }
      })
    );

    // Filter out any potential roles that failed to generate an embedding
    const filteredPotentialRolesWithScores = potentialRolesWithScores.filter(
      (
        role
      ): role is {
        potential_role: string;
        score: number;
        embedding: number[];
      } => role !== null && role.embedding !== undefined
    );

    // Function to get high scoring roles
    const highScoringRoles = await getHighScoringRoles(
      filteredPotentialRolesWithScores,
      0.62
    );

    // Get similar talents for high scoring roles from Neo4j
    const similarTalentsForRoles = await getSimilarTalentsForRoles(
      highScoringRoles
    );

    // Merge results of similar talents based on the main search query and the potential roles
    const mergedSimilarTalents = similarTalents.concat(
      similarTalentsForRoles.flatMap((result) => result.similarTalents)
    );

    // Remove duplicate talents
    const uniqueSimilarTalents = mergedSimilarTalents.filter(
      (talent, index, self) =>
        index === self.findIndex((t) => t.applicant_id === talent.applicant_id)
    );

    // Array of similar talents: {potential_role, score, embedding}
    const overlappingSimilarRoles = {
      possible_query: highScoringRoles,
    };

    // Transform results for response
    // Returns array of similar talents with score
    const overlappingSimilarRolesCondensed =
      overlappingSimilarRoles.possible_query.map((item) => {
        return {
          similar: item.potential_role,
          score: item.score,
        };
      });

    return {
      match: uniqueSimilarTalents.length > 0,
      similarTalents: uniqueSimilarTalents.map((talent) => ({
        applicant_id: talent.applicant_id,
        title: talent.title,
        clearance_level: remapClearanceLevel(talent.clearance_level),
        score: talent.score,
        previous_role: talent.previous_role,
        education: talent.education,
        city: talent.city,
        state: talent.state,
        zipcode: talent.zipcode,
      })),
      ...(eagleEyeDetected
        ? { overlappingRoles: overlappingSimilarRolesCondensed }
        : {}),
    };
  } catch (error) {
    console.error("Error in searchHandler:", error);
    throw error;
  }
}
