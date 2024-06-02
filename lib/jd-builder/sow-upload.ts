// This is be the first step. 
// Next step is to trigger Inngest function to parse (chunk) the SOW and extract the required information.

"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function sowUpload(
  formData: FormData,
  sowUUID: string,
  employerID: string
) {
  const files = formData.getAll("file") as File[];
  if (files.length === 0) {
    console.error("No files provided.");
    return { success: false, message: "No files provided." };
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Add entry to table 'sow_meta", column "sow_id" with value "sowUUID" and column "owner" with value "employerID"
  const { error } = await supabase.from("sow_meta").insert({
    sow_id: sowUUID,
    owner: employerID,
  });

  if (error) {
    console.error("Error recording SOW meta info:", error);
    throw new Error("Error recording SOW meta info");
  }

  const uploadedFiles: {
    filename: string;
    success: boolean;
    message?: string;
  }[] = [];

  for (const file of files) {
    const fileExtension = file.name.split(".").pop();
    const newFileName = `${uuidv4()}.${fileExtension}`;

    try {
      const { data, error } = await supabase.storage
        .from("sow-documents")
        .upload(`docs/${newFileName}`, file, {
          upsert: true,
        });

      if (error) {
        console.error("Error uploading file: ", error.message);
        uploadedFiles.push({
          filename: newFileName,
          success: false,
          message: "Error uploading file.",
        });
      } else {
        uploadedFiles.push({ filename: newFileName, success: true });
      }
    } catch (err) {
      console.error("Server error: ", err);
      uploadedFiles.push({
        filename: newFileName,
        success: false,
        message: "Server error during file upload.",
      });
    }
  }

  // Save uploaded files to the database in Supabase table sow_documents, in the column 'filename' in the row where 'sow_uuid' is sowUUID
  const { error: updateError } = await supabase
    .from("sow_meta")
    .update({ filename: uploadedFiles })
    .eq("sow_id", sowUUID);

  if (updateError) {
    console.error("Error updating database: ", updateError);
    return { success: false, message: "Error updating database." };
  }

  return { success: true, files: uploadedFiles };
}
