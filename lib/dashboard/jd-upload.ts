"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function jobDescriptionUpload(formData: FormData) {
  const file = formData.get("file") as File | null;
  const fileExtension = file?.name.split(".").pop();
  const newFileName = `${uuidv4()}.${fileExtension}`;

  if (!file) {
    console.error("No file provided.");
    return { success: false, message: "No file provided." };
  }

  // Optionally, validate file size and type here, check for virus

  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.storage
      .from("jobs")
      .upload(`jd/${newFileName}`, file, {
        upsert: true, // using upsert to avoid duplicate filenames causing errors edgecase
      });

    if (error) {
      console.error("Error uploading file: ", error.message);
      return { success: false, message: "Error uploading file." };
    }
    // Return the filename as the ID
    return { success: true, filename: newFileName };
  } catch (err) {
    console.error("Server error: ", err);
    return { success: false, message: "Server error during file upload." };
  }
}
