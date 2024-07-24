"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Fetches the company ID associated with a user.
 * @param userId - The ID of the user.
 * @returns An object with the success status and the company ID.
 * If the operation is successful, the object will have `success` set to `true` and `companyId` set to the fetched company ID.
 * If the operation fails, the object will have `success` set to `false` and `error` set to the error message.
 */
export async function fetchUserCompanyId(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("employers")
      .select("company_id")
      .eq("employer_id", userId)
      .single();

    if (error) throw error;

    return { success: true, companyId: data.company_id };
  } catch (error) {
    console.error("Error fetching user company ID:", error);
    return { success: false, error: "Failed to fetch company ID" };
  }
}
