"use server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { zodToJsonSchema } from "zod-to-json-schema";
import { titleChoicesSchema } from "@/lib/dashboard/panels/schema/title";
import OpenAI from "openai";

// Init TogetherAI
const togetherai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

export async function TitleOptions(
  jobID: string
) {
  console.log("TitleOptions function called");
  const cookiesStore = cookies();
  const client = createClient(cookiesStore);

  const jsonSchema = zodToJsonSchema(titleChoicesSchema, "JobTitleChoices");

  const { data, error } = await client
    .from("job_postings")
    .select("static, inferred")
    .eq("jd_id", jobID);

  if (error) {
    console.error(error);
    return;
  }

  const staticData = data[0].static;
  const inferredData = data[0].inferred;

  // mege the two data sets
  const mergedData = { ...staticData, ...inferredData };

  // From the new array, extract the 'title', 'description', 'responsibilities', 'skills', 'preferredSkills' ojects and create new JSON object
  const titleData = {
    title: mergedData.jobTitle,
    description: mergedData.description,
    responsibilities: mergedData.responsibilities,
    skills: mergedData.skills,
    preferredSkills: mergedData.preferredSkills,
  };

  const jobDescription = JSON.stringify(titleData);

  // Call TogetherAI to generate potential job titles
  const sysPrompt = `Use the follow data of a job description to generate 6 great potential job titles that can be used on a job recruiting platform. Job titles should be exciting and appealing to candidates. Return your response in JSON format.`;

  const extract = await togetherai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: sysPrompt,
      },
      {
        role: "user",
        content: `Job Description: ${jobDescription}`,
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    max_tokens: 4000,
    temperature: 0.75,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jsonSchema },
  });

  const output = JSON.parse(extract.choices[0].message.content!);
  
  return output;
}
