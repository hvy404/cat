/**
 * Verifies the submitted OTP for a candidate.
 * @param userId - The ID of the candidate.
 * @param submittedOtp - The OTP submitted by the candidate.
 * @param actionType - The type of action for which the OTP was generated.
 * @param timestamp - The timestamp when the OTP was generated.
 * @returns An object indicating whether the OTP is valid or not, along with an optional error message.
 */

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { generateCandidateOtp } from "@/mod/otp/candidate-generate-otp";

export async function verifyOtp(
  userId: string,
  submittedOtp: string,
  actionType: string,
  timestamp: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Generate OTP for the current interval and also for the previous interval to allow some leeway
  const currentInterval = Math.floor(Number(timestamp) / (300000 * 2));
  const previousInterval = currentInterval - 1;

  const currentOtp = generateCandidateOtp(userId, currentInterval.toString());
  const previousOtp = generateCandidateOtp(userId, previousInterval.toString());

  const { data, error } = await supabase
    .from("candidates_otp")
    .select("expires_at")
    .eq("candidate_uuid", userId)
    .eq("action_type", actionType)
    .single();

  if (error) {
    return { valid: false, error: error.message };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "OTP has expired." };
  }

  // Check if either the current or previous OTP matches the submitted OTP
  return { valid: submittedOtp === currentOtp || submittedOtp === previousOtp };
}
