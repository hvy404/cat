"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { staticSchema } from "./data/staticSchema";
import { staticSchemaSecondary } from "./data/staticSchemaSecondary";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const jsonSchema = zodToJsonSchema(staticSchema, "ResumeSchema");
const jsonSchemaSecondary = zodToJsonSchema(
  staticSchemaSecondary,
  "ResumeSchemaSecondary"
);

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
- technical_skills: An array of strings listing hard skills, tools, and technologies from previous work experience.
- industry_experience: (optional) An array of strings listing specific knowledge areas in which the candidate has experience.
- clearance_level: (optional) If applicable, should be one of: "none", "basic", "confidential", "critical", "paramount", "q_clearance", or "l_clearance".
- professional_certifications: (optional) An array of strings listing professional certifications. These are industry certifications that the candidate has earned and not academic degrees.

Do not make up any details or include fields that are not specified in the schema. Be concise and only include relevant information from the provided resume. Omit any fields for which no information is available.`;

  const systemPromptSecondary = `The following context is a resume. Your task is to extract the previous experience / job details from the resume and provide the information in JSON format, strictly adhering to the provided JSON schema. If a field is not present or applicable based on the resume, do not include it in the JSON output. 

Guidelines:
- work_experience: An array of objects, each containing the following properties:
  - organization: The name of the organization.
  - job_title: The job title.
  - description: A detailed and compelete description of the job, including all relevant details and responsibilities.
  - start_date: The start date of the job (optional).
  - end_date: The end date of the job (optional).

Note: The resume may include bullet points or lists of responsibilities for each respective experience. You should include all relevant information in the description field.

Do not make up any details or include fields that are not specified in the schema.`;

  const userPrompt = `Context: ${JSON.stringify(resume)}`;

  let primaryOutput, secondaryOutput;

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
      max_tokens: 5000,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchema },
    });

    primaryOutput = JSON.parse(extract.choices[0].message.content!);

    // End of call 1

    // Start of call 2
    const extractSecondary = await togetherai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPromptSecondary,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      model: "togethercomputer/CodeLlama-34b-Instruct",
      temperature: 0.6,
      max_tokens: 5000,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchemaSecondary },
    });

    secondaryOutput = JSON.parse(extractSecondary.choices[0].message.content!);

    // merge primary and secondary outputs
    const output = { ...primaryOutput, ...secondaryOutput };

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
