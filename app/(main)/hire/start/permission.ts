"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Checks if the given email is approved in the "approved" table in the Supabase database.
 *
 * @param email - The email address to check.
 * @returns An object with a `allow` property indicating whether the email is approved (true) or not (false).
 */
export async function checkApprovedEmail(email: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("approved")
    .select("email")
    .eq("email", email)
    .single();

  if (error) {
    return { allow: false };
  }

  return { allow: !!data };
}
