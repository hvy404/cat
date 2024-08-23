import { inngest } from "@/lib/inngest/client";
import { referenceFunction } from "inngest";
import { type buildMatchingQueue } from "@/inngest/matching-system-build-queue";
import { type processJobQueue } from "@/inngest/matching-system-process-job";

export const matchingSystemOrchestrator = inngest.createFunction(
  { id: "matching-system-orchestrator" },
  { cron: "0 0 * * *" }, // Runs daily at midnight
  async ({ step }) => {
    // Step 1: Build the matching queue
    const buildQueueResult = await step.invoke("build-matching-queue", {
      function: referenceFunction<typeof buildMatchingQueue>({
        functionId: "matching-system-build-queue",
      }),
      data: {},
    });

    if (!buildQueueResult.success) {
      throw new Error("Failed to build matching queue");
    }

    // Step 2: Process the job queue
    const processQueueResult = await step.invoke("process-job-queue", {
      function: referenceFunction<typeof processJobQueue>({
        functionId: "process-job-queue",
      }),
      data: {},
    });

    return {
      message: "Matching system workflow completed successfully",
      queueBuildResult: buildQueueResult,
      queueProcessResult: processQueueResult,
    };
  }
);
