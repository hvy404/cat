type Scores = {
  original: number; // The original cosine similarity score
  A: number; // Score for REQUIRES_SKILL - HAS_SKILL match
  B: number; // Score for REQUIRES_SKILL - HAS_SOFT_SKILL match
  C: number; // Score for REQUIRES_QUALIFICATION - WORKED_AT match
  D: number; // Score for REQUIRES_QUALIFICATION - STUDIED_AT match
  E: number; // Score for REQUIRED_EDUCATION - STUDIED_AT match
  F: number; // Score for REQUIRED_CERTIFICATION - HAS_CERTIFICATION match
  G: number; // Score for PREFERS_SKILL - HAS_SOFT_SKILL match
  H: number; // Score for REQUIRES_QUALIFICATION - HAS_INDUSTRY_EXPERIENCE match
  I: number; // Score for SUITABLE_FOR_ROLE - HAS_POTENTIAL_ROLE match
};

type Weights = {
  original: number; // Weight for the original cosine similarity score
  A: number; // Weight for REQUIRES_SKILL - HAS_SKILL match
  B: number; // Weight for REQUIRES_SKILL - HAS_SOFT_SKILL match
  C: number; // Weight for REQUIRES_QUALIFICATION - WORKED_AT match
  D: number; // Weight for REQUIRES_QUALIFICATION - STUDIED_AT match
  E: number; // Weight for REQUIRED_EDUCATION - STUDIED_AT match
  F: number; // Weight for REQUIRED_CERTIFICATION - HAS_CERTIFICATION match
  G: number; // Weight for PREFERS_SKILL - HAS_SOFT_SKILL match
  H: number; // Weight for REQUIRES_QUALIFICATION - HAS_INDUSTRY_EXPERIENCE match
  I: number; // Weight for SUITABLE_FOR_ROLE - HAS_POTENTIAL_ROLE match
};

type Config = {
  normalizeWeights: boolean; // Flag to normalize weights if they do not sum to 1
};

// Default weights and configuration
const defaultWeights: Weights = {
  original: 0.5, // Higher weight for original cosine similarity - this similarity of birdseye of the JD and resume
  A: 0.25, // Significant weight for REQUIRES_SKILL - HAS_SKILL match
  B: 0.15, // Lower weight for REQUIRES_SKILL - HAS_SOFT_SKILL match
  C: 0.2, // Significant weight for REQUIRES_QUALIFICATION - WORKED_AT match
  D: 0.10, // Lower weight for REQUIRES_QUALIFICATION - STUDIED_AT match
  E: 0.2, // Significant weight for REQUIRED_EDUCATION - STUDIED_AT match
  F: 0.15, // Lower weight for REQUIRED_CERTIFICATION - HAS_CERTIFICATION match
  G: 0.05, // Very low weight for PREFERS_SKILL - HAS_SOFT_SKILL match
  H: 0.05, // Very low weight for REQUIRES_QUALIFICATION - HAS_INDUSTRY_EXPERIENCE match
  I: 0.05, // Very low weight for SUITABLE_FOR_ROLE - HAS_POTENTIAL_ROLE match
};

const defaultConfig: Config = {
  normalizeWeights: true, // Enable normalization by default
};

/**
 * Validates the scores to ensure they are within the valid range (0 to 1).
 *
 * @param scores - The scores object to validate.
 */
function validateScores(scores: Scores): void {
  for (const key in scores) {
    if (scores.hasOwnProperty(key)) {
      const score = scores[key as keyof Scores];
      if (score < 0 || score > 1) {
        throw new Error(
          `Score ${key} is out of range. It should be between 0 and 1.`
        );
      }
    }
  }
}

/**
 * Validates the weights to ensure they are non-negative.
 *
 * @param weights - The weights object to validate.
 */
function validateWeights(weights: Weights): void {
  for (const key in weights) {
    if (weights.hasOwnProperty(key)) {
      const weight = weights[key as keyof Weights];
      if (weight < 0) {
        throw new Error(`Weight ${key} is invalid. It should be non-negative.`);
      }
    }
  }
}

/**
 * Calculates the final match score using a weighted average of various match scores.
 *
 * @param scores - An object containing the scores from different matching processes.
 * @param weights - (Optional) An object containing the weights for each score type. Defaults to preprogrammed weights.
 * @param config - (Optional) Configuration object to control the calculation process. Defaults to preprogrammed config.
 * @returns The final match score as a weighted average.
 */
