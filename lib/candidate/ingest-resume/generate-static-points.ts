"use server";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { staticSchema, staticSchemaSecondary } from "./data/staticSchema";
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

  const systemPrompt = `The following context is a resume. Your task is to extract details about the resume. Your response must strictly be in JSON format and adhere to the provided JSON schema. If a field is not present or applicable based on the resume, do not include it in the JSON output. 

  Guidelines:
  - name: Full name of the candidate.
  - title: A suitable role name for the candidate, based on their overall experience and qualifications.
  - company: (optional) Name of the candidate's current or most recent company.
  - phone: (optional) Must be exactly 10 digits with no spaces, hyphens, or parentheses (e.g., "1234567890").
  - email: (optional) The candidate's email address.
  - education: An array of objects, each containing:
    - institution: Name of the educational institution.
    - degree: The degree or qualification obtained.
    - start_date: (optional) The start date of the education in the format "YYYY-MM" (e.g., "2018-09").
    - end_date: (optional) The end date of the education in the format "YYYY-MM" (e.g., "2022-06"). Use "present" for ongoing education.
  - location: An object containing city (optional), state (two letter abbreviation) (optional), and zipcode (optional).
  - technical_skills: An array of strings listing hard skills, tools, and technologies from previous work experience.
  - industry_experience: (optional) An array of strings listing specific knowledge areas in which the candidate has experience.
  - clearance_level: (optional) If applicable, should be one of: "none", "basic", "confidential", "critical", "paramount", "q_clearance", or "l_clearance".
  - professional_certifications: (optional) An array of objects, each containing:
    - name: Name of the certification.
    - issuing_organization: (optional) Organization that issued the certification.
    - date_obtained: (optional) Date when the certification was obtained in "YYYY-MM" format (e.g., "2017-07").
    - expiration_date: (optional) Expiration date of the certification, if applicable, in "YYYY-MM" format.
    - credential_id: (optional) Unique identifier for the certification, if available.
  
  Important notes:
  1. For all dates, always use the "YYYY-MM" format. If only a year is provided, use "YYYY-01" to represent January of that year.
  2. Do not make up any details or include fields that are not specified in the schema.
  3. Be concise and only include relevant information from the provided resume.
  4. Omit any fields for which no information is available.
  5. Ensure that all dates across the resume (including work experience) follow the "YYYY-MM" format for consistency.`;

  const systemPromptSecondary = `The following context is a resume. Your task is to extract the previous experience / job details from the resume. Your response must strictly be in JSON format and adhere to the provided JSON schema. If a field is not present or applicable based on the resume, do not include it in the JSON output.

  Guidelines:
  - work_experience: An array of objects, each containing the following properties:
    - organization: The name of the organization.
    - job_title: The job title.
    - description: A detailed and complete description of the job, including all relevant details and responsibilities.
    - start_date: The start date of the job in "YYYY-MM" format. Omit this field if not present in resume.
    - end_date: The end date of the job in "YYYY-MM" format, or "present" for current jobs. Omit this field if not present in resume.
  
  CRITICAL DATE FORMATTING RULE:
  All dates in the 'work_experience' array MUST be converted to the "YYYY-MM" format or "present" for current jobs. No other date formats are allowed. Follow these strict guidelines:
  
  1. All dates must be in "YYYY-MM" format (e.g., "2021-03") or "present" for current jobs.
  2. If a full date is provided (e.g., "March 15, 2021"), convert it to "YYYY-MM" (e.g., "2021-03").
  3. If only a month and year are provided (e.g., "March 2021"), convert it to "YYYY-MM" (e.g., "2021-03").
  4. If only a year is provided (e.g., "2021"), use "YYYY-01" to represent January of that year (e.g., "2021-01").
  5. For current jobs, use "present" as the end_date.
  6. If a season is mentioned, use the following mapping:
     - Spring: Use "-03" (March)
     - Summer: Use "-06" (June)
     - Fall/Autumn: Use "-09" (September)
     - Winter: Use "-12" (December)
     Example: "Summer 2021" would become "2021-06"
  
  Do not include any dates in their original format or any format other than "YYYY-MM" or "present" for current jobs. If a date cannot be confidently converted to this format, omit it from the output.
  
  Include all relevant information from bullet points or lists of responsibilities in the description field.
  
  Do not make up details that are not present in the resume. Omit any values for which no information is available.`;

  const userPrompt = `<Context> 
  ${JSON.stringify(resume)}
  </Context>`;

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
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      temperature: 0.6,
      max_tokens: 6000,
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
      model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
      temperature: 0.6,
      max_tokens: 6000,
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
