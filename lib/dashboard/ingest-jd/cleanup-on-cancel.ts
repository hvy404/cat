/**
 * Performs cleanup operations when a job posting creation is cancelled.
 *
 * @param {CleanUpData} data - The data required for cleanup.
 * @param {string} data.jdId - The ID of the job description to be deleted.
 * @param {string} data.employerId - The ID of the employer associated with the job posting.
 * @param {string|null} data.filename - The filename of the associated file, if any.
 *
 * @returns {Promise<{success: boolean, message: string}>} A promise that resolves to an object
 * indicating the success status and a message describing the outcome.
 *
 * @throws {Error} If there's an error deleting the job posting from the database.
 *
 * @description
 * This function performs two main cleanup tasks:
 * 1. Deletes the job posting entry from the 'job_postings' table in the database.
 * 2. If a filename is provided, it attempts to delete the associated file from storage.
 *
 * The function will return a success message even if the file deletion fails, as long as
 * the database entry is successfully removed. In case of file deletion failure, the returned
 * message will indicate this partial success.
 */

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

interface CleanUpData {
  jdId: string;
  employerId: string;
  filename: string | null;
}

export async function CleanUpOnCancel({
  jdId,
  employerId,
  filename,
}: CleanUpData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Step 1: Delete the row from job_postings table
    const { error: dbError } = await supabase
      .from("job_postings")
      .delete()
      .eq("jd_id", jdId)
      .eq("employer_id", employerId);

    if (dbError) {
      console.error("Error deleting job posting:", dbError);
      throw new Error("Failed to delete job posting");
    }

    // Step 2: Delete the file from storage if filename is provided
    if (filename) {
      const filePath = `jd/${filename}`;
      const { error: storageError } = await supabase.storage
        .from("jobs")
        .remove([filePath]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // We don't throw here because the database deletion was successful
        return {
          success: true,
          message:
            "Job posting deleted successfully, but failed to delete associated file",
        };
      }
    }

    return {
      success: true,
      message: "Job posting and associated file deleted successfully",
    };
  } catch (error) {
    console.error("Error in CleanUpOnCancel:", error);
    return { success: false, message: "Failed to delete job posting" };
  }
}
