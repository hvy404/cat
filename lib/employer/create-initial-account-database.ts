"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Adds a new employer and a 30-day subscription to the Supabase database.
 *
 * @param cuid - The unique identifier for the employer.
 * @param email - The contact email for the employer.
 * @returns An object containing the newly created employer and subscription records.
 * @throws Error if there is a failure adding the employer or subscription.
 */
export async function addEmployerAndSubscription(cuid: string, email: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Start a Supabase transaction
    const { error: employerError } = await supabase
      .from("employers")
      .insert([
        {
          employer_id: cuid,
          contact_email: email,
        },
      ])
      .select();

    if (employerError) {
      throw employerError;
    }

    // Calculate start and end dates
    const startDate = new Date().toISOString();
    const endDate = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(); // 30 days from now

    const { error: subscriptionError } = await supabase
      .from("subscription")
      .insert([
        {
          employer_id: cuid,
          start_date: startDate,
          end_date: endDate,
        },
      ])
      .select();

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Return a simple success status
    return {
      success: true,
      message: "Employer and subscription added successfully",
    };
  } catch (error) {
    console.error("Failed to add employer and subscription:", error);
    throw new Error("Failed to add employer and subscription");
  }
}
