"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { documentTypeSchema } from "./schema/getTypeSchema";

interface ContextItem {
  id: number;
  content: string;
  metadata?: any;
  similarity?: number;
}

export async function getType(owner: string, sowId: string) {
  const docSchema = zodToJsonSchema(documentTypeSchema, "docTypeSchema");

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const embeddingsResponse = await togetherAi.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input:
      "What is the Project Work Statement (PWS) or Statement of Work (SOW)?",
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Define the filter
  const filter = { owner: owner, sowId: sowId };

  const { data: context } = await supabase.rpc("sow_builder", {
    filter: filter,
    query_embedding: embeddings,
    match_count: 12,
    threshold: 0.44,
  });

  if (!context) {
    throw new Error("Error fetching data");
  }

  // Remove metadata and similarity from context to save token window
  const optimizedResults = (context as ContextItem[]).map(
    ({ id, content }) => ({
      id,
      content,
    })
  );

  console.log("optimizedResults", optimizedResults);

  const systemPrompt = `Given the provided context, your task is to determine whether the document is a Statement of Work (SOW) or a Performance Work Statement (PWS). In the Federal RFQ context, a SOW typically outlines specific tasks, deliverables, and a timeline for a vendor to provide services or deliver goods. On the other hand, a PWS describes the desired outcome, objectives, and performance standards, leaving the 'how' up to the vendor. Your answer must be in JSON format, specifying the document type and the key indicators that led to your conclusion.`;

  const extract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(optimizedResults)}`,
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    temperature: 0.3,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: docSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  console.log("output", output);

  // Add the document type to the database
  const { error } = await supabase
    .from("sow_meta")
    .update({ type: output.document_type })
    .eq("sow_id", sowId);

  if (error) {
    console.error("Error inserting document type", error);
    throw new Error("Error inserting document type");
  }

  return output;
}
