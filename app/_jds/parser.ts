"use server";
import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

export async function sowParser(formData: FormData) {
  // Set user ID for development
  const userId = "f7b3b3b4-4b7b-4b7b-8b7b-4b7b3b7b3b7b";

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const openai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const file = formData.get("file") as File;

  let pageContent = "";

  // Define the text splitter
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);
    const data = await pdf(dataBuffer);
    pageContent = data.text;
  } else if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });
    pageContent = result.value;
  } else {
    throw new Error("Unsupported file type");
  }

  // Define metadata for the chunks
  const metadata = {
    fileName: file.name,
    fileType: file.type,
    owner: userId,
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

    console.log("Embedding response:", embeddingResponse);

    // Prepare chunk with embedding for insertion
    chunkInserts.push({
      content: chunk,
      metadata: metadata,
      embedding: embeddingResponse.data[0].embedding, // Assuming correct API response indexing
      workspace: userId,
    });
  }

  // Ready to insert chunks into Supabase
  console.log("Chunks ready for insertion:", chunkInserts);
  
  // Insert chunks in bulk into Supabase, manage size of batch inserts
  for (let i = 0; i < chunkInserts.length; i += 10) {
    const batch = chunkInserts.slice(i, i + 10);
    const { error } = await supabase.from("sow").insert(batch);
    if (error) {
      console.error("Error inserting chunks:", error);
      break;
    }
  }

  return pageContent;
}
