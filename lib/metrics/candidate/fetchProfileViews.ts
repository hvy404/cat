"use server";

import { initializeRedis } from "@/lib/redis/connect";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const redis = initializeRedis();
const cookiesStore = cookies();
const supabase = createClient(cookiesStore);

export async function fetchProfileViews(candidateId: string): Promise<number> {
  // Check Redis cache first
  const cachedViews: string | null = await redis.get(`profile_views:${candidateId}`);
  
  if (cachedViews) {
    return parseInt(cachedViews, 10);
  }

  // Fallback to database query if cache miss
  const { data, error } = await supabase
    .from("candidate_profile_views")
    .select("*", { count: "exact" })
    .eq("candidate_id", candidateId);

  if (error) {
    throw new Error(error.message);
  }

  const count = data.length;
  // Store the count in Redis with an expiration time
  await redis.set(`profile_views:${candidateId}`, count.toString(), { ex: 3600 });

  return count;
}
