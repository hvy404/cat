'use server'

import { updatePublicMetadata } from "@/lib/auth/actions";

export async function setEmployerMetadata(
  userId: string,
  employerId: string
) {
  try {
    await updatePublicMetadata(userId, {
      aiq_role: "employer-trial",
      aiq_cuid: employerId,
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating employer metadata:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error updating employer metadata" };
  }
}