"use server";
import { initializeRedis } from "@/lib/redis/connect";

const redis = initializeRedis();

/**
 * Stores the result of work experience analysis session in the suggestion cache.
 * @param workExperienceAnalysisSession - The ID of the work experience analysis session.
 * @param candidateId - The ID of the candidate.
 * @param result - The result of the analysis session to be stored in the cache.
 */
export async function experienceSuggestionCacheStore(
  workExperienceAnalysisSession: string,
  candidateId: string,
  result: string
) {
  const key = `experience_suggestion:${candidateId}:${workExperienceAnalysisSession}`;
  await redis.setex(key, 86400, result); // Cache for 24 hours
}

/**
 * Retrieves the experience suggestion cache for a given work experience analysis session and candidate ID.
 * @param workExperienceAnalysisSession - The ID of the work experience analysis session.
 * @param candidateId - The ID of the candidate.
 * @returns A Promise that resolves to a string representing the experience suggestion cache, or null if it doesn't exist.
 */
export async function getExperienceSuggestionCache(
  workExperienceAnalysisSession: string,
  candidateId: string
): Promise<string | null> {
  const key = `experience_suggestion:${candidateId}:${workExperienceAnalysisSession}:`;
  return await redis.get(key);
}
