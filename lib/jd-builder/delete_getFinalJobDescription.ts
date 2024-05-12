// THIS IS NOT NEEDED ANYMORE

"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function getFinalJobDescriptions(
  owner: string,
  jobDescription: string,
  scopeSummary: string
) {
  console.log("fetching scope summary");

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();

  // Define the filter
  const filter = { owner: owner };

  const extract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Review the job description and enhance it as necessary based on the scope summary. The purpose is to make the job description clearer for the candidate. Do not make up any details that is not explicitly mentioned in the scope summary. If no changes are necessary, your response will be a carbon copy of the original job description. Do not include any extra greetings or comments, your respond should be a job description.`,
      },
      {
        role: "user",
        content: `Original Job Description: ${jobDescription}
        
        Scope Summary: ${scopeSummary}`,
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
