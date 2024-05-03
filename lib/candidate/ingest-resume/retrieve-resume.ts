/**
 * Downloads a resume file from Supabase storage, determines its file type, and processes it accordingly.
 * 
 * @param resumeFilename - The name of the resume file to download and process.
 * @returns The extracted text content from the resume file.
 * @throws An error if there is an issue downloading the file, determining the file type, or if the file type is unsupported.
 */

"use server";
import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { fileTypeFromBuffer } from "file-type";
import { Buffer } from "buffer";

export async function resumeParserUpload(resumeFilename: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const folder = "resumes";

  const { data: blobData, error } = await supabase.storage
    .from("resumes")
    .download(folder + "/" + resumeFilename);

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
