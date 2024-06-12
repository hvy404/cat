"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { inferredSchema } from "./data/inferredSchema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const jsonSchema = zodToJsonSchema(inferredSchema, "ResumeSchema");

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

const systemPrompt =
  "The following context is resume data. Your task is to extract details about the resume. Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. Your answer must be in JSON format.";

export async function generateLiftedInferred(resume: string, id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  console.log("generateLiftedInferred function is running")

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(resume),
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    max_tokens: 4000,
    temperature: 0.4,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  const { error } = await supabase
    .from("candidate_resume")
    .upsert([{ inferred: output, user: id }], {
      onConflict: "user",
    });

  if (error) {
    console.error(error);
    return {
      message: "Failed to insert inferred points.",
      success: false,
    };
  }

  return {
    message: "Success",
    success: true,
  };
}
