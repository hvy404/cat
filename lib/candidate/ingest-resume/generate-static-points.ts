"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { staticSchema } from "./data/staticSchema";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const jsonSchema = zodToJsonSchema(staticSchema, "ResumeSchema");

const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function generateLiftedStatic(resume: string, id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const systemPrompt = `The following context is a resume. Your task is to extract details about the resume and provide the information in JSON format, strictly adhering to the provided JSON schema. If a field is not present or applicable based on the resume, do not include it in the JSON output. 

Guidelines:
- name: Full name of the candidate.
- title: A suitable role name for the candidate, either from their most recent position or based on their overall former roles.
- company: (optional) Name of the candidate's current or most recent company.
- contact: (optional) An object containing phone (optional) and email.
- education: An array of objects, each containing institution name, degree, start_date, and end_date (optional) as properties.
- location: An object containing city (optional), state (two letter abbreviation) (optional), and zipcode (optional). Example values: city: "Atlanta", state: "GA", zipcode: "30363".
- work_experience: An array of objects, each containing organization name, job_title, brief description of responsibilities, start_date (optional), and end_date (optional) as properties.
- technical_skills: An array of strings listing hard skills, tools, and technologies from previous work experience.
- industry_experience: (optional) An array of strings listing specific knowledge areas in which the candidate has experience.
- clearance_level: (optional) If applicable, should be one of: "none", "basic", "confidential", "critical", "paramount", "q_clearance", or "l_clearance".
- professional_certifications: (optional) An array of strings listing professional certifications.

Do not make up any details or include fields that are not specified in the schema. Be concise and only include relevant information from the provided resume. Omit any fields for which no information is available.`;

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
      temperature: 0.4,
      max_tokens: 7000,
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
      console.error("Error upserting data:", error);
      return {
        message: "Failed to insert static points.",
        success: false,
      };
    }

    return {
      message: "Success",
      success: true,
    };
  } catch (error) {
    console.error("Error generating lifted static:", error);
    return {
      message: "Failed to generate lifted static.",
      success: false,
    };
  }
}
