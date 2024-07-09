"use server";
import { OpenAI } from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const systemPrompt = `Your task is to build a list of up to 25 additional role/job titles that fit the given Job Description.

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
      model: "meta-llama/Llama-3-70b-chat-hf",
      temperature: 0.6,
      max_tokens: 3900,
    });

    if (!extract.choices[0].message.content) {
      throw new Error("No content in the API response");
    }

    const detectedRoles = JSON.parse(
      extract.choices[0].message.content
    ) as KeywordResponse;

    if (!Array.isArray(detectedRoles.similarJobTitle)) {
      throw new Error(
        "Invalid response format: similarJobTitle is not an array"
      );
    }

    return detectedRoles;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Error parsing JSON response", error);
      throw new Error(
        "Failed to parse the generated keywords. The response was not valid JSON."
      );
    } else if (error instanceof Error) {
      console.error("Error generating keywords", error);
      throw new Error(`Failed to generate keywords: ${error.message}`);
    } else {
      console.error("Unknown error", error);
      throw new Error("An unknown error occurred while generating keywords.");
    }
  }
}
