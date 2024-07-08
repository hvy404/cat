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

export async function generateJDInferred(
  jdRaw: string,
  jobDescriptionID: string
) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const systemPrompt = `The following context is a job description. Your task is to extract details about the job opportunity according to the provided schema.

  Guidelines:

  - leadershipOpportunity: (optional) potential for leadership roles or responsibilities, inferred from the job title and key responsibilities
  - advancementPotential: (optional) potential for professional growth and advancement, inferred from the job description and company overview
  - remoteFlexibility: (optional) potential for remote work or flexibility in work location, explicitly mentioned or implied
  - technicalDemand: (optional) level of technical expertise required, inferred from the qualifications and skills listed
  - suitablePastRoles: (optional) a list of past roles or job titles that may align well with the demands and responsibilities of this job

  For each of the above points, you will need to review the job description and infer the relevant details.
  
  Only include details in your response for which there is relevant information available in the job description provided. You are to infer details from the context but you may not make any details up. Your answer must be in JSON format.`;

  const userPrompt = `Context: ${JSON.stringify(jdRaw)}`;

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
    model: "togethercomputer/CodeLlama-34b-Instruct",
    temperature: 0.4,
    max_tokens: 7500,
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
