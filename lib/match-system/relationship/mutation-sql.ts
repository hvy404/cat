"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// Type definitions
export type Match = {
  id: string;
  job_id: string;
  candidate_id: string;
  match_score: number;
  created_at?: string;
  updated_at?: string;
};

export type Invite = {
  id: string;
  employer_id: string;
  candidate_id: string;
  job_id: string;
  status: "sent" | "viewed" | "accepted" | "declined";
  created_at?: string;
  updated_at?: string;
};

export type Application = {
  id: string;
  candidate_id: string;
  job_id: string;
  resume_id: string; // New field
  status: "submitted" | "reviewed" | "interview" | "rejected" | "accepted";
  created_at?: string;
  updated_at?: string;
};

export type Alert = {
  id: string;
  user_id: string;
  type: "match" | "invite" | "application";
  reference_id: string;
  status: "unread" | "read";
  created_at?: string;
};

// Helper function to create Supabase client
function getSupabaseClient() {
  const cookieStore = cookies();
  return createClient(cookieStore);
}

// Match CRUD operations
export async function createMatch(
  matchData: Omit<Match, "id" | "created_at" | "updated_at">
): Promise<Match | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .insert(matchData)
    .select()
    .single();

  if (error) {
    console.error("Error creating match:", error);
    return null;
  }
  return data;
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .select()
    .eq("id", matchId)
    .single();

  if (error) {
    console.error("Error fetching match:", error);
    return null;
  }
  return data;
}

export async function updateMatch(
  matchId: string,
  updateData: Partial<Match>
): Promise<Match | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .update(updateData)
    .eq("id", matchId)
    .select()
    .single();

  if (error) {
    console.error("Error updating match:", error);
    return null;
  }
  return data;
}

export async function deleteMatch(matchId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);

  if (error) {
    console.error("Error deleting match:", error);
    return false;
  }
  return true;
}

// Invite CRUD operations
export async function createInvite(
  inviteData: Omit<Invite, "id" | "created_at" | "updated_at">
): Promise<Invite | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .insert(inviteData)
    .select()
    .single();

  if (error) {
    console.error("Error creating invite:", error);
    return null;
  }
  return data;
}

export async function getInvite(inviteId: string): Promise<Invite | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .select()
    .eq("id", inviteId)
    .single();

  if (error) {
    console.error("Error fetching invite:", error);
    return null;
  }
  return data;
}

export async function updateInvite(
  inviteId: string,
  updateData: Partial<Invite>
): Promise<Invite | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .update(updateData)
    .eq("id", inviteId)
    .select()
    .single();

  if (error) {
    console.error("Error updating invite:", error);
    return null;
  }
  return data;
}

export async function deleteInvite(inviteId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("invites").delete().eq("id", inviteId);

  if (error) {
    console.error("Error deleting invite:", error);
    return false;
  }
  return true;
}

// Application CRUD operations
export async function createApplication(
  applicationData: Omit<Application, "id" | "created_at" | "updated_at">
): Promise<Application | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .insert(applicationData)
    .select()
    .single();

  if (error) {
    console.error("Error creating application:", error);
    return null;
  }
  return data;
}

export async function getApplication(
  applicationId: string
): Promise<Application | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select()
    .eq("id", applicationId)
    .single();

  if (error) {
    console.error("Error fetching application:", error);
    return null;
  }
  return data;
}

export async function updateApplication(
  applicationId: string,
  updateData: Partial<Application>
): Promise<Application | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .update(updateData)
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    console.error("Error updating application:", error);
    return null;
  }
  return data;
}

export async function deleteApplication(
  applicationId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId);

  if (error) {
    console.error("Error deleting application:", error);
    return false;
  }
  return true;
}

// Alert CRUD operations
export async function createAlert(
  alertData: Omit<Alert, "id" | "created_at">
): Promise<Alert | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .insert(alertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating alert:", error);
    return null;
  }
  return data;
}

export async function getAlert(alertId: string): Promise<Alert | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .select()
    .eq("id", alertId)
    .single();

  if (error) {
    console.error("Error fetching alert:", error);
    return null;
  }
  return data;
}

export async function updateAlert(
  alertId: string,
  updateData: Partial<Alert>
): Promise<Alert | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .update(updateData)
    .eq("id", alertId)
    .select()
    .single();

  if (error) {
    console.error("Error updating alert:", error);
    return null;
  }
  return data;
}

export async function deleteAlert(alertId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("alerts").delete().eq("id", alertId);

  if (error) {
    console.error("Error deleting alert:", error);
    return false;
  }
  return true;
}

// Utility functions
export async function getMatchesByJob(jobId: string): Promise<Match[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .select()
    .eq("job_id", jobId);

  if (error) {
    console.error("Error fetching matches by job:", error);
    return [];
  }
  return data || [];
}

export async function getMatchesByCandidate(
  candidateId: string
): Promise<Match[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("matches")
    .select()
    .eq("candidate_id", candidateId);

  if (error) {
    console.error("Error fetching matches by candidate:", error);
    return [];
  }
  return data || [];
}

export async function getInvitesByEmployer(
  employerId: string
): Promise<Invite[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .select()
    .eq("employer_id", employerId);

  if (error) {
    console.error("Error fetching invites by employer:", error);
    return [];
  }
  return data || [];
}

export async function getInvitesByCandidate(
  candidateId: string
): Promise<Invite[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("invites")
    .select()
    .eq("candidate_id", candidateId);

  if (error) {
    console.error("Error fetching invites by candidate:", error);
    return [];
  }
  return data || [];
}

export async function getApplicationsByJob(
  jobId: string
): Promise<Application[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select()
    .eq("job_id", jobId);

  if (error) {
    console.error("Error fetching applications by job:", error);
    return [];
  }
  return data || [];
}

export async function getApplicationsByCandidate(
  candidateId: string
): Promise<Application[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select()
    .eq("candidate_id", candidateId);

  if (error) {
    console.error("Error fetching applications by candidate:", error);
    return [];
  }
  return data || [];
}

export async function getAlertsByUser(userId: string): Promise<Alert[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("alerts")
    .select()
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching alerts by user:", error);
    return [];
  }
  return data || [];
}
