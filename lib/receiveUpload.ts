"use server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import * as mammoth from "mammoth";

export async function resumeParserUpload(formData: FormData) {
  const file = formData.get("file") as File;

  let pageContent = "";

  if (file.type === "application/pdf") {
    // Process PDF file using PDFLoader
    const loader = new PDFLoader(file, {
      parsedItemSeparator: "",
      splitPages: false,
    });

    const docs = await loader.load();
    pageContent = docs.map((doc) => doc.pageContent).join(" ");
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
