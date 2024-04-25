/**
 * Stores a candidate OTP request in the database.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} actionType - The type of action for the OTP request.
 * @returns {Promise<{ data: any, error: any, timestamp: number }>} - The result of the operation, including the stored data, any error that occurred, and the timestamp of the request.
 */

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function storeCandidateOtpRequest(
  userId: string,
  actionType: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const timestamp = Date.now();
  // Calculate an interval index if your verification logic needs it
  const interval = Math.floor(timestamp / (300000 * 2)); // Assuming a 10-minute interval base for your OTP system
  const expiresAt = new Date(timestamp + 20 * 60000); // Set expiration to 20 minutes to match your OTP generation logic

  const { data, error } = await supabase.from("candidates_otp").insert([
    {
      candidate_uuid: userId,
      action_type: actionType,
      expires_at: expiresAt, // More explicit declaration of the expiration date
    },
  ]);

  return {
    data,
    error,
    timestamp: interval, // Return the interval index if your verification function uses it
  };
}
