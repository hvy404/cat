// Should be step 2 -- called by Inngest

"use server";
import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import { fileTypeFromBuffer } from "file-type";
import { Buffer } from "buffer";

export async function sowParser(
  sowUUID: string,
  employerID: string,
  sowFilename: string,
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  console.log("Parsing SOW:", sowFilename);

  const openai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const folder = "docs";

  const { data: blobData, error } = await supabase.storage
    .from("sow-documents")
    .download(folder + "/" + sowFilename);

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

  // Define the text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1200,
    chunkOverlap: 180,
    separators: [
      "\n\n",
      "\n",
      " ",
      ".",
      ",",
      "\u200b", // Zero-width space
      "\uff0c", // Fullwidth comma
      "\u3001", // Ideographic comma
      "\uff0e", // Fullwidth full stop
      "\u3002", // Ideographic full stop
      "",
    ],
  });

  // Define metadata for the chunks
  const metadata = {
    fileName: sowFilename,
    owner: employerID,
    sowId: sowUUID,
  };

  // Send page content to the text splitter
  const chunks = await splitter.splitText(pageContent);

  // Array for bulk inserts
  const chunkInserts = [];

  // Process each chunk for embeddings
  for (const chunk of chunks) {
    const embeddingResponse = await openai.embeddings.create({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: chunk,
    });

    //console.log("Embedding response:", embeddingResponse);

    // Prepare chunk with embedding for insertion
    chunkInserts.push({
      content: chunk,
      metadata: metadata,
      embedding: embeddingResponse.data[0].embedding, // Assuming correct API response indexing
      owner: employerID,
      sow_id: sowUUID,
    });
  }

  // Insert chunks in bulk into Supabase, manage size of batch inserts
  for (let i = 0; i < chunkInserts.length; i += 10) { 
    const batch = chunkInserts.slice(i, i + 10); // Insert 10 chunks at a time
    const { error } = await supabase.from("sow_docs").insert(batch);
    if (error) {
      console.error("Error inserting chunks:", error);
      throw new Error("Error inserting chunks");
    }
  }

  // Add 'true' value under column' ready to table 'sow_meta" table, in the row where column "sow_id" has value "sowUUID"
  const { error: updateError } = await supabase
    .from("sow_meta")
    .update({ ready: true })
    .match({ sow_id: sowUUID });

  if (updateError) {
    console.error("Error updating SOW meta info:", updateError);
    throw new Error("Error updating SOW meta info");
  }

  return {
    message: "SOW parsed and stored successfully",
    success: true,
  };
}
