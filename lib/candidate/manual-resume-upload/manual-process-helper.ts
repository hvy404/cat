"use server";
import { inngest } from "@/lib/inngest/client";

/**
 * Starts the manual resume process for the specified candidate.
 *
 * @param candidateId - The ID of the candidate to start the manual resume process for.
 * @returns An object containing the run ID of the initiated process.
 */
export const startManualResumeProcess = async (candidateId: string) => {
  const event = await inngest.send({
    name: "app/manual-resume-enrich",
    data: { candidateId: candidateId },
  });

  return { runId: event.ids };
};
