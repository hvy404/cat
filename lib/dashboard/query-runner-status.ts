"use server";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Retrieves the status of a query event run.
 * Returns the status of the event run: "Running", "Completed", "Failed", "Cancelled".
 * @param runId - The ID of the query event run.
 * @returns A Promise that resolves to a string representing the status of the event run.
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
}

interface EventMetadata {
  fetchedAt: string;
  cachedUntil?: string | null;
}

interface EventResponse {
  data: EventData[];
  metadata: EventMetadata;
}

export async function QueryEventStatus(runId: string): Promise<string> {
  noStore(); // Ensure the API is not cached under any circumstances

  const api_base = process.env.NODE_ENV === "production"
    ? "https://api.inngest.com"
    : "http://127.0.0.1:8288";
  const api_url = `${api_base}/v1/events/${runId}/runs`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.INNGEST_API_KEY}`, // Ensure space after 'Bearer'
    },
  };

  try {
    const response = await fetch(api_url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); // Throw if response is not OK
    }
    const data: EventResponse = await response.json(); // Parse and assert to EventResponse
    //console.log("Querying Status", data);

    // Check if data has entries and return the status of the event
    if (data.data && data.data.length > 0) {
      return data.data[0].status; // Return only the status
    } else {
      return "No data"; // Return no data string if data array is empty
    }
  } catch (error) {
    console.error("Failed to fetch event status:", error);
    return "Error fetching data"; // Return error string directly
  }
}
