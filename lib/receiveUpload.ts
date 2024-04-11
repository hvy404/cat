"use server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { TogetherAIEmbeddings } from "@langchain/community/embeddings/togetherai";
import { Blob } from "fetch-blob";

export async function resumeParserUpload(formData: FormData) {
  const file = formData.get("file") as File;

  // send file to PdfLoader
  const loader = new PDFLoader(file, {
    parsedItemSeparator: "",
    splitPages: false,
  });

  const docs = await loader.load();

  //console.log(docs);

  // Serialize 'docs' pageContent to a string
  const pageContent = docs.map((doc) => doc.pageContent).join(" ");

  return pageContent;
}
