"use server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { zodToJsonSchema } from "zod-to-json-schema";
import { jobDescriptionBuilderSchema } from "@/lib/jd-builder/schema/jdBuilderSchema";

interface ContextItem {
  id: number;
  content: string;
  metadata?: any;
  similarity?: number;
}

/**
 * Retrieves the job description for a specific role and generates a comprehensive and compelling job description.
 * The generated job description is stored in the database and returned as a success response.
 *
 * @param owner - The owner of the job description.
 * @param role_name - The name of the role.
 * @param sowId - The ID of the Statement of Work (SOW).
 * @returns An object indicating the success of the operation and the ID of the generated job description.
 * @throws An error if there is an issue with retrieving or generating the job description.
 */

export async function getJobDescription(
  owner: string,
  role_name: string,
  sowId: string
) {
  const jdSchema = zodToJsonSchema(
    jobDescriptionBuilderSchema,
    "jobDescription"
  );

  // Generate UUID for the job description
  const jobDescriptionUUID = uuidv4();

  const togetherAi = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Add Generated JD entry to the database
  const { error: jdError } = await supabase.from("sow_jd_builder").insert([
    {
      job_description_id: jobDescriptionUUID,
      sow_id: sowId,
      role_name: role_name,
      is_published: false,
    },
  ]);

  if (jdError) {
    throw new Error(jdError.message);
  }

  let role_job_description = "";
  let role_responsibilities = "";
  let role_required_qualifications = "";
  let company_introduction = "";
  let company_benefits = "";

  /* Fetch preset introduction and employee benefits from database if available */
  const { data: intro, error: introError } = await supabase
    .from("collections")
    .select("content")
    .eq("type", "intro")
    .eq("owner", owner)
    .eq("primary", true);

  if (introError) {
    throw new Error(introError.message);
  }

  if (intro && intro.length > 0) {
    company_introduction = intro[0].content;
  }

  const { data: benefits, error: benefitError } = await supabase
    .from("collections")
    .select("content")
    .eq("type", "benefits")
    .eq("owner", owner)
    .eq("primary", true);

  if (benefitError) {
    throw new Error(benefitError.message);
  }

  if (benefits && benefits.length > 0) {
    company_benefits = benefits[0].content;
  }
  /* End fetch preset introduction and employee benefits from database if available */

  const jdBuilderLookup = [
    {
      key: "role_job_description",
      question: `Tell me about role ${role_name}?`,
      sysPrompt: `Use the provided context to write the job description summary for the role ${role_name}.`,
    },
    {
      key: "role_responsibilities",
      question: `What are the responsibilites of the ${role_name} based on the scope of work?`,
      sysPrompt: `Use the provided context to identify the responsibilities for the role ${role_name}.`,
    },
    {
      key: "role_required_qualifications",
      question: `What are requirements for the personnel role ${role_name}?`,
      sysPrompt: `Use the provided context to write a list of requirements such as education, experience and certifications required for the role ${role_name}.`,
    },
  ];

  for (const item of jdBuilderLookup) {
    const embeddingsResponse = await togetherAi.embeddings.create({
      model: "togethercomputer/m2-bert-80M-8k-retrieval",
      input: item.question,
    });

    const embeddings = embeddingsResponse.data[0].embedding;

    const filter = { owner: owner, sowId: sowId };

    const { data: context } = await supabase.rpc("sow_builder", {
      filter: filter,
      query_embedding: embeddings,
      match_count: 15,
      threshold: 0.4,
    });

    const optimizedResults = (context as ContextItem[]).map(
      ({ id, content }) => ({ id, content })
    );

    const jdLookupSummarizer = await togetherAi.chat.completions.create({
      messages: [
        {
          role: "system",
          content: item.sysPrompt,
        },
        {
          role: "user",
          content: `Context: ${JSON.stringify(optimizedResults)}`,
        },
      ],
      model: "meta-llama/Llama-3-70b-chat-hf",
      temperature: 0.55,
    });

    const output = jdLookupSummarizer.choices[0].message.content!;

    //console.log("Intermediate Output:", item.key, output);

    // Store the output based on the key
    if (item.key === "role_job_description") {
      role_job_description = output;
    } else if (item.key === "role_responsibilities") {
      role_responsibilities = output;
    } else if (item.key === "role_required_qualifications") {
      role_required_qualifications = output;
    }
  }

  const finalSysPrompt = `
  Using the provided context, create a comprehensive and compelling job description for the role of ${role_name}. 
  This job description will be used to attract and recruit top candidates for the role. Ensure that the job description is clear, 
  complete, and written in a professional and engaging manner. Include the following sections:
  
  **Job Title**: Clearly state the job title.

  ${
    company_introduction
      ? `**Company Introduction**: Provides a brief introduction to the company. Only include the Company Introduction if its provided in the context otherwise do not include it. You may summarize the statement given in the context but you may not add any additional information.`
      : ""
  }
  
  **Job Description**: Provide a detailed overview of the role, including its purpose, primary functions, and how it fits 
     within the organization.
  
  **Responsibilities**: List the key responsibilities and duties associated with the role. Be specific and use bullet points 
     to ensure clarity.
  
  **Required Qualifications**: Outline the essential qualifications, skills, and experience required for the role. Include 
     educational requirements, technical skills, and any certifications needed.
  
  **Preferred Qualifications**: Based on your experience, list any additional qualifications, skills, or experience that would be advantageous but 
     are not strictly necessary. This may not be directly given in the context therefore you can use your own judgement.
  
  Use persuasive language to highlight the opportunities and benefits of the role, and ensure the tone is aligned with the 
  company's culture and values. The job description should be structured to be easily readable and should encourage potential 
  candidates to apply.

  The context provided includes information from the SOW/PWS given to the user for writing the job description. However, the job description should be written generically to recruit for the role without revealing the client's identity or specific tasks.
  `;

  // Ternary to include Company Introduction and Benefits if available
  const finalContextPrompt = `Context: 

  ${
    company_introduction
      ? `Company Introduction: ${company_introduction}\n`
      : ""
  }

  Job Description: ${role_job_description} 

  Responsibilities: ${role_responsibilities} 

  Requirements: ${role_required_qualifications}
  
  ${company_benefits ? `Benefits: ${company_benefits}` : ""}`;

  //console.log("Final Context Prompt:", finalContextPrompt);
  //console.log("Final System Prompt:", finalSysPrompt);

  // Generate the final job description

  const finalExtract = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: finalSysPrompt,
      },
      {
        role: "user",
        content: finalContextPrompt,
      },
    ],
    model: "meta-llama/Llama-3-70b-chat-hf",
    temperature: 0.5,
  });

  const finalOutput = finalExtract.choices[0].message.content!;

  // Convert the final output to a JSON object
  // We use two LLM because the first model is better at generating the job description and the second model is better at converting it to JSON
  // TOOD: Update to use a single model when the API supports it
  const convertToJSONPrompt = `You are a helpful AI assistant. Convert the following job description into a JSON object according to the provided schema. Ensure that all sections of the job description are accurately represented in the JSON object without altering the content. Do not add any HTML or Markdown formatting.
  
  Use the following as a guide to map the job description to the JSON schema:

- jobTitle: A string representing the job title of the position.
${
  company_introduction
    ? `- companyIntroduction: A string providing an introduction to the company. This should be verbatim from **Company Introduction** and nothing else.`
    : ""
}
- jobDescription: A string providing an introduction to the job opportunity. This should be verbatim from **Job Description** and nothing else.
- responsibilities: An array of strings listing the responsibilities for the position.
- additionalResponsibilities: An optional array of strings listing any additional responsibilities for the position.
- requiredQualifications: An array of strings listing the required qualifications for the position.
- preferredQualifications: An optional array of strings listing the preferred qualifications for the position.
${
  company_benefits
    ? `- whatWeOffer: An array of strings detailing the benefits and offerings of the position.`
    : ""
}`;

  const jdJSON = await togetherAi.chat.completions.create({
    messages: [
      {
        role: "system",
        content: convertToJSONPrompt,
      },
      {
        role: "user",
        content: `Job Description: ${finalOutput}`,
      },
    ],
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    temperature: 0.01,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jdSchema },
  });

  const output = JSON.parse(jdJSON.choices[0].message.content!);

  // Add output to the database by updating the entry's 'generated_jd' column
  const { error: updateError } = await supabase
    .from("sow_jd_builder")
    .update({ generated_jd: output })
    .eq("job_description_id", jobDescriptionUUID);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    success: true,
    jd_id: jobDescriptionUUID,
  };
}
