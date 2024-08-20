"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

/**
 * Updates the public metadata for the authenticated user.
 * 2 = dialog shown to new users in experience, education, certifcation dashboard pages
 * true = user has permanently dismissed the dialog
 *
 * @returns An object with a `success` property indicating whether the update was successful.
 * @throws {Error} If the user is not authenticated or if there was an error updating the metadata.
 */

export async function manageOnboardDialog2() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await clerkClient().users.getUser(userId);
    const updatedMetadata = { ...user.publicMetadata, "2": "true" };

    await clerkClient().users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    });

    return { success: true };
  } catch (err) {
    throw new Error("There was an error saving your preference.");
  }
}

export async function manageSearchTipAlert() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await clerkClient().users.getUser(userId);
    const updatedMetadata = { ...user.publicMetadata, "3": "true" };


    await clerkClient().users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    });

    return { success: true };
  } catch (err) {
    throw new Error("There was an error saving your preference.");
  }
}

export async function manageDashboardRightPanelIntro() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const user = await clerkClient().users.getUser(userId);
    const updatedMetadata = { ...user.publicMetadata, "4": "true" };

    await clerkClient().users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    });

    return { success: true };
  } catch (err) {
    throw new Error("There was an error saving your preference.");
  }
}
