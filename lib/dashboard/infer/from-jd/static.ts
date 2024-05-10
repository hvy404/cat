"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  jobDescriptionStaticSchema,
  jobDescriptionStaticSecondarySchema,
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

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function generateJDStatic(jdRaw: string, jobDescriptionID: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  console.log("Generating static points from JD");

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
    response_format: { type: "json_object", schema: jsonSchemaPrimary },
  });

  const primaryOutput = JSON.parse(extract.choices[0].message.content!);
  console.log(primaryOutput);

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
    temperature: 0.3,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchemaSecondary },
  });

  const secondaryOutput = JSON.parse(
    extractSecondary.choices[0].message.content!
  );

  console.log(secondaryOutput);

  // Merge the two outputs
  const mergedOutputs = { ...primaryOutput, ...secondaryOutput };

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
