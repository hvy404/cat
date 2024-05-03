/**
 * Generates a candidate OTP (One-Time Password) based on the provided user ID and timestamp.
 * @param userId - The ID of the user.
 * @param timestamp - The timestamp used for generating the OTP.
 * @returns The generated OTP as a string.
 */

"use server";
import crypto from "crypto";

export async function generateCandidateOtp(userId: string, timestamp: string) {
  const secretKey = process.env.CANDIDATE_OTP_KEY!;
  const interval = Math.floor(Number(timestamp) / (300000 * 2)); // Assuming a 10-minute interval base for your OTP system
  const data = userId + "|" + interval;
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(data)
    .digest("hex");
    
  const otp = parseInt(hash.substring(0, 6), 16) % 1000000;

  return otp.toString().padStart(6, "0");
}
