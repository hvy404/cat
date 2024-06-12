"use server";
import { calculateSimilarity } from "@/lib/engine/calculate-distance";
import { generateEmbedding } from "@/lib/engine/generate-embedding";
import { getTalentRelationshipDetails } from "@/lib/engine/retreive-talent";
import { getJobRelationshipDetails } from "@/lib/engine/retrieve-job";

// Define the relationship combos
const relationshipCombos = {
  A: { job: "REQUIRES_SKILL", talent: "HAS_SKILL" },
  B: { job: "REQUIRES_SKILL", talent: "HAS_SOFT_SKILL" },
  C: { job: "REQUIRES_QUALIFICATION", talent: "WORKED_AT" },
  D: { job: "REQUIRES_QUALIFICATION", talent: "STUDIED_AT" }
};

/**
 * Evaluates the talent match for a given applicant.
 * @param applicantID - The ID of the applicant to evaluate.
 * @param jobID - The ID of the job to evaluate against.
 * @param combo - The relationship combo to evaluate.
 * @returns The evaluation result.
 */
export async function evaluateTalentMatch(
  applicantID: string,
  jobID: string,
  combo: keyof typeof relationshipCombos // A, B, or C
) {
  const relationshipCombo = relationshipCombos[combo];

  console.log(combo)

  if (!relationshipCombo) {
    throw new Error(`Invalid combo: ${combo}. Valid combos are: A, B, C.`);
  }

  const { job, talent } = relationshipCombo;

  // Get job relationships
  const jobRelationships = await getJobRelationshipDetails(jobID, job);
  const jobRelationshipsString = jobRelationships.join(", ");

  // Get embedding for job relationships
  const jobEmbedding = await generateEmbedding(jobRelationshipsString);
  console.log(`${job} Embedding`, jobEmbedding);
  console.log(`${job}`, jobRelationshipsString);

  // Get talent relationships
  const talentRelationships = await getTalentRelationshipDetails(applicantID, talent);
  const talentRelationshipsString = talentRelationships.join(", ");

  // Get embedding for talent relationships
  const talentEmbedding = await generateEmbedding(talentRelationshipsString);
  console.log(`${talent} Embedding`, talentEmbedding);
  console.log(`${talent}`, talentRelationshipsString);

  // Calculate similarity score
  const similarityScore = await calculateSimilarity(jobEmbedding, talentEmbedding);
  console.log(`Similarity Score for ${job} <> ${talent}`, similarityScore);

  return similarityScore;
}