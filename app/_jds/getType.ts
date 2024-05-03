"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { documentTypeSchema } from "./getTypeSchema";

export async function getType(owner: string) {

  const docSchema = zodToJsonSchema(documentTypeSchema, "docTypeSchema");

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const embeddingsResponse = await togetherAi.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: "Is this document a Project Work Statement (PWS) or Statement of Work (SOW)?",
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Define the filter
  const filter = { owner: owner };

  // Find matches
  const { data: context } = await supabase.rpc("match_sow", {
    filter: filter,
    query_embedding: embeddings,
    match_count: 12,
  });

  console.log("Results", context);

  const extract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Use the provided context to identify if this document is a SOW or PWS. Your answer must be in JSON format.",
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}`,
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    max_tokens: 4000,
    temperature: 0.1,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: docSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  return output;
}
