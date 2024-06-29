"use server";
import { initializeRedis } from "@/lib/redis/connect";
import { DetailedJobResult } from "@/app/(auth)/dashboard/views/candidate/search/job-utils";

interface JobSearchCacheProps {
  userId: string;
  searchQuery: string;
}

interface SetCacheProps extends JobSearchCacheProps {
  searchResults: DetailedJobResult[];
}

interface CachedSearchResult {
  timestamp: number;
  results: DetailedJobResult[];
}

const redis = initializeRedis();
const CACHE_EXPIRATION = 600;

function generateCacheKey(props: JobSearchCacheProps): string {
  const searchKey = props.searchQuery.toLowerCase().replace(/\s/g, "+");
  return `job-search:${props.userId}:${searchKey}`;
}

export async function getCache(props: JobSearchCacheProps): Promise<DetailedJobResult[] | null> {
  const cacheKey = generateCacheKey(props);
  const cachedResults = await redis.get<CachedSearchResult>(cacheKey);

  if (cachedResults) {
    // Check if the cache is still valid (less than 10 minutes old)
    if (Date.now() - cachedResults.timestamp < CACHE_EXPIRATION * 1000) {
      return cachedResults.results;
    }
  }

  return null;
}

export async function setCache(props: SetCacheProps): Promise<void> {
  const cacheKey = generateCacheKey(props);
  const newCacheEntry: CachedSearchResult = {
    timestamp: Date.now(),
    results: props.searchResults
  };

  await redis.set(cacheKey, newCacheEntry, {
    ex: CACHE_EXPIRATION
  });
}

export async function jobSearchCache(props: SetCacheProps): Promise<DetailedJobResult[]> {
  const cachedResults = await getCache(props);

  if (cachedResults) {
    return cachedResults;
  }

  // If no valid cache found, store the new results
  await setCache(props);

  return props.searchResults;
}

export async function clearJobSearchCache(userId: string): Promise<void> {
  const pattern = `job-search:${userId}:*`;
  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}