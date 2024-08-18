import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { zodToJsonSchema } from "zod-to-json-schema";
import { jobDescriptionBuilderSchema } from "@/lib/jd-builder/schema/jdBuilderSchema";
import { Parser } from "htmlparser2";

interface ContextItem {
  id: number;
  content: string;
  metadata?: any;
  similarity?: number;
}

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

  const company_introduction =
    intro && intro.length > 0 ? intro[0].content : "";

  const { data: benefits, error: benefitError } = await supabase
    .from("collections")
    .select("content")
    .eq("type", "benefits")
    .eq("owner", owner)
    .eq("primary", true);

  if (benefitError) {
    throw new Error(benefitError.message);
  }

  const company_benefits =
    benefits && benefits.length > 0 ? benefits[0].content : "";

  // Consolidate the context gathering
  const contextQueries = [
    `Tell me about role ${role_name}?`,
    `What are the responsibilities of the ${role_name} based on the scope of work?`,
    `What are requirements for the personnel role ${role_name}?`,
  ];

  const contextResults = await Promise.all(
    contextQueries.map(async (query) => {
      const embeddingsResponse = await togetherAi.embeddings.create({
        model: "togethercomputer/m2-bert-80M-8k-retrieval",
        input: query,
      });

      const embeddings = embeddingsResponse.data[0].embedding;

      const filter = { owner: owner, sowId: sowId };

      const { data: context } = await supabase.rpc("sow_builder", {
        filter: filter,
        query_embedding: embeddings,
        match_count: 15,
        threshold: 0.4,
      });

      return (context as ContextItem[]).map(({ id, content }) => ({
        id,
        content,
      }));
    })
  );

  const finalSysPrompt = `
  Using the provided context, create a comprehensive and compelling job description for the role of ${role_name}. 
  This job description will be used to attract and recruit top candidates for the role. Ensure that the job description is clear, complete, and written in a professional and engaging manner. 
  
  Include the following sections:
  - Job Title: Clearly state the job title.
  - Job Description: Provide an overview of the role, including its purpose, primary functions, and how it fits within the organization.
  - Responsibilities: List the key responsibilities and duties associated with the role. Be specific and use bullet points to ensure clarity.
  - Required Qualifications: Outline the essential qualifications, skills, and experience required for the role. Include educational requirements, technical skills, and any certifications needed.
  - What We Offer: List the benefits and offerings provided by the company for this position.
  
  Optional sections (include if relevant information is available):
  - Additional Responsibilities: List any additional responsibilities or duties that may be required for the role.
  - Preferred Qualifications: List any additional qualifications, skills, or experience that would be advantageous but are not strictly necessary.

  Use persuasive language to highlight the opportunity and ensure the tone is aligned with the company's culture and values. The job description should be structured to be easily readable and should encourage potential candidates to apply.

  The context provided includes information from the SOW/PWS given to the user for writing the job description. However, the job description should be written generically to recruit for the role without revealing the client's identity or specific tasks.

  Output the job description as a JSON object strictly adhering to the provided schema. Do not include any explanations or comments outside the JSON structure.
  `;

  const finalContextPrompt = `Context: ${JSON.stringify(contextResults)}
  
  ${company_benefits ? `Benefits: ${company_benefits}` : ""}`;

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
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    max_tokens: 5000,
    temperature: 0.5,
    // @ts-ignore – Together.ai supports schema while OpenAI does not
    response_format: { type: "json_object", schema: jdSchema },
  });

  const output = JSON.parse(finalExtract.choices[0].message.content!);

  // Convert the company introduction to plain text
  const plainCompanyIntroductionText = htmlToPlainText(company_introduction);

  // Add plainCompanyIntroductionText to the output with the key 'companyIntroduction'
  output.companyIntroduction = plainCompanyIntroductionText;

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

function htmlToPlainText(html: string): string {
  let text = "";
  let inList = false;

  const parser = new Parser(
    {
      ontext(data) {
        text += data;
      },
      onopentag(name) {
        if (name === "br") {
          text += "\n";
        } else if (name === "ul" || name === "ol") {
          inList = true;
        } else if (name === "li") {
          if (inList) {
            text += "\n- ";
          }
        }
      },
      onclosetag(name) {
        if (name === "p") {
          text += "\n";
        } else if (name === "ul" || name === "ol") {
          inList = false;
          text += "\n";
        }
      },
    },
    { decodeEntities: true }
  );

  parser.write(html);
  parser.end();

  return text.trim();
}
