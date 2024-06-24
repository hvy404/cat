"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface CandidateData {
  static: Record<string, unknown>;
  inferred: Record<string, unknown>;
}

function remapClearanceLevel(level: string) {
  switch (level) {
    case "none":
      return "Unclassified";
    case "basic":
      return "Public Trust";
    case "confidential":
      return "Secret";
    case "critical":
      return "Top Secret";
    case "paramount":
      return "Top Secret/SCI";
    case "q_clearance":
      return "Q Clearance";
    case "l_clearance":
      return "L Clearance";
    default:
      return level;
  }
}

export async function fetchCandidatePreliminaryData(candidateId: string) {
  if (!candidateId) {
    console.error("Invalid candidateId provided");
    return { success: false, error: "Invalid candidateId" };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("candidate_resume")
      .select("static, inferred")
      .eq("user", candidateId);

    if (error) {
      console.error("Supabase query error:", error.message);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn(`No data found for candidateId: ${candidateId}`);
      return { success: false, error: "No data found" };
    }

    const combinedDataSet = data.map((item: CandidateData) => ({
      ...item.static,
      ...item.inferred,
    }));

    // clearance: .enum(["none", "basic", "confidential", "critical", "paramount", "q_clearance", "l_clearance"])
    // inside of combinedDataSet, we have clearance_level, I want to remap its value using remapClearanceLevela and merge it back into the combinedDataSet
    combinedDataSet.forEach((item: { clearance_level?: string | unknown }) => {
      if (item.clearance_level && typeof item.clearance_level === 'string') {
        item.clearance_level = remapClearanceLevel(item.clearance_level);
      } else {
        item.clearance_level = remapClearanceLevel('none');
      }
    });


    return {
      success: true,
      data: combinedDataSet,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
