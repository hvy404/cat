"use server";

import { initializeRedis } from "@/lib/redis/connect";

const redis = initializeRedis();

export interface RecordProfileViewParams {
  candidateId: string;
  viewerIp: string;
}

/**
 * Records a profile view for a candidate.
 *
 * @param {RecordProfileViewParams} params - The parameters for recording the profile view.
 * @param {string} params.candidateId - The ID of the candidate whose profile is being viewed.
 * @param {string} params.viewerIp - The IP address of the viewer.
 * @returns {Promise<void>} - A promise that resolves when the profile view is recorded.
 */
export async function recordProfileView({
  candidateId,
  viewerIp,
}: RecordProfileViewParams) {
  await redis.lpush(
    "profile_views_queue",
    JSON.stringify({ candidateId, viewerIp })
  );
}
