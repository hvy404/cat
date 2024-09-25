"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Updates the first and last name of an employer in the Supabase database.
 *
 * @param employerId - The unique identifier of the employer.
 * @param firstName - The new first name of the employer.
 * @param lastName - The new last name of the employer.
 * @returns An object with a `success` boolean indicating whether the update was successful, and either the updated data or an error message.
 */
export async function updateEmployerName(
  employerId: string,
  firstName: string,
  lastName: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("employers")
      .update({ first_name: firstName, last_name: lastName })
      .eq("employer_id", employerId)
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error updating employer name:", error);
    return { success: false, error: "Failed to update employer name" };
  }
}
