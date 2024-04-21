"use server";
import pdf from 'pdf-parse';
import * as mammoth from "mammoth";

export async function resumeParserUpload(formData: FormData) {
  const file = formData.get("file") as File;

  let pageContent = "";

  if (file.type === "application/pdf") {
    // Process PDF file using pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);
    
    const data = await pdf(dataBuffer);

    pageContent = data.text; // Extracted text from all pages
  } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    // Process docx file using Mammoth
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.convertToHtml({ buffer });
    pageContent = result.value;
  } else {
    throw new Error("Unsupported file type");
  }

  return pageContent;
}
