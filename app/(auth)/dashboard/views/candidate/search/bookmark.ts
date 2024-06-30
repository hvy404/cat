"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { initializeRedis } from "@/lib/redis/connect"; // upstash/redis client

// Define the expected shape of the insert response
interface InsertResponse {
  success: boolean;
  data?: CandidateJobBookmark | null;
  error?: Error | null;
}

// Define the expected shape of the delete response
interface DeleteResponse {
  success: boolean;
  error?: Error | null;
}

const BOOKMARK_CACHE_TTL = 300; // 5 minutes in seconds

/**
 * Invalidates the cached bookmarked jobs for a candidate.
 *
 * @param candidateId - The ID of the candidate.
 */
async function invalidateBookmarkedJobsCache(
  candidateId: string
): Promise<void> {
  const redis = initializeRedis();
  const cacheKey = `bookmarked_jobs:${candidateId}`;
  await redis.del(cacheKey);
}

/**
 * Adds a bookmark for a candidate's job and updates the cache.
 *
 * @param candidateId - The ID of the candidate.
 * @param jobId - The ID of the job.
 * @returns A promise that resolves to an `InsertResponse` object.
 */
export async function addCandidateJobBookmark(
  candidateId: string,
  jobId: string
): Promise<InsertResponse> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const redis = initializeRedis();

    // Validate input
    if (!candidateId || !jobId) {
      throw new Error("Candidate ID and Job ID are required");
    }

    const { data, error } = await supabase
      .from("candidate_job_bookmarks")
      .insert({ candidate_id: candidateId, job_id: jobId })
      .select()
      .single();

    if (error) throw error;

    // Update individual bookmark cache
    const bookmarkCacheKey = `bookmark:${candidateId}:${jobId}`;
    await redis.set(bookmarkCacheKey, "true", { ex: BOOKMARK_CACHE_TTL });

    // Invalidate the cached list of bookmarked jobs
    await invalidateBookmarkedJobsCache(candidateId);

    // Return success response
    return { success: true, data };
  } catch (error) {
    console.error("Error adding candidate job bookmark:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Removes a candidate's job bookmark from the database and updates the cache.
 *
 * @param candidateId - The ID of the candidate.
 * @param jobId - The ID of the job.
 * @returns A Promise that resolves to a DeleteResponse object indicating the success or failure of the operation.
 */
export async function removeCandidateJobBookmark(
  candidateId: string,
  jobId: string
): Promise<DeleteResponse> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const redis = initializeRedis();

    // Validate input
    if (!candidateId || !jobId) {
      throw new Error("Candidate ID and Job ID are required");
    }

    const { error } = await supabase
      .from("candidate_job_bookmarks")
      .delete()
      .match({ candidate_id: candidateId, job_id: jobId });

    if (error) throw error;

    // Update individual bookmark cache
    const bookmarkCacheKey = `bookmark:${candidateId}:${jobId}`;
    await redis.set(bookmarkCacheKey, "false", { ex: BOOKMARK_CACHE_TTL });

    // Invalidate the cached list of bookmarked jobs
    await invalidateBookmarkedJobsCache(candidateId);

    // Return success response
    return { success: true };
  } catch (error) {
    console.error("Error removing candidate job bookmark:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Checks if a bookmark exists for a candidate's job, using Upstash Redis cache.
 *
 * @param candidateId - The ID of the candidate.
 * @param jobId - The ID of the job.
 * @returns A promise that resolves to a boolean indicating whether the bookmark exists.
 */
export async function checkCandidateJobBookmarkExists(
  candidateId: string,
  jobId: string
): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const redis = initializeRedis();

    // Create a unique cache key
    const cacheKey = `bookmark:${candidateId}:${jobId}`;

    // Check Redis cache first
    const cachedResult = await redis.get<boolean>(cacheKey);

    if (cachedResult !== null) {
      return cachedResult;
    }

    // If not in cache, query Supabase
    const { data, error } = await supabase
      .from("candidate_job_bookmarks")
      .select()
      .eq("candidate_id", candidateId)
      .eq("job_id", jobId);

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    // Check if any rows were returned
    const bookmarkExists = data && data.length > 0;

    // Cache the result for future queries
    await redis.set(cacheKey, bookmarkExists, { ex: BOOKMARK_CACHE_TTL });

    return bookmarkExists;
  } catch (error) {
    console.error("Error checking candidate job bookmark:", error);
    // In case of an error, we assume the bookmark doesn't exist
    return false;
  }
}

// Define the expected shape of the fetch response
export interface CandidateJobBookmarkResponse {
  success: boolean;
  data?: CandidateJobBookmark[] | null;
  error?: Error | null;
}

export interface CandidateJobBookmark {
  title: string;
  jd_uuid: string;
}

/**
 * Gets all bookmarked jobs for a candidate from the database and updates the cache.
 *
 * @param candidateId - The ID of the candidate.
 * @returns A promise that resolves to a `CandidateJobBookmarkResponse` object.
 */
export async function getAllBookmarkedJobsForCandidate(
  candidateId: string
): Promise<CandidateJobBookmarkResponse> {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const redis = initializeRedis();

    // Validate input
    if (!candidateId) {
      throw new Error("Candidate ID is required");
    }

    const cacheKey = `bookmarked_jobs:${candidateId}`;

    // Check Redis cache first
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return { success: true, data: cachedResult as CandidateJobBookmark[] };
    }

    // If not in cache, query Supabase
    const { data, error } = await supabase
      .from("candidate_job_bookmarks")
      .select("job_postings(jd_uuid, title)")
      .eq("candidate_id", candidateId);

    if (error) {
      console.error("Supabase query error:", error);
      throw error;
    }

    const bookmarks = data.map((bookmark: any) => ({
      jd_uuid: bookmark.job_postings.jd_uuid,
      title: bookmark.job_postings.title,
    }));

    // Cache the result for future queries
    await redis.set(cacheKey, bookmarks, { ex: BOOKMARK_CACHE_TTL });

    return { success: true, data: bookmarks };
  } catch (error) {
    console.error("Error fetching bookmarked jobs for candidate:", error);
    return { success: false, error: error as Error };
  }
}
