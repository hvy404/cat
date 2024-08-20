"use server";

import { findSimilarTalents } from "@/lib/engine/retreive-talent";
import { generateEmbeddings } from "@/lib/llm/generate-embeddings";
import { calculateSimilarity } from "@/lib/engine/calculate-distance";
import {
  getTopSimilarTalentsAndPotentialRoles,
  getHighScoringRoles,
  getSimilarTalentsForRoles,
  fullTextSearchPotentialRoles,
  fetchCompleteNodeInfo
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

export async function searchHandler(mainSearchQuery: string) {
  let eagleEyeDetected = false;

  const isValid = /^(?=.*[a-zA-Z0-9])(?:(?:!wildwildwest|!eagleeye|\s|[a-zA-Z0-9])+)$/.test(mainSearchQuery);
  if (!isValid) {
    return { match: false, similarTalents: [], overlappingRoles: [] };
  }

  if (mainSearchQuery.includes("!wildwildwest")) {
    console.log("Easter egg detected: Wild Wild West");
  }
  if (mainSearchQuery.includes("!eagleeye")) {
    console.log("Easter egg detected: Eagle Eye");
    eagleEyeDetected = true;
  }

  const explicitContent = await contentModerationWordFilter(mainSearchQuery);
  if (explicitContent) {
    return { match: false, socket: true };
  }

  let cleanedSearchQuery = mainSearchQuery.replace(/!wildwildwest/g, "").replace(/!eagleeye/g, "").trim();

  try {
    const fullTextResults = await fullTextSearchPotentialRoles(cleanedSearchQuery);
    const fullTextCompleteResults = await Promise.all(
      fullTextResults.map(async (result) => {
        const completeInfo = await fetchCompleteNodeInfo(result.applicant_id);
        return { 
          ...completeInfo, 
          previous_role: completeInfo.previous_role || [], // Provide a default empty array
          score: 1 
        };
      })
    );
    

    const buildQuery = `Candidate suitable for role as ${cleanedSearchQuery}.`;
    const mainSearchEmbedding = await generateEmbeddings(buildQuery);
    const threshold = 0.75;
    const similarTalents = await findSimilarTalents(mainSearchEmbedding, threshold);
    

    const { potentialRoles } = await getTopSimilarTalentsAndPotentialRoles(similarTalents);

    const potentialRolesWithScores = await Promise.all(
      potentialRoles.map(async (role) => {
        try {
          const potentialRoleNameToEmbed = `Suited for role as ${role.potential_role}`;
          const potentialRoleEmbedding = await generateEmbeddings(potentialRoleNameToEmbed);
          const score = await calculateSimilarity(mainSearchEmbedding, potentialRoleEmbedding);
          return { potential_role: role.potential_role, score, potentialRoleEmbedding };
        } catch (error) {
          console.error(`Error calculating similarity for potential role ${role.potential_role}:`, error);
          return null;
        }
      })
    );

    const filteredPotentialRolesWithScores = potentialRolesWithScores.filter(
      (role): role is { potential_role: string; score: number; potentialRoleEmbedding: [] } =>
        role !== null && role.potentialRoleEmbedding !== undefined
    );

    const highScoringRoles = await getHighScoringRoles(filteredPotentialRolesWithScores, 0.7);
    const similarTalentsForRoles = await getSimilarTalentsForRoles(highScoringRoles);

    const mergedSimilarTalents = [...fullTextCompleteResults, ...similarTalents, ...similarTalentsForRoles.flatMap(result => result.similarTalents)];
    const uniqueSimilarTalents = mergedSimilarTalents.filter(
      (talent, index, self) => index === self.findIndex((t) => t.applicant_id === talent.applicant_id)
    );

    const overlappingSimilarRoles = { possible_query: highScoringRoles };
    const overlappingSimilarRolesCondensed = overlappingSimilarRoles.possible_query.map((item) => ({
      similar: item.potential_role,
      score: item.score,
    }));

    return {
      match: uniqueSimilarTalents.length > 0,
      similarTalents: uniqueSimilarTalents.map((talent) => ({
        applicant_id: talent.applicant_id,
        title: talent.title,
        clearance_level: remapClearanceLevel(talent.clearance_level),
        score: talent.score != null ? Number(talent.score.toFixed(2)) : 1,
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
