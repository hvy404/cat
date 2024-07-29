"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type Alert = {
  id: number;
  user_id: string;
  type: 'match' | 'invite' | 'application';
  message: string;
  created_at: string;
  read: boolean;
  reference_id: string;
};

// Check if a user has any unread alerts
export async function hasUnreadAlerts(userId: string): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { count, error } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error checking for unread alerts:', error);
    return false;
  }
}

// Get user alerts
export async function getUserAlerts(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { alerts: data as Alert[], error: null };
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    return { alerts: null, error: 'Failed to fetch alerts' };
  }
}

// Delete an alert
export async function deleteAlert(alertId: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', alertId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting alert:', error);
    return { success: false, error: 'Failed to delete alert' };
  }
}

// Mark an alert as read
export async function markAlertAsRead(alertId: number) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({ read: true })
      .eq('id', alertId)
      .select();

    if (error) throw error;
    return { alert: data[0] as Alert, error: null };
  } catch (error) {
    console.error('Error marking alert as read:', error);
    return { alert: null, error: 'Failed to mark alert as read' };
  }
}

// Get detailed information based on alert type
export async function getAlertDetails(alert: Alert) {
  switch (alert.type) {
    case 'match':
      return getJobDetailsForMatch(alert.reference_id);
    case 'invite':
      return getInviteDetails(alert.reference_id);
    case 'application':
      return getApplicationDetails(alert.reference_id);
    default:
      return { error: 'Invalid alert type' };
  }
}

// Fetch job details for a match alert
async function getJobDetailsForMatch(jobId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('job_id, title, company_name, location, salary_range')
      .eq('job_id', jobId)
      .single();

    if (error) throw error;
    return { jobDetails: data, error: null };
  } catch (error) {
    console.error('Error fetching job details:', error);
    return { jobDetails: null, error: 'Failed to fetch job details' };
  }
}

// Fetch invite details
async function getInviteDetails(inviteId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('invites')
      .select(`
        id,
        job_id,
        employer_id,
        message,
        status,
        job_postings:job_id (title, company_name, location, salary_range),
        employers:employer_id (name, email)
      `)
      .eq('id', inviteId)
      .single();

    if (error) throw error;
    return { inviteDetails: data, error: null };
  } catch (error) {
    console.error('Error fetching invite details:', error);
    return { inviteDetails: null, error: 'Failed to fetch invite details' };
  }
}

// Fetch application details
async function getApplicationDetails(applicationId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        job_id,
        status,
        applied_at,
        job_postings(title, company_name, location)
      `)
      .eq('id', applicationId)
      .single();

    if (error) throw error;
    return { applicationDetails: data, error: null };
  } catch (error) {
    console.error('Error fetching application details:', error);
    return { applicationDetails: null, error: 'Failed to fetch application details' };
  }
}