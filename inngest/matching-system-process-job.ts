/**
 * Processes the job queue in batches, sending an event to trigger the function again if there are more jobs to process.
 *
 * @param event - The event that triggered the function.
 * @param step - The step object provided by Inngest.
 * @returns An object with the number of jobs processed in the batch.
 */
import { inngest } from "@/lib/inngest/client";
import { processNextJob } from "@/lib/engine/match-queue-redis-jobs";

export const processJobQueue = inngest.createFunction(
  { id: "process-job-queue" },
  { event: "app/process-job-queue" },
  async ({ event, step }) => {
    const batchSize = 100;
    let processedCount = 0;

    for (let i = 0; i < batchSize; i++) {
      const jobId = await processNextJob();
      if (!jobId) {
        break; // Queue is empty
      }
      processedCount++;
    }

    if (processedCount === batchSize) {
      // There might be more jobs, trigger the function again
      await step.sendEvent("app/process-job-queue", {
        name: "app/process-job-queue",
        data: {},
      });
    }

    return { processedCount };
  }
);
