"use server";
import { calculateSimilarity } from "@/lib/engine/calculate-distance";
import { generateEmbedding } from "@/lib/engine/generate-embedding";
import { getTalentRelationshipDetails } from "@/lib/engine/retreive-talent";
import { getJobRelationshipDetails } from "@/lib/engine/retrieve-job";

/**
 * Represents the relationship between job requirements and talent attributes.
 */

const relationshipCombos = {
  A: { job: "REQUIRES_SKILL", talent: "HAS_SKILL" },
  // Matching the required technical skills from the job description with the talent's technical skills
  // jobDescriptionStaticSecondarySchema.skills <> staticSchema.technical_skills

  B: { job: "REQUIRES_SKILL", talent: "HAS_SOFT_SKILL" },
  // Matching the required skills from the job description with the talent's soft skills
  // jobDescriptionStaticSecondarySchema.skills <> staticSchema.soft_skills

  C: { job: "REQUIRES_QUALIFICATION", talent: "WORKED_AT" },
  // Matching the required qualifications from the job description with the talent's work experience
  // jobDescriptionStaticSecondarySchema.qualifications <> (derived from staticSchema.work_experience)

  D: { job: "REQUIRES_QUALIFICATION", talent: "STUDIED_AT" },
  // Matching the required qualifications from the job description with the talent's education
  // jobDescriptionStaticSecondarySchema.qualifications <> staticSchema.education

  E: { job: "REQUIRED_EDUCATION", talent: "STUDIED_AT" },
  // Matching the required education from the job description with the talent's education
  // jobDescriptionStaticSecondarySchema.education <> staticSchema.education

  F: { job: "REQUIRED_CERTIFICATION", talent: "HAS_CERTIFICATION" },
  // Matching the required certifications from the job description with the talent's professional certifications
  // jobDescriptionStaticSecondarySchema.certifications <> staticSchema.professional_certifications

  G: { job: "PREFERS_SKILL", talent: "HAS_SOFT_SKILL" },
  // Matching the preferred skills from the job description with the talent's soft skills
  // jobDescriptionStaticSecondarySchema.preferredSkills <> staticSchema.soft_skills

  H: { job: "REQUIRES_QUALIFICATION", talent: "HAS_INDUSTRY_EXPERIENCE" },
  // Matching the required qualifications from the job description with the talent's industry experience
  // jobDescriptionStaticSecondarySchema.qualifications <> staticSchema.industry_experience

  I: { job: "SUITABLE_FOR_ROLE", talent: "HAS_POTENTIAL_ROLE" },
  // Matching the suitable past roles from the job description with the talent's potential roles
  // assumedDetailsSchema.suitablePastRoles <> inferredSchema.potential_roles
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
  combo: keyof typeof relationshipCombos // Example: A, B, C...
) {
  const relationshipCombo = relationshipCombos[combo];


  if (!relationshipCombo) {
    throw new Error(`Invalid set`);
  }

  const { job, talent } = relationshipCombo;

  // Get job relationships
  const jobRelationships = await getJobRelationshipDetails(jobID, job);
  const jobRelationshipsString = jobRelationships.join(", ");

  //console.log(`${job}`, jobRelationshipsString);

  // Get talent relationships
  const talentRelationships = await getTalentRelationshipDetails(
    applicantID,
    talent
  );
  const talentRelationshipsString = talentRelationships.join(", ");

  //console.log(`${talent}`, talentRelationshipsString);

  // Check if either job relationships or talent relationships are empty
  if (jobRelationships.length === 0 || talentRelationships.length === 0) {
    //console.log(`Skipping ${job} <> ${talent} due to empty relationships`);
    return { evaluated: false }; // Return object to indicate skipping
  }

  // Get embedding for job relationships
  const jobEmbedding = await generateEmbedding(jobRelationshipsString);
  //console.log(`${job} Embedding`, jobEmbedding);
  //console.log(`${job}`, jobRelationshipsString);

  // Get embedding for talent relationships
  const talentEmbedding = await generateEmbedding(talentRelationshipsString);
  //console.log(`${talent} Embedding`, talentEmbedding);
  //console.log(`${talent}`, talentRelationshipsString);

  // Calculate similarity score
  const similarityScore = await calculateSimilarity(
    jobEmbedding,
    talentEmbedding
  );

  //console.log(`Similarity Score for ${job} <> ${talent}`, similarityScore);

  return { evaluated: true, score: similarityScore };
}
