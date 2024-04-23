"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function retrieveMatches() {
  const owner = "f7b3b3b4-4b7b-4b7b-8b7b-4b7b3b7b3b7b";

  const openai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const embeddingsResponse = await openai.embeddings.create({
    model: "togethercomputer/m2-bert-80M-2k-retrieval",
    input: "what is the scope of work for this project?",
  });

  // Extract the embeddings from the response
  const embeddings = embeddingsResponse.data[0].embedding;

  // Define the filter
  const filter = { owner: owner };

  // Find matches
  const { data: context } = await supabase.rpc("match_sow", {
    filter: filter,
    query_embedding: embeddings,
    match_count: 10,
  });

  console.log("Results", context);

  return embeddings;
}
