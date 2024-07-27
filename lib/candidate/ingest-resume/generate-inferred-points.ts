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

  const systemPrompt = `You are a resume analyst with expertise in career development and job market trends. Your task is to analyze the provided resume and extract key insights about the candidate's potential. Focus on identifying transferable skills and possible career paths based on the candidate's experience and qualifications. 

Adhere to these guidelines:
1: Your response must be in JSON format, strictly adhering to the provided JSON schema.
1. Analyze the entire resume thoroughly, considering all aspects of the candidate's background.
2. Infer soft skills and potential roles based solely on the information provided in the resume.
3. Do not invent or assume any details not explicitly stated or strongly implied by the resume content.
4. Provide your analysis in a structured format that matches the given schema exactly.
5. If you cannot confidently infer information for a field, omit it from your output.
6. Ensure all inferred information is directly relevant to the candidate's professional profile.

Your output must strictly conform to the provided JSON schema, including only the fields specified and respecting their optionality.

    Guidelines:
    - soft_skills (optional): Review all past job history to determine soft skills that can be inferred from the candidate's work experience. List up to 10 soft skills without descriptions.
    - potential_roles (optional): Review all past job history to determine potential roles the candidate would be a good fit for based on past experience and industry experience. List up to 15 roles without descriptions.

    Be concise and only include relevant information from the provided resume. Omit any fields for which no information is available.`;

  const userPrompt = `Resume: 
  ${JSON.stringify(resume)}`;

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
      temperature: 0.6,
      max_tokens: 5000,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchema },
    });

    const output = JSON.parse(extract.choices[0].message.content!);

    const { error } = await supabase
      .from("candidate_create")
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
