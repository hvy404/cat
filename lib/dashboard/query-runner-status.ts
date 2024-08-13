"use server";
import { unstable_noStore as noStore } from "next/cache";

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
  noStore();

  console.log("Checking status in API...");

  const api_base =
    process.env.NODE_ENV === "production"
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
    console.log(`Fetching status for runId: ${runId}`);
    const response = await fetch(api_url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: EventResponse = await response.json();
    console.log("API Response:", JSON.stringify(data, null, 2));

    if (data.data && data.data.length > 0) {
      const status = data.data[0].status;
      if (["Running", "Completed", "Failed", "Cancelled"].includes(status)) {
        return status;
      } else {
        console.error("Unexpected status value:", status);
        return `Unexpected error`;
      }
    } else {
      console.error("No data in API response");
      return "No data";
    }
  } catch (error) {
    console.error("Failed to fetch event status:", error);
    return `Error`;
  }
}
