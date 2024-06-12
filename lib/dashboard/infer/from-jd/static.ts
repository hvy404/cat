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
  "JDSchemaPrimary"
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

  const systemPrompt = `The following context is a job description. Your task is to extract details about the job opportunity. Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. Your answer must be in JSON format.`;
  const systemPrompt3 = `The following context is a job description. Your task is to extract details about the job opportunity. Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. You will respond in JSON format.`;

  let primaryOutput, secondaryOutput, thirdOutput;

  try {
    console.log("Extracting primary details...");
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

    primaryOutput = JSON.parse(extract.choices[0].message.content!);

    //console.log("Primary output: ", primaryOutput);
  } catch (error) {
    console.error("Error in primary extraction:", error);
    return {
      message: "Failed to extract primary details.",
      success: false,
    };
  }

  try {
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

    secondaryOutput = JSON.parse(extractSecondary.choices[0].message.content!);
    //console.log("Secondary output: ", secondaryOutput);
  } catch (error) {
    console.error("Error in secondary extraction:", error);
    return {
      message: "Failed to extract secondary details.",
      success: false,
    };
  }

  try {
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
      model: "mistralai/Mistral-7B-Instruct-v0.1",
      temperature: 0.45,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchemaThird },
    });

    thirdOutput = JSON.parse(extractThird.choices[0].message.content!);
    //console.log("Third output :", thirdOutput);
  } catch (error) {
    console.error("Error in third extraction:", error);
    return {
      message: "Failed to extract third details.",
      success: false,
    };
  }

  // Merge the outputs
  const mergedOutputs = {
    ...primaryOutput,
    ...secondaryOutput,
    ...thirdOutput,
  };

  try {
    const { error } = await supabase
      .from("job_postings")
      .update({ static: mergedOutputs }) // Only updating the 'static' column
      .match({ jd_uuid: jobDescriptionID });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error updating job posting:", error);
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
