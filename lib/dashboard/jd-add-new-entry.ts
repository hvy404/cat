"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

/**
 * Adds a new database entry for a job description.
 * 
 * @param employerID - The ID of the employer.
 * @param filename - The name of the file.
 * @returns An object indicating the success of the operation and the ID of the new entry.
 */

export async function JDAddDatabaseEntry(employerID: string, filename: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  let jobID = uuidv4(); // Assigned as jdEntryID in the store

  try {
    const { error } = await supabase.from("job_postings").upsert([
      {
        employer_id: employerID,
        jd_id: jobID,
        filename: filename,
      },
    ]);
  } catch (error) {
    return {
      success: false,
      message: "Error uploading job description.",
    };
  }

  return {
    success: true,
    message: "Successfully uploaded job description.",
    id: jobID, // Generated UUID for the job description
  };
}
