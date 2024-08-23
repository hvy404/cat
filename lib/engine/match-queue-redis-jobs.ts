"use server";
import { initializeRedis } from "@/lib/redis/connect";
import { Redis } from "@upstash/redis";

interface Job {
  jd_id: string;
  employer_id: string;
}

/**
 * Adds a list of jobs to the Redis queue for processing.
 *
 * @param activeJobs - An array of `Job` objects representing the jobs to be added to the queue.
 * @returns An object with `success` and `message` properties indicating whether the operation was successful and a message describing the result.
 */

export async function addJobsToQueue(
  activeJobs: Job[]
): Promise<{ success: boolean; message: string }> {
  const redis = (await initializeRedis()) as Redis;
  const pipeline = redis.pipeline();

  try {
    for (const job of activeJobs) {
      pipeline.hset(`job:${job.jd_id}`, {
        employer_id: job.employer_id,
        processed: "false",
      });
      pipeline.rpush("job_queue", job.jd_id);
    }

    await pipeline.exec();
    console.log(`Added ${activeJobs.length} jobs to the queue`);
    return {
      success: true,
      message: `Successfully added ${activeJobs.length} jobs to the queue`,
    };
  } catch (error) {
    console.error("Error adding jobs to queue:", error);
    return { success: false, message: "Failed to add jobs to queue" };
  }
}

/**
 * Processes the next job from the Redis queue.
 *
 * This function retrieves the next job ID from the "job_queue" Redis list, fetches the job data from the Redis hash, and then processes the job (e.g., retrieving embeddings and performing vector search). After processing the job, the job hash entry is deleted from Redis.
 *
 * @returns The job ID of the processed job, or `null` if there are no more jobs in the queue.
 */

export async function processNextJob(): Promise<string | null> {
  const redis = (await initializeRedis()) as Redis;
  const jobId = (await redis.lpop("job_queue")) as string | null;

  if (!jobId) {
    console.log("No more jobs in the queue");
    return null;
  }

  const jobData = await redis.hgetall<{
    employer_id: string;
    processed: string;
  }>(`job:${jobId}`);

  if (!jobData || !jobData.employer_id) {
    console.log(`Invalid job data for job ${jobId}`);
    return null;
  }

  // Process the job here (e.g., retrieve embeddings and perform vector search)
  console.log(`Processing job ${jobId} for employer ${jobData.employer_id}`);

  // Delete the job hash entry instead of updating its status
  await redis.del(`job:${jobId}`);

  return jobId;
}

/**
 * Processes all jobs in the Redis queue.
 * Be cautious of default timeouts if using Vercel, etc.
 *
 * This function repeatedly calls `processNextJob()` to process each job in the queue until there are no more jobs left. It logs the total number of jobs processed.
 */

export async function processAllJobs(): Promise<void> {
  let processedCount = 0;
  while (await processNextJob()) {
    processedCount++;
  }
  console.log(`Processed ${processedCount} jobs`);
}
