"use server";

import { calculateSimilarity } from "@/lib/engine/calculate-distance";
import { generateEmbedding } from "@/lib/engine/generate-embedding";
import { getTalentRelationshipDetails } from "@/lib/engine/retreive-talent";
import {
  getJobRelationshipDetails,
  getJobProperties,
} from "@/lib/engine/retrieve-job";

/**
 * Represents the relationship between job requirements and talent attributes.
 */

const relationshipCombos = {
  A: { job: "REQUIRES_SKILL", talent: "HAS_SKILL" },
  B: { job: "experience", talent: "WORKED_AT" },
  C: { job: "education", talent: "STUDIED_AT" },
  D: { job: "REQUIRED_CERTIFICATION", talent: "HAS_CERTIFICATION" },
  E: { job: "PREFERS_SKILL", talent: "HAS_SKILL" },
  F: { job: "SUITABLE_FOR_ROLE", talent: "HAS_POTENTIAL_ROLE" },
};

const prefixPairs = {
  A: {
    job: "Required skills for this job:",
    talent: "The candidate possesses",
  },
  B: {
    job: "Required experience for this job:",
    talent: "The candidate was a",
  },
  C: { job: "Required education for this job:", talent: "The candidate has" },
  D: { job: "The job opportunity requires", talent: "The candidate holds" }, // 60 is a good amtch
  E: {
    job: "Preferred skills for this job:",
    talent: "The candidate possesses",
  },
  F: {
    job: "Suitable for job seekers with the following role:",
    talent: "Candidate fits the following potential roles:",
  },
};

/**
 * Evaluates the talent match for a given applicant.
 * @param applicantID - The ID of the applicant to evaluate.
 * @param jobID - The ID of the job to evaluate against.
 * @param combo - The relationship combo to evaluate.
 * @returns An object containing the evaluation result.
 */

export async function evaluateTalentMatch(
  applicantID: string,
  jobID: string,
  combo: keyof typeof relationshipCombos
) {
  const relationshipCombo = relationshipCombos[combo];
  const prefixPair = prefixPairs[combo];

  if (!relationshipCombo || !prefixPair) {
    throw new Error(`Invalid set`);
  }

  const { job, talent } = relationshipCombo;

  // Get job details
  let jobDetails;
  if (job === "experience" || job === "education") {
    jobDetails = await getJobProperties(jobID, [job]);
  } else {
    jobDetails = await getJobRelationshipDetails(jobID, job);
  }

  // Get talent relationships
  const talentRelationships = await getTalentRelationshipDetails(
    applicantID,
    talent
  );

  // Check if either job details or talent relationships are empty
  if (!jobDetails || talentRelationships.length === 0) {
    return { evaluated: false };
  }

  // Convert job details and talent relationships to strings with prefixes
  const jobString = `${prefixPair.job} ${
    Array.isArray(jobDetails)
      ? jobDetails.join(", ")
      : Object.values(jobDetails).join(", ")
  }`;
  const talentString = `${prefixPair.talent} ${talentRelationships.join(", ")}`;

  console.log("Job Details:", jobString);
  console.log("Talent Relationships:", talentString);

  // Get embedding for job details
  const jobEmbedding = await generateEmbedding(jobString);

  // Get embedding for talent relationships
  const talentEmbedding = await generateEmbedding(talentString);

  // Calculate similarity score
  const similarityScore = await calculateSimilarity(
    jobEmbedding,
    talentEmbedding
  );

  return { evaluated: true, score: similarityScore };
}
