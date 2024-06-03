"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function fetchActiveJobPosts(
    userID: string,
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // fetch all rows under "job_postings" where the employer_id is equal to the userID and where 'active' is true
  const { data, error } = await supabase
    .from("job_postings")
    .select("jd_uuid, title, location, location_type, security_clearance, posted_date, private_employer")
    .eq("employer_id", userID)
    .eq("processed", true);

    console.log(data);

  if (error) {  
    console.error(error);
    return {
      message: "Failed to fetch active job posts.",
      error: error,
    };
  }
 
  // return the data to the client
  return { data };

}