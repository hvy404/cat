type Scores = {
    original: number;    // The original cosine similarity score
    skill: number;       // Score for HAS_SKILL match
    softSkill: number;   // Score for HAS_SOFT_SKILL match
    qualification: number; // Score for WORKED_AT match
  };
  
  type Weights = {
    original: number;    // Weight for the original cosine similarity score
    skill: number;       // Weight for HAS_SKILL match
    softSkill: number;   // Weight for HAS_SOFT_SKILL match
    qualification: number; // Weight for WORKED_AT match
  };
  
  type Config = {
    normalizeWeights: boolean; // Flag to normalize weights if they do not sum to 1
  };
  
  // Default weights and configuration
  // Can not exceed 1
  const defaultWeights: Weights = {
    original: 0.5,       // Higher weight for original cosine similarity
    skill: 0.3,          // Significant weight for HAS_SKILL match
    softSkill: 0.1,      // Lower weight for HAS_SOFT_SKILL match
    qualification: 0.1   // Lower weight for WORKED_AT match
  };
  
  const defaultConfig: Config = {
    normalizeWeights: true // Enable normalization by default
  };
  
  /**
   * Validates the scores to ensure they are within the valid range (0 to 1).
   *
   * @param scores - The scores object to validate.
   */
  function validateScores(scores: Scores): void {
    if (scores.original < 0 || scores.original > 1) {
      throw new Error('Score original is out of range. It should be between 0 and 1.');
    }
    if (scores.skill < 0 || scores.skill > 1) {
      throw new Error('Score skill is out of range. It should be between 0 and 1.');
    }
    if (scores.softSkill < 0 || scores.softSkill > 1) {
      throw new Error('Score softSkill is out of range. It should be between 0 and 1.');
    }
    if (scores.qualification < 0 || scores.qualification > 1) {
      throw new Error('Score qualification is out of range. It should be between 0 and 1.');
    }
  }
  
  /**
   * Validates the weights to ensure they are non-negative.
   *
   * @param weights - The weights object to validate.
   */
  function validateWeights(weights: Weights): void {
    if (weights.original < 0) {
      throw new Error('Weight original is invalid. It should be non-negative.');
    }
    if (weights.skill < 0) {
      throw new Error('Weight skill is invalid. It should be non-negative.');
    }
    if (weights.softSkill < 0) {
      throw new Error('Weight softSkill is invalid. It should be non-negative.');
    }
    if (weights.qualification < 0) {
      throw new Error('Weight qualification is invalid. It should be non-negative.');
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
  function calculateEnhancedScore(
    scores: Scores,
    weights: Weights = defaultWeights,
    config: Config = defaultConfig
  ): number {
    // Validate the scores and weights
    validateScores(scores);
    validateWeights(weights);
  
    // Destructure the scores and weights for easier access
    const { original, skill, softSkill, qualification } = scores;
    const {
      original: wOriginal,
      skill: wSkill,
      softSkill: wSoftSkill,
      qualification: wQualification,
    } = weights;
  
    // Calculate the sum of the weights
    const weightSum = wOriginal + wSkill + wSoftSkill + wQualification;
  
    // Normalize weights if the sum is not 1 and normalization is enabled
    let normalizedWOriginal = wOriginal;
    let normalizedWSkill = wSkill;
    let normalizedWSoftSkill = wSoftSkill;
    let normalizedWQualification = wQualification;
  
    if (config.normalizeWeights && weightSum !== 1) {
      normalizedWOriginal = wOriginal / weightSum;
      normalizedWSkill = wSkill / weightSum;
      normalizedWSoftSkill = wSoftSkill / weightSum;
      normalizedWQualification = wQualification / weightSum;
    }
  
    // Calculate the weighted average
    const finalScore =
      normalizedWOriginal * original +
      normalizedWSkill * skill +
      normalizedWSoftSkill * softSkill +
      normalizedWQualification * qualification;
  
    return finalScore;
  }

/*
 * Example usage
 * const scores: Scores = {
 *   original: 0.8,       // Example original cosine similarity score
 *   skill: 0.7,          // Example HAS_SKILL match score
 *   softSkill: 0.6,      // Example HAS_SOFT_SKILL match score
 *   qualification: 0.9   // Example WORKED_AT match score
 * };
 *
 * Call: const finalScore = calculateEnhancedScore(scores);
 * */
