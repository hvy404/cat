"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { write } from "@/lib/neo4j/utils";

/**
 * Deletes a job post from Supabase and Neo4j.
 * 
 * @param jdUUID - The UUID of the job post to delete.
 * @param userUUID - The UUID of the user who owns the job post.
 * @returns An object indicating the success of the deletion operation.
 */
export async function deleteJobPost(jdUUID: string, userUUID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Delete the job post from Supabase by deleting the row from 'job_postings' table, where jd_id eq. to jdUUID and employer_id eq. to userUUID
    const { data, error } = await supabase
      .from("job_postings")
      .delete()
      .eq("jd_id", jdUUID)
      .eq("employer_id", userUUID);

    if (error) {
      console.error("Error deleting job post from Supabase:", error);
      throw new Error("Failed to delete job post from Supabase");
    }

    // Delete the job post from Neo4j
    const cypherQuery = `
            MATCH (job:Job { job_id: $jdUUID })
            DETACH DELETE job
        `;
    const params = { jdUUID };

    const result = await write(cypherQuery, params);

    return { success: true };
  } catch (error) {
    console.error("Error deleting job post:", error);
    return { success: false };
  }
}
