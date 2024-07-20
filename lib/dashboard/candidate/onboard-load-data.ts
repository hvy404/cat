"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface CandidateData {
  static: {
    name: string;
    email: string;
    phone: string;
    title?: string;
    location?: {
      city: string;
      state: string;
      zipcode: string;
    };
    education?: Array<{
      degree: string;
      end_date: string;
      start_date: string;
      institution: string;
    }>;
    work_experience?: Array<{
      end_date: string;
      job_title: string;
      start_date: string;
      organization: string;
      responsibilities: string;
    }>;
    technical_skills?: string[];
    professional_certifications?: Array<{
      name: string;
      issuing_organization?: string;
      date_obtained?: string;
      expiration_date?: string;
      credential_id?: string;
    }>;
    clearance_level?: string;
  };
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
      .from("candidate_create")
      .select("static")
      .eq("user", candidateId);

    if (error) {
      console.error("Supabase query error:", error.message);
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      console.warn(`No data found for candidateId: ${candidateId}`);
      return { success: false, error: "No data found" };
    }

    const cleanedDataset = data.map((item: CandidateData) => ({
      ...item.static,
      clearance_level: item.static.clearance_level
        ? remapClearanceLevel(item.static.clearance_level)
        : remapClearanceLevel("none"),
    }));

    return {
      success: true,
      data: cleanedDataset,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while fetching candidate data. Please try again later.",
    };
  }
}
