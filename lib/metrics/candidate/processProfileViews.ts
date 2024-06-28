"use server";

import { initializeRedis } from "@/lib/redis/connect";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const redis = initializeRedis();
const cookiesStore = cookies();
const supabase = createClient(cookiesStore);

/**
 * Processes profile views by fetching a batch of profile views from a queue,
 * removing the processed items from the queue, and inserting the batch into the database.
 * This function runs indefinitely until there are no more profile views in the queue.
 */
async function processProfileViews() {
  while (true) {
    // Fetch a batch of profile views from the queue
    const viewsBatch = await redis.lrange("profile_views_queue", 0, 9);
    if (viewsBatch.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }

    // Remove the processed items from the queue
    await redis.ltrim("profile_views_queue", viewsBatch.length, -1);

    // Insert the batch into the database
    const viewsData = viewsBatch.map((view) => JSON.parse(view));
    const { error } = await supabase
      .from("candidate_profile_views")
      .insert(viewsData);

    if (error) {
      console.error("Error inserting profile views:", error.message);
    }
  }
}

processProfileViews().catch(console.error);
