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

export async function generateLiftedInferred(resume: string, id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const systemPrompt =
    `The following context is a resume. Your task is to use your knowlege to infer details about the resume and provide the information in JSON format, strictly adhering to the provided JSON schema. If a field cannot be inferred or is not applicable based on the resume, do not include it in the JSON output. Do not make up any details or include fields that are not specified in the schema. 
    
    Guidelines:
    -soft_skills: you need to review all the past job history to determine soft skills that can be inferred from the candidate's work experience. List the soft skill, do not include a description. Max of 10 soft skills.
    -manager_trait: provide a boolean value and a concise explanation. You need to review all the past job history to determine if the applicant can perform a supervisor and management role based on previous experience and tenure.
    -potential_roles: you need to review all the past job history to determine potential roles the candidate would be a good fit for based on past experience and industry experience. List the role only, do not include a description. Max of 10 potential roles.

    Be concise and only include relevant information from the provided resume. Omit any fields for which no information is available.`;

  const userPrompt = `Context: ${JSON.stringify(resume)}`;

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
      model: "togethercomputer/CodeLlama-34b-Instruct",
      temperature: 0.6,
      max_tokens: 3900,
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
      console.error("Error upserting data:", error);
      return {
        message: "Failed to insert inferred points.",
        success: false,
      };
    }

    return {
      message: "Success",
      success: true,
    };
  } catch (error) {
    console.error("Error generating lifted inferred:", error);
    return {
      message: "Failed to generate lifted inferred.",
      success: false,
    };
  }
}
