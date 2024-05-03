"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { rolesTypeSchema } from "./getRolesSchema";

export async function getRoles(owner: string) {
  console.log("getRoles");

  const docSchema = zodToJsonSchema(rolesTypeSchema, "rolesTypeSchema");

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const embeddingsResponse = await togetherAi.embeddings.create({
    model: "togethercomputer/m2-bert-80M-8k-retrieval",
    input: "Identify the personnel roles needed in this SOW.",
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Define the filter
  const filter = { owner: owner };

  // Find matches
  const { data: context } = await supabase.rpc("match_sow", {
    filter: filter,
    query_embedding: embeddings,
    match_count: 14,
  });

  console.log("Context", context);

  const extract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "Use the provided context to identify the personnel roles we will need for this opportunity. Your answer must be in JSON format.",
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}`,
      },
    ],
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    temperature: 0.5,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: docSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  console.log("Roles", output);

  return output;
}
