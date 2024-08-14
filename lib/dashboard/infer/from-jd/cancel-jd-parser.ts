"use server";
import { inngest } from "@/lib/inngest/client";

/**
 * This function cancels an ongoing job description generation process.
 * Provide the processId of the JD generation process you want to cancel.
 *
 * @param {object} options - The options for canceling the JD generation process.
 * @param {string} options.processId - The processId of the JD generation to cancel.
 * @returns {object} - The result of the cancellation attempt.
 */

interface CancelJDParser {
  processId: string;
}

export async function CancelJDParser({ processId }: CancelJDParser) {
  try {
    const { ids } = await inngest.send({
      name: "app/job-description-parser-cancel",
      data: {
        processId: processId,
      },
    });

    return {
      success: true,
      message: "Cancellation request sent successfully",
      id: ids[0], // This is the event ID of the cancellation request
    };
  } catch (error) {
    console.error("Error sending cancellation request", error);
    throw new Error("Error sending cancellation request");
  }
}
