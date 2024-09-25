"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Updates the employer initialization status for the authenticated user.
 *
 * @returns An object with a `success` property indicating whether the update was successful.
 * @throws {Error} If the user is not authenticated or if there was an error updating the user's metadata.
 */
export async function updateEmployerInitClerk() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await clerkClient().users.getUser(userId);
    const updatedMetadata = { ...user.publicMetadata, employer_init: true };

    await clerkClient().users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    });

    return { success: true };
  } catch (err) {
    console.error("Error updating employer_init:", err);
    throw new Error("Failed to update employer initialization status");
  }
}
