"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { assumedDetailsSchema } from "./schema/inferred-schema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const jsonSchema = zodToJsonSchema(assumedDetailsSchema, "JDSchema");

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function generateJDInferred(jdRaw: string, jobDescriptionID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  console.log("Generating inferred points from JD");

  const systemPrompt = `The following is a job description. Use the job description data to extrapolate details about the job opportunity, and return answer in JSON. If key values are not relevant, leave it empty. Do not make anything up.`;

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: JSON.stringify(jdRaw),
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    temperature: 0.3,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);

  //console.log(output);

  //TODO: make sure to update the jd_uuid to prop instead of hardcoded value
  const { error } = await supabase
    .from("job_postings")
    .update({ inferred: output }) // Only updating the 'inferred' column
    .match({ jd_uuid: jobDescriptionID }); // Matching the row by 'jd_uuid'

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
