"use server";

import { clerkClient } from "@clerk/nextjs/server";

/**
 * Updates the public metadata for a user in Clerk.
 * employer_init is optional
 *
 * @param userId - The ID of the user to update.
 * @param metadata - An object containing the updated public metadata for the user, including their AIQ role, AIQ customer ID, and employer initialization status.
 * @throws {Error} If there is an error updating the user's public metadata.
 */
export async function updatePublicMetadata(
  userId: string,
  metadata: { aiq_role: string; aiq_cuid: string; employer_init?: boolean }
) {
  try {
    await clerkClient().users.updateUser(userId, {
      publicMetadata: metadata,
    });
  } catch (err) {
    console.error("Error updating public metadata:", err);
    throw new Error("Failed to update user metadata");
  }
}
