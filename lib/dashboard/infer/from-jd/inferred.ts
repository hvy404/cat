"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { assumedDetailsSchema } from "./schema/inferred-schema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { systemPrompt } from "@/lib/dashboard/infer/from-jd/inferred-prompt";

const jsonSchema = zodToJsonSchema(assumedDetailsSchema, "JDSchema");

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function generateJDInferred(
  jdRaw: string,
  jobDescriptionID: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const userPrompt = `<JobDescription>
  ${JSON.stringify(jdRaw)}
  </JobDescription>`;

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    temperature: 0.4,
    max_tokens: 4000,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  //console.log(output);

  //TODO: make sure to update the jd_id to prop instead of hardcoded value
  const { error } = await supabase
    .from("job_postings")
    .update({ inferred: output }) // Only updating the 'inferred' column
    .match({ jd_id: jobDescriptionID }); // Matching the row by 'jd_id'

  if (error) {
    console.error(error);
    return {
      message: "Failed to update inferred points.",
      success: false,
    };
  }

  return {
    message: "Success",
    success: true,
  };
}
