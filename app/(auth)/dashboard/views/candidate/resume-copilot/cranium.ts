"use server";
import { initializeRedis } from "@/lib/redis/connect";
import { Item } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/types";

const CACHE_TTL = 300; // 5 minutes in seconds

export default async function cranium(
  sessionId: string,
  userId: string,
  items: Record<string, Item[]>
) {
  const redis = initializeRedis();
  const cacheKey = `cranium:${userId}:${sessionId}:items`;

  // Store the items as raw JSON
  await redis.set(cacheKey, JSON.stringify(items), { ex: CACHE_TTL });

  return { success: true, message: "Items stored successfully as raw JSON" };
}
