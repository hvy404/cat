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
import {
  systemPrompt,
  systemPrompt2,
  systemPrompt3,
} from "@/lib/dashboard/infer/from-jd/static-prompt";

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

  const userPrompt = `<JobDescription>
  ${JSON.stringify(jdRaw)}
  </JobDescription>`;

  let primaryOutput, secondaryOutput, thirdOutput;

  try {
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
      response_format: { type: "json_object", schema: jsonSchemaPrimary },
    });


    primaryOutput = JSON.parse(extract.choices[0].message.content!);
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
          content: systemPrompt2,
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
      response_format: { type: "json_object", schema: jsonSchemaSecondary },
    });

    //console.log("Secondary details extracted:", extractSecondary);

    secondaryOutput = JSON.parse(extractSecondary.choices[0].message.content!);
    //console.log("Secondary details:", secondaryOutput);
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
          content: userPrompt,
        },
      ],
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      temperature: 0.4,
      max_tokens: 4000,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchemaThird },
    });

    //console.log("Third details extracted:", extractThird);

    thirdOutput = JSON.parse(extractThird.choices[0].message.content!);
    //console.log("Third details:", thirdOutput);
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
      .match({ jd_id: jobDescriptionID });

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
