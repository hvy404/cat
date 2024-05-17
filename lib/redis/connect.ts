import { Redis } from "@upstash/redis";

// Initialize Redis connection
export const initializeRedis = () => {

  const redis = new Redis({
    url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_URL!,
    token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_TOKEN!,
  })

  return redis;
};
