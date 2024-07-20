"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import createId from "@/lib/global/cuid-generate";
import { add } from "date-fns";

/**
 * Moves the resume file for a given user to a final destination.
 * @param userId The ID of the user whose resume file needs to be moved.
 * @returns A promise that resolves to an object indicating the success of the operation and the new path of the file.
 */
export async function moveResumeFile(userId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // Look up the original file path
    const { data: candidateData, error: candidateError } = await supabase
      .from("candidates")
      .select("filename")
      .eq("identity", userId)
      .single();

    if (candidateError) throw candidateError;
    if (!candidateData || !candidateData.filename) {
      throw new Error("File not found for the given user");
    }

    const originalFilename = candidateData.filename;
    const originalPath = `resumes/${originalFilename}`;
    const newPath = `nautilus/${userId}/${originalFilename}`;

    // Move the file
    const { data, error } = await supabase.storage
      .from("resumes")
      .move(originalPath, newPath);

    if (error) throw error;

    // Add new entry in the database for the file

    const finalResumeAddressableKey = createId();
    const { error: insertError } = await supabase
      .from("candidate_resume")
      .insert([
        {
          candidate_identity: userId,
          resume_name: "My Uploaded Resume",
          path: newPath,
          address: finalResumeAddressableKey,
          default: true,
        },
      ]);
    if (insertError) throw insertError;

    return { success: true, newPath };
  } catch (error) {
    console.error("Error moving file:", error);
    return { success: false, error: error };
  }
}
