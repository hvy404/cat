"use server";
import { inngest } from "@/lib/inngest/client";

export const startManualResumeProcess = async (candidateId: string) => {
  const event = await inngest.send({
    name: "app/manual-resume-enrich",
    data: { candidateId: candidateId },
  });

  console.log("ID:", event.ids);

  return { runId: event.ids };
};
