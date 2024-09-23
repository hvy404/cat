"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function jobDescriptionUpload(formData: FormData) {
  const file = formData.get("file") as File | null;
  const fileExtension = file?.name.split(".").pop();
  const newFileName = `${uuidv4()}.${fileExtension}`;

  if (!file) {
    //console.error("Error: No file provided for job description upload.");
    return { success: false, message: "No file provided." };
  }

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.storage
      .from("jobs")
      .upload(`jd/${newFileName}`, file, {
        upsert: true,
      });

    if (error) {
    /*   console.error("Supabase storage upload error:", {
        error: error.message,
        fileName: newFileName,
        fileSize: file.size,
        fileType: file.type,
      }); */
      return { success: false, message: "Error uploading file.", error: error.message };
    }

/*     console.log("Job description upload successful:", {
      fileName: newFileName,
      fileSize: file.size,
      fileType: file.type,
    }); */

    return { success: true, filename: newFileName };
  } catch (err) {
/*     console.error("Unexpected error during job description upload:", {
      error: err instanceof Error ? err.message : String(err),
      fileName: newFileName,
      fileSize: file.size,
      fileType: file.type,
    }); */
    return { success: false, message: "Server error during file upload.", error: String(err) };
  }
}
