"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface EmployerDetails {
  employer_id: string;
  contact_email: string;
}

export async function addNewEmployerToDB(employerDetails: EmployerDetails) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data, error } = await supabase
      .from("employers")
      .insert({
        employer_id: employerDetails.employer_id,
        contact_email: employerDetails.contact_email,
      })
      .select();

    if (error) throw error;

    return {
      success: true,
      message: "New employer added to database successfully.",
      data: data,
    };
  } catch (error) {
    console.error("Error adding new employer to database:", error);
    return {
      success: false,
      message: "Failed to add new employer to database. Please try again.",
      error: error,
    };
  }
}
