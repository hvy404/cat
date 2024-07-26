"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { format } from 'date-fns';

type ApplicationStatus = 'submitted' | 'reviewed' | 'interview' | 'rejected' | 'accepted';

/**
 * Updates the status of an application in the database.
 *
 * @param applicationId - The ID of the application to update.
 * @param newStatus - The new status to set for the application.
 * @returns An object with a `success` boolean, a `message` string, and the updated application status.
 */
export async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const now = new Date();
    const formattedDate = format(now, "yyyy-MM-dd HH:mm:ssXXX");

    const { error } = await supabase
      .from('applications')
      .update({ 
        status: newStatus, 
        updated_at: formattedDate
      })
      .eq('id', applicationId);

    if (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }

    return { success: true, message: `Application status updated to ${newStatus}` };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { success: false, message: 'Failed to update application status' };
  }
}

/**
 * Retrieves the status of an application from the database.
 *
 * @param applicationId - The ID of the application to retrieve the status for.
 * @returns An object with a `success` boolean, a `message` string, and the current application status.
 */
export async function getApplicationStatus(applicationId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    if (error) {
      throw new Error(`Failed to retrieve application status: ${error.message}`);
    }

    if (!data) {
      return { success: false, message: 'Application not found', status: null };
    }

    return { success: true, message: 'Application status retrieved successfully', status: data.status as ApplicationStatus };
  } catch (error) {
    console.error('Error retrieving application status:', error);
    return { success: false, message: 'Failed to retrieve application status', status: null };
  }
}