"use server";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Retrieves the status of a query event run and returns the draftID if the run is completed.
 * Used in JD Role JD Generator to poll the status of a generation.
 * @param runId - The ID of the query event run.
 * @returns A Promise that resolves to a string representing either the status of the event run or the draftID if completed.
 */

interface EventData {
  run_id: string;
  run_started_at: string;
  function_id: string;
  function_version: number;
  environment_id: string;
  event_id?: string | null;
  batch_id?: string | null;
  original_run_id?: string | null;
  cron?: string | null;
  status: "Running" | "Completed" | "Failed" | "Cancelled";
  ended_at?: string | null;
  output?: {
    draftID?: string;
    message?: string;
    success?: boolean;
  };
}

interface EventMetadata {
  fetchedAt: string;
  cachedUntil?: string | null;
}

interface EventResponse {
  data: EventData[];
  metadata: EventMetadata;
}

export async function QueryJDGenerationStatus(
  runId: string
): Promise<{ status: string; jdID?: string }> {
  noStore(); // Ensure the API is not cached under any circumstances

  const api_base =
    process.env.NODE_ENV === "production"
      ? "https://api.inngest.com"
      : "http://127.0.0.1:8288";
  const api_url = `${api_base}/v1/events/${runId}/runs`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.INNGEST_SIGNING_KEY}`,
    },
  };

  try {
    const response = await fetch(api_url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: EventResponse = await response.json();

    if (data.data && data.data.length > 0) {
      const firstEvent = data.data[0];
      switch (firstEvent.status) {
        case "Completed":
          if (firstEvent.output?.draftID) {
            return { status: "Completed", jdID: firstEvent.output.draftID };
          } else {
            return { status: "Completed" };
          }
        case "Running":
          return { status: "Running" };
        case "Failed":
          return { status: "Failed" };
        case "Cancelled":
          return { status: "Cancelled" };
        default:
          return { status: "Unknown status" };
      }
    } else {
      return { status: "No data" };
    }
  } catch (error) {
    console.error("Failed to fetch event status:", error);
    return { status: "Error fetching data" };
  }
}