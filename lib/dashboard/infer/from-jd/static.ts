"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  jobDescriptionStaticSchema,
  jobDescriptionStaticSecondarySchema,
  jobDescriptionStaticThirdSchema,
} from "./schema/static-schema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const jsonSchemaPrimary = zodToJsonSchema(
  jobDescriptionStaticSchema,
  "JDSchema"
);
const jsonSchemaSecondary = zodToJsonSchema(
  jobDescriptionStaticSecondarySchema,
  "JDSchemaSecondary"
);

const jsonSchemaThird = zodToJsonSchema(
  jobDescriptionStaticThirdSchema,
  "JDSchemaThird"
);

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function generateJDStatic(
  jdRaw: string,
  jobDescriptionID: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  //console.log("Generating static points from JD");

  const systemPrompt = `The following context is a job description. Use the job description to extrapolate details about the job opportunity. If the job description does not provide information for a specific key required by the schema, leave the value blank. Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. Your answer must be in JSON format.`;
  const systemPrompt3 = `The following context is a job description. Use the job description to infer details about the job opportunity. If the JD does not provide information for a specific key required by the schema, leave the value blank. Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. Your answer must be in JSON format.`;


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
    temperature: 0.4,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchemaPrimary },
  });

  const primaryOutput = JSON.parse(extract.choices[0].message.content!);
  console.log("Primary output: ", primaryOutput);

  const extractSecondary = await togetherai.chat.completions.create({
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
    temperature: 0.4,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchemaSecondary },
  });

  const secondaryOutput = JSON.parse(
    extractSecondary.choices[0].message.content!
  );

  console.log("Secondary output: ", secondaryOutput);

  const extractThird = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt3,
      },
      {
        role: "user",
        content: JSON.stringify(jdRaw),
      },
    ],
    model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    temperature: 0.45,
    max_tokens: 4000,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchemaThird },
  });

  const thirdOutput = JSON.parse(extractThird.choices[0].message.content!);

  console.log("Third output :", thirdOutput);

  // Merge the two outputs
  const mergedOutputs = {
    ...primaryOutput,
    ...secondaryOutput,
    ...thirdOutput,
  };

  const { error } = await supabase
    .from("job_postings")
    .update({ static: mergedOutputs }) // Only updating the 'static' column
    .match({ jd_uuid: jobDescriptionID });

  if (error) {
    console.error(error);
    return {
      message: "Failed to update static points.",
      success: false,
    };
  }

  return {
    message: "Success",
    success: true,
  };
}
