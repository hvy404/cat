"use server";
import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { fileTypeFromBuffer } from "file-type";
import { Buffer } from "buffer";

/**
 * Downloads a job description file from the Supabase storage and processes it based on its MIME type.
 * Supports PDF and DOCX file types.
 * The final output is raw text extracted from the job description file.
 * 
 * @param jdFilename - The name of the job description file to be processed.
 * @returns The extracted text content from the job description file.
 * @throws Error if there is an error downloading the file, if the file type is unsupported, or if the file type cannot be determined.
 */
export async function jdParserUpload(jdFilename: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const folder = "jd";

  const { data: blobData, error } = await supabase.storage
    .from("jobs")
    .download(folder + "/" + jdFilename);

  if (error) {
    throw new Error("Error downloading file");
  }

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await blobData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Determine the file type
  const fileTypeResult = await fileTypeFromBuffer(buffer);
  if (!fileTypeResult) {
    throw new Error("Could not determine file type or unsupported file type");
  }

  const mimeType = fileTypeResult.mime;

  let pageContent = "";

  // Check the MIME type and process accordingly
  if (mimeType === "application/pdf") {
    // Process PDF file using pdf-parse

    const data = await pdf(buffer);
    pageContent = data.text; // Extracted text from all pages
  } else if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    // Process docx file using Mammoth
    const result = await mammoth.extractRawText({ buffer });
    pageContent = result.value;
  } else {
    throw new Error("Unsupported file type: " + mimeType);
  }

  return pageContent;
}
