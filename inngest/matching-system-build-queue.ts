import { inngest } from "@/lib/inngest/client";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { addJobsToQueue } from "@/lib/engine/match-queue-redis-jobs";

export const buildMatchingQueue = inngest.createFunction(
  { id: "matching-system-build-queue" },
  { event: "app/matching-system-rebuild-queue" },
  async ({ event, step }) => {
    const supabase = createClient(cookies());

    const { data: activeJobs, error } = await supabase
      .from("job_postings")
      .select("jd_id, employer_id")
      .eq("active", true);

    if (error) {
      console.error("Error fetching active job postings:", error);
      throw new Error("Failed to fetch active job postings");
    }

    const activeJobData = activeJobs.map((job) => ({
      jd_id: job.jd_id,
      employer_id: job.employer_id,
    }));

    try {
      await addJobsToQueue(activeJobData);
      console.log("Successfully added jobs to queue");
    } catch (error) {
      console.error("Error adding jobs to queue:", error);
      throw new Error("Failed to add jobs to queue");
    }

    // return here
    return {
      success: true,
      message: "Successfully retrieved active job IDs",
      activeJobData: activeJobData,
    };
  }
);
