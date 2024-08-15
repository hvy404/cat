"use server";
import { unstable_noStore as noStore } from "next/cache";

interface EventData {
  run_id: string;
  run_started_at: string;
  function_id: string;
  function_version: number;
  environment_id: string;
  event_id?: string;
  status: string;
  ended_at?: string;
  output?: {
    message?: string;
  };
}

interface EventMetadata {
  fetched_at: string;
  cached_until?: string;
}

interface EventResponse {
  data: EventData[];
  metadata: EventMetadata;
}

export async function QueryWorkerStatus(
  runId: string
): Promise<{ status: string; message?: string }> {
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
    console.log("URL Called: ", api_url);
    
    if (!response.ok) {
      console.error(`HTTP API error! status: ${response.status}`);
      console.error("Response headers:", Object.fromEntries(response.headers.entries()));
      const errorBody = await response.text();
      console.error("Error body:", errorBody);
      throw new Error(`HTTP API error! status: ${response.status}`);
    }

    const data: EventResponse = await response.json();

    if (data.data && data.data.length > 0) {
      const firstEvent = data.data[0];
      const status = firstEvent.status.toLowerCase();
      
      switch (status) {
        case "completed":
        case "running":
        case "failed":
        case "cancelled":
          return { 
            status, 
            message: firstEvent.output?.message 
          };
        default:
          return { status: "unknown" };
      }
    } else {
      return { status: "no data" };
    }
  } catch (error) {
    console.error("Failed to fetch event status:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    return { status: "error", message: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}