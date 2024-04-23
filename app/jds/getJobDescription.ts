"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getJobDescription(owner: string, role_name: string) {
  console.log("get JD");


  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const embeddingsResponse = await togetherAi.embeddings.create({
    model: "togethercomputer/m2-bert-80M-2k-retrieval",
    input: `What are the responsibilties for the role ${role_name}.`,
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
          `Use the provided context to identify the job description for the role ${role_name}. The job description will be used to recruit candidates for the role. Include the following information: job title, job description, responsibilities, required qualifications, and preferred qualifications. Write the job description in a professional and engaging manner.`,
      },
      {
        role: "user",
        content: `Context: ${JSON.stringify(context)}`,
      },
    ],
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    temperature: 0.6,
    max_tokens: 7000,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
  });

  const output = extract.choices[0].message.content!;

  console.log(output);

  return output;
}
