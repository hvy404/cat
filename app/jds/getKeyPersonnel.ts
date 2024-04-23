"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { keyPersonnelTypeSchema } from "./getKeyPersonnelSchema";

export async function getKeyPersonnel(owner: string) {
  console.log("getKPs");

  const docSchema = zodToJsonSchema(
    keyPersonnelTypeSchema,
    "keyPersonnelTypeSchema"
  );

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const embeddingsResponse = await togetherAi.embeddings.create({
    model: "togethercomputer/m2-bert-80M-2k-retrieval",
    input: "Identify the key personnel roles.",
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Define the filter
  const filter = { owner: owner };

  // Find matches
  const { data: context } = await supabase.rpc("match_sow", {
    filter: filter,
    query_embedding: embeddings,
    match_count: 13,
  });

  const extract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Use the provided context to identify the key personnels (KP). Your answer will only the role names, do not include any comments. Your answer must be in JSON format.",
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}`,
      },
    ],
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    temperature: 0.4,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: docSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  return output;
}
