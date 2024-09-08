"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Uploads a resume file to the Supabase storage.
 *
 * @param formData - The form data containing the file, user ID, and filename.
 * @returns An object with the uploaded file path and any error that occurred.
 */
export async function uploadResumeAction(formData: FormData) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;
  const filename = formData.get("filename") as string;

  const filePath = `nautilus/${userId}/${filename}.docx`;

  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .upload(filePath, file);

    if (error) {
      throw error;
    }
    return { data: data.path, error: null };
  } catch (error) {
    console.error("Error uploading resume to Supabase:", error);
    return { data: null, error };
  }
}
