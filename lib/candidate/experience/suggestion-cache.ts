"use server";
import { initializeRedis } from "@/lib/redis/connect";

const redis = initializeRedis();

export async function experienceSuggestionCacheStore(
  workExperienceAnalysisSession: string,
  candidateId: string,
  result: string
) {
  const key = `experience_suggestion:${workExperienceAnalysisSession}:${candidateId}`;
  await redis.setex(key, 86400, result); // Cache for 24 hours
}

export async function getExperienceSuggestionCache(
  workExperienceAnalysisSession: string,
  candidateId: string
): Promise<string | null> {
  const key = `experience_suggestion${workExperienceAnalysisSession}:${candidateId}`;
  return await redis.get(key);
}
