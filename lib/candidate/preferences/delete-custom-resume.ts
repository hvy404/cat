"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Deletes a resume for a given user, including the file from storage.
 * @param userId - The ID of the user.
 * @param resumeAddress - The address of the resume to be deleted.
 * @returns A promise that resolves to a boolean indicating success or failure.
 * @throws If there is an error while deleting the resume.
 */
export async function deleteResume(userId: string, resumeAddress: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // First, get the file path from the database
    const { data: resumeData, error: fetchError } = await supabase
      .from("candidate_resume")
      .select("path")
      .eq("candidate_identity", userId)
      .eq("address", resumeAddress)
      .single();

    if (fetchError || !resumeData) {
      console.error("Error fetching resume data:", fetchError);
      throw new Error("Failed to fetch resume data");
    }

    const filePath = resumeData.path;

    // Delete the file from Supabase storage
    const { error: storageError } = await supabase.storage
      .from("resumes")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      throw new Error("Failed to delete resume file from storage");
    }

    // Delete the database entry
    const { error: deleteError } = await supabase
      .from("candidate_resume")
      .delete()
      .eq("candidate_identity", userId)
      .eq("address", resumeAddress);

    if (deleteError) {
      console.error("Error deleting resume entry:", deleteError);
      throw new Error("Failed to delete resume entry from database");
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in deleteResume:", error);
    throw new Error("An unexpected error occurred while deleting the resume");
  }
}