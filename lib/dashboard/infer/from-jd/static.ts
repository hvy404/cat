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

  const systemPrompt = `The following context is a job description. Your task is to extract details about the job opportunity. 
  
  Guidelines:
  - jobTitle: the title or name of the job opportunity
  - company: name of the company posting the job and doing the hiring
  - client: (optional) the client company where the applicant might be placed. this is typically applicable for pro-services companies
  - locationType: (optional) the type of location for the job, e.g., Remote, Onsite, Hybrid
  - location: (optional) the city, state, and zip code of the job location if applicable and an onsite job
    - city: the city of the job location
    - state: the state of the job location. e.g., CA
    - zipcode: the zip code of the job location
  - jobType: type of employment, e.g., Full-time, Part-time, Contract, Temporary
  - salaryRange: (optional) the salary range for the job
    - startingSalary: the starting salary for the position
    - maximumSalary: the maximum salary offered for the position
  - commissionPay: (optional) whether the job offers commission pay such as OTE (On Target Earnings)
  - commissionPercent: (optional) if commission pay is offered, specify the commission percentage for the job
  - oteSalary: (optional) if commission pay is offered, specify the OTE (On Target Earnings) salary for the job
  - benefits: (optional) list of benefits offered with the job, like health insurance, retirement plans, etc.
  - applicationDeadline: (optional) deadline for submissions. Only include if specified in the job description context
  - clearanceLevel: (optional) the required clearance level if the job requires a clearance

  Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. Your answer must be in JSON format.`;

  const systemPrompt2 = `The following context is a job description. Your task is to extract details about the job opportunity. 
  
  Guidelines:
  - responsibilities: list of responsibilities and tasks associated with the job
  - qualifications: list of required qualifications such as specific knowledge areas
  - education: (optional) list of required education levels or degrees for the job
  - certifications: (optional) list of required certifications or licenses for the job
  - skills: list of required hard skills, such as software proficiency, languages, or technical skills
  - experience: (optional) experience required for the job, typically specified in years or range
  - preferredSkills: you will need to review the job requirements and determine a list of preferred skills and experience that may be beneficial for the job
  
  Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. Your answer must be in JSON format.`;

  const systemPrompt3 = `The following context is a job description. Your task is to extract details about the job opportunity. 

  Guidelines:
  - summary: (optional) you will need to review the job description to provide a concise summary of the job role and main responsibilities
  
  Only include details in your response for which there is relevant information available in the job description provided. Do not make up any details. You will respond in JSON format.`;

  const userPrompt = `Context: ${JSON.stringify(jdRaw)}`;

  let primaryOutput, secondaryOutput, thirdOutput;

  try {
    console.log("Extracting primary details...");
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
      response_format: { type: "json_object", schema: jsonSchemaPrimary },
    });

    primaryOutput = JSON.parse(extract.choices[0].message.content!);

    //console.log("Primary output: ", primaryOutput);
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
          content: JSON.stringify(jdRaw),
        },
      ],
      model: "togethercomputer/CodeLlama-34b-Instruct",
      temperature: 0.4,
      max_tokens: 7500,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchemaSecondary },
    });

    secondaryOutput = JSON.parse(extractSecondary.choices[0].message.content!);
    //console.log("Secondary output: ", secondaryOutput);
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
          content: JSON.stringify(jdRaw),
        },
      ],
      model: "togethercomputer/CodeLlama-34b-Instruct",
      temperature: 0.45,
      max_tokens: 7500,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchemaThird },
    });

    thirdOutput = JSON.parse(extractThird.choices[0].message.content!);
    //console.log("Third output :", thirdOutput);
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
      .match({ jd_uuid: jobDescriptionID });

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
