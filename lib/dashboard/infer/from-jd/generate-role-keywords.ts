"use server";
import { OpenAI } from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { jobRoleKeywordSchema } from "@/lib/dashboard/infer/from-jd/schema/keyworld-builder";

const jsonSchema = zodToJsonSchema(jobRoleKeywordSchema, "KeywordSchema");

interface JobDescription {
  skills: string[];
  jobType: string;
  education: string[];
  experience: string;
  locationType: string;
  certifications: string[];
  clearanceLevel: string;
  qualifications: string[];
  preferredSkills: string[];
  responsibilities: string[];
}

interface KeywordResponse {
  similarJobTitle: string[];
}

export async function generateJobRoleKeywords(
  jobDesc: JobDescription
): Promise<KeywordResponse> {
  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const systemPrompt = `Your task is to build a list of up to 10 additional role/job titles that fit the given Job Description.

- Use the responsibilities and qualifications in the job description to help narrow down the roles.
- You don't need to be overly specific, such as listing specific technologies.
- Focus on identifying roles that broadly match the job description.
- The goal is to generate keywords that users can find when searching for a job. We want relevant matches but not so specific that they are rarely searched for.
    
    Response Rule: Your answer must strictly be valid JSON only. The roles will be a JSON array.
    
    Required Response JSON Format: 
    {
    "similarJobTitle": [
    ...roles here
    ]
    }`;

  const userPrompt = `<JobDescription>
    ${JSON.stringify(jobDesc)}
    </JobDescription>`;
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
      max_tokens: 3000,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchema },
    });

    if (!extract.choices[0].message.content) {
      throw new Error("No content in the API response");
    }

    return JSON.parse(extract.choices[0].message.content) as KeywordResponse;
  } catch (error) {
    console.error("Error generating or processing keywords:", error);
    throw new Error("Failed to generate or process keywords");
  }
}
