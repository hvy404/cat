'use server'

import { clerkClient } from "@clerk/nextjs/server";

export async function updatePublicMetadata(userId: string, metadata: { role: string; cuid: string; }) {
  try {
    await clerkClient().users.updateUser(userId, {
      publicMetadata: metadata,
    });
  } catch (err) {
    console.error("Error updating public metadata:", err);
    throw new Error("Failed to update user metadata");
  }
}