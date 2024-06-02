/**
 * Queries the status of a job description being ran.
 * It can be used by a polling mechanism to check the status of a job description generation run.
 * A completed run will return the draft ID.
 * 
 * Input the runner ID to run to query. Runner ID is provided by the StartJDGeneration function.
 * This will return the ID of the generated JD draft when its available.
 * 
 * @param runId - The ID of the run to query.
 * @returns A Promise that resolves to the draft ID if the status is "Completed", or a string indicating the status or error message.
 */

"use server";
import { unstable_noStore as noStore } from "next/cache";



interface OutputData {
  draftID?: string;
  message?: string;
  success?: boolean;
}

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
  output?: OutputData;
}

interface EventMetadata {
  fetchedAt: string;
  cachedUntil?: string | null;
}

interface EventResponse {
  data: EventData[];
  metadata: EventMetadata;
}

export async function queryJDGeneratorStatus(runId: string): Promise<string | null> {
  noStore(); // Disable caching for this request

  const api_base = process.env.NODE_ENV === "production"
    ? "https://api.inngest.com"
    : "http://127.0.0.1:8288";
  const api_url = `${api_base}/v1/events/${runId}/runs`;

  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.INNGEST_API_KEY}`,
    },
  };

  try {
    const response = await fetch(api_url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: EventResponse = await response.json();

    if (data.data && data.data.length > 0) {
      const eventData = data.data[0];
      if (eventData.status === "Completed" && eventData.output && eventData.output.draftID) {
        return eventData.output.draftID; // Return draftID if status is "Completed"
      } else {
        return "Status not completed or draftID missing"; // Handle case where status is not completed or draftID is missing
      }
    } else {
      return "No data available"; // Return if no data is found
    }
  } catch (error) {
    console.error("Failed to fetch event status:", error);
    return "Error fetching data";
  }
}
