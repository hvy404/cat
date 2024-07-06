/**
 * Stores a candidate OTP request in the database.
 *
 * @param {string} userId - The ID of the user.
 * @param {string} actionType - The type of action for the OTP request.
 * @returns {Promise<{ data: any, error: any, timestamp: number }>} - The result of the operation, including the stored data, any error that occurred, and the timestamp of the request.
 */

// "upload": If the OTP is for authorizing an upload action.
// "delete": If the OTP is for authorizing a delete action.
// "login": For OTP-based login verification.
// "update": For updating sensitive user information.

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import CryptoJS, { enc } from 'crypto-js';

export async function storeCandidateOtpRequest(
  userId: string,
  actionType: string,
  otp: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  console.log("Storing OTP request for user:", otp);

  const secretKey = process.env.OTP_ENCRYPTION_KEY!;
  
  const timestamp = Date.now();
  // Calculate an interval index if your verification logic needs it
  //const interval = Math.floor(timestamp / (300000 * 2)); // Assuming a 10-minute interval base for your OTP system
  const expiresAt = new Date(timestamp + 20 * 60000); // Set expiration to 20 minutes to match your OTP generation logic

  const encrypted = CryptoJS.AES.encrypt(otp, secretKey);
  const otpKey = encrypted.toString();

  const { data, error } = await supabase.from("candidates_otp").insert([
    {
      candidate_id: userId,
      action_type: actionType,
      expires_at: expiresAt, // More explicit declaration of the expiration date
      otp_code: otpKey,
    },
  ]);

  return {
    message: "Successful.",
  };
}