export function calculateEnhancedScore(
  scores: Partial<Scores>,
  weights: Weights = defaultWeights,
  config: Config = defaultConfig
): number {
  // Validate the weights
  validateWeights(weights);

  // Destructure the weights for easier access
  const {
    original: wOriginal,
    A: wA,
    B: wB,
    C: wC,
    D: wD,
    E: wE,
    F: wF,
    G: wG,
    H: wH,
    I: wI,
  } = weights;

  // Calculate the sum of the weights for non-empty scores
  let weightSum = 0;
  if (scores.original !== undefined) weightSum += wOriginal;
  if (scores.A !== undefined) weightSum += wA;
  if (scores.B !== undefined) weightSum += wB;
  if (scores.C !== undefined) weightSum += wC;
  if (scores.D !== undefined) weightSum += wD;
  if (scores.E !== undefined) weightSum += wE;
  if (scores.F !== undefined) weightSum += wF;
  if (scores.G !== undefined) weightSum += wG;
  if (scores.H !== undefined) weightSum += wH;
  if (scores.I !== undefined) weightSum += wI;

  // Normalize weights if the sum is not 1 and normalization is enabled
  let normalizedWeights = weights;

  if (config.normalizeWeights && weightSum !== 1) {
    normalizedWeights = {
      original: scores.original !== undefined ? wOriginal / weightSum : 0,
      A: scores.A !== undefined ? wA / weightSum : 0,
      B: scores.B !== undefined ? wB / weightSum : 0,
      C: scores.C !== undefined ? wC / weightSum : 0,
      D: scores.D !== undefined ? wD / weightSum : 0,
      E: scores.E !== undefined ? wE / weightSum : 0,
      F: scores.F !== undefined ? wF / weightSum : 0,
      G: scores.G !== undefined ? wG / weightSum : 0,
      H: scores.H !== undefined ? wH / weightSum : 0,
      I: scores.I !== undefined ? wI / weightSum : 0,
    };
  }

  // Calculate the weighted average for non-empty scores
  let finalScore = 0;
  if (scores.original !== undefined) finalScore += normalizedWeights.original * scores.original;
  if (scores.A !== undefined) finalScore += normalizedWeights.A * scores.A;
  if (scores.B !== undefined) finalScore += normalizedWeights.B * scores.B;
  if (scores.C !== undefined) finalScore += normalizedWeights.C * scores.C;
  if (scores.D !== undefined) finalScore += normalizedWeights.D * scores.D;
  if (scores.E !== undefined) finalScore += normalizedWeights.E * scores.E;
  if (scores.F !== undefined) finalScore += normalizedWeights.F * scores.F;
  if (scores.G !== undefined) finalScore += normalizedWeights.G * scores.G;
  if (scores.H !== undefined) finalScore += normalizedWeights.H * scores.H;
  if (scores.I !== undefined) finalScore += normalizedWeights.I * scores.I;

  return finalScore;
}

/*
 * Example usage
 * 
 * Scenario 1: All scores available
 * const scoresAllAvailable: Scores = {
 *   original: 0.8,       // Example original cosine similarity score
 *   A: 0.7,              // Example REQUIRES_SKILL - HAS_SKILL match score
 *   B: 0.6,              // Example REQUIRES_SKILL - HAS_SOFT_SKILL match score
 *   C: 0.9,              // Example REQUIRES_QUALIFICATION - WORKED_AT match score
 *   D: 0.8,              // Example REQUIRES_QUALIFICATION - STUDIED_AT match score
 *   E: 0.75,             // Example REQUIRED_EDUCATION - STUDIED_AT match score
 *   F: 0.85,             // Example REQUIRED_CERTIFICATION - HAS_CERTIFICATION match score
 *   G: 0.6,              // Example PREFERS_SKILL - HAS_SOFT_SKILL match score
 *   H: 0.7,              // Example REQUIRES_QUALIFICATION - HAS_INDUSTRY_EXPERIENCE match score
 *   I: 0.65              // Example SUITABLE_FOR_ROLE - HAS_POTENTIAL_ROLE match score
 * };
 *
 * // Call the function with default weights and configuration
 * const finalScoreAllAvailable = calculateEnhancedScore(scoresAllAvailable);
 *
 * // Scenario 2: All scores available with custom weights
 * const customWeights: Weights = {
 *   original: 0.6,
 *   A: 0.15,
 *   B: 0.1,
 *   C: 0.25,
 *   D: 0.2,
 *   E: 0.3,
 *   F: 0.2,
 *   G: 0.05,
 *   H: 0.1,
 *   I: 0.05
 * };
 * const finalScoreAllAvailableCustomWeights = calculateEnhancedScore(scoresAllAvailable, customWeights);
 *
 * // Scenario 3: Some scores missing
 * const scoresSomeMissing: Partial<Scores> = {
 *   original: 0.8,       // Example original cosine similarity score
 *   A: 0.7,              // Example REQUIRES_SKILL - HAS_SKILL match score
 *   // B score missing
 *   C: 0.9,              // Example REQUIRES_QUALIFICATION - WORKED_AT match score
 *   // D score missing
 *   E: 0.75,             // Example REQUIRED_EDUCATION - STUDIED_AT match score
 *   F: 0.85,             // Example REQUIRED_CERTIFICATION - HAS_CERTIFICATION match score
 *   G: 0.6,              // Example PREFERS_SKILL - HAS_SOFT_SKILL match score
 *   // H score missing
 *   I: 0.65              // Example SUITABLE_FOR_ROLE - HAS_POTENTIAL_ROLE match score
 * };
 *
 * // Call the function with default weights and configuration
 * const finalScoreSomeMissing = calculateEnhancedScore(scoresSomeMissing);
 *
 * // Call the function with custom weights and configuration
 * const customConfig: Config = {
 *   normalizeWeights: false
 * };
 * const finalScoreSomeMissingCustomConfig = calculateEnhancedScore(scoresSomeMissing, customWeights, customConfig);
 * */