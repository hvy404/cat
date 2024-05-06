"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { staticSchema } from "./data/staticSchema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { SubContent } from "@radix-ui/react-dropdown-menu";

const jsonSchema = zodToJsonSchema(staticSchema, "ResumeSchema");

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function generateLiftedStatic(resume: string, id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "The following is resume data. Use the resume data to populate relevant fields the resume schema, and answer in JSON. If key values are not relevant, leave it empty. Do not make anything up.",
      },
      {
        role: "user",
        content: JSON.stringify(resume),
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    temperature: 0.3,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  const { error } = await supabase
    .from("candidate_resume")
    .upsert([{ static: output, user: id }], {
      onConflict: "user",
    });

  if (error) {
    console.error(error);
    return {
      message: "Failed to insert static points.",
      success: false,
    };
  }

  return {
    message: "Success",
    success: true,
  };
}
