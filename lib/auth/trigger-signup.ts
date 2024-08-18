"use server";

import { inngest } from "@/lib/inngest/client";

export async function triggerEmployerSignup(employerId: string, email: string) {
  try {
    // Call the Inngest function with both employerId and email
    await inngest.send({
      name: "app/employer-signed-up",
      data: { employerId, email },
    });

    return { success: true };
  } catch (error) {
    console.error("Error triggering employer signup:", error);
    return { success: false, error: "Failed to trigger employer signup" };
  }
}
