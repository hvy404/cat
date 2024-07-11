"use server";
import { cookies } from "next/headers";
import { createClient } from "../supabase/server";

export async function updatePersonalProfile(
  employerID: string,
  profileData: {
    first_name?: string;
    last_name?: string;
    contact_email?: string;
    email_match?: boolean;
    email_applicant?: boolean;
  }
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("employers")
    .update(profileData)
    .eq("employer_id", employerID)
    .single();

  if (error) {
    throw new Error(`Error updating profile: ${error.message}`);
  }

  return data;
}

export async function retrievePersonalProfile(employerID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("employers")
    .select("first_name, last_name, contact_email, email_match, email_applicant")
    .eq("employer_id", employerID)
    .single();

  if (error) {
    throw new Error(`Error retrieving profile: ${error.message}`);
  }

  return data;
}