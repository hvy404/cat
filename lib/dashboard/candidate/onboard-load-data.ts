"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface CandidateData {
  static: Record<string, unknown>;
  inferred: Record<string, unknown>;
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

    console.log("Combined data set:", combinedDataSet);

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
