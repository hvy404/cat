/**
 * Verifies the submitted OTP for a candidate.
 * @param userId - The ID of the candidate.
 * @param submittedOtp - The OTP submitted by the candidate.
 * @param actionType - The type of action for which the OTP was generated.
 * //@param timestamp - The timestamp when the OTP was generated.
 * @returns An object indicating whether the OTP is valid or not, along with an optional error message.
 */

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CryptoJS from "crypto-js"; // Ensure you have CryptoJS for decryption
import { updateCandidateConfirmStatus } from "@/lib/candidate/canidate-update-confirm";

// Assuming this is your decryption function
export const decrypt = (ciphertext: string, secretKey: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export async function verifyOtp(
  userId: string,
  submittedOtp: string,
  actionType: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const secretKey = process.env.OTP_ENCRYPTION_KEY!;

  const { data, error } = await supabase
    .from("candidates_otp")
    .select("expires_at, otp_code")
    .eq("candidate_id", userId)
    .eq("action_type", actionType)
    .single();

  if (error) {
    return { valid: false, error: error.message };
  }

  if (!data.otp_code || !secretKey) {
    return { valid: false, error: "OTP invalid" };
  }

  const bytes = CryptoJS.AES.decrypt(data.otp_code, secretKey);
  const otpKey = bytes.toString(CryptoJS.enc.Utf8);

  /*   const expiresAtUTC = new Date(data.expires_at);
  if (expiresAtUTC.getTime() < Date.now()) {
    return { valid: false, error: "OTP has expired." };
  } */

  // Update the candidate status if the OTP is valid
  if (submittedOtp === otpKey) {
    await updateCandidateConfirmStatus(userId);
  }

  // Check if the decrypted OTP matches the submitted OTP
  return {
    valid: submittedOtp === otpKey,
  };
}
