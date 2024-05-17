"use server";
import { initializeRedis } from "@/lib/redis/connect";

const redis = initializeRedis();

/**
 * Sets the process status for a given session ID.
 * @param sessionID - The ID of the session.
 * @param inProcess - A boolean indicating whether the session is in process or not.
 * @returns An object indicating the success status of the operation.
 */
export async function jdSetProcessStatus(
  userId: string,
  sessionID: string,
  inProcess: boolean
) {
  // Session key
  let user = userId;
  let sessionKey = sessionID;
  let step = ":ingest-jd:";
  let key = user + step + sessionKey;


  // Entry expires in 24 hours
  await redis.setex(key, 86400, inProcess);

  return { success: true };
}

/**
 * Retrieves the processing status of a job description (JD) ingestion session.
 * @param sessionID - The ID of the JD ingestion session.
 * @returns An object containing the readiness status of the session.
 */
export async function jdGetProcessStatus(userId: string, sessionID: string) {
  // Session key
  let user = userId;
  let sessionKey = sessionID;
  let step = ":ingest-jd:";
  let key = user + step + sessionKey;

  // Get the session ID from the Redis store
  const ready = await redis.get(key);
  console.log(ready);

  // Return the ready
  return {
    proccessing: ready,
  };
}
