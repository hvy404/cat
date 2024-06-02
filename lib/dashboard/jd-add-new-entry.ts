"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function JDAddDatabaseEntry(employerID: string, filename: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  let jobID = uuidv4();

  try {
    const { error } = await supabase.from("job_postings").upsert([
      {
        employer_id: employerID,
        jd_uuid: jobID,
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
    id: jobID,
  };
}
