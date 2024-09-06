"use server";

import { z } from "zod";
import OpenAI from "openai";
import { zodToJsonSchema } from "zod-to-json-schema";

const enrichmentSchema = z.object({
  technical_skills: z
    .array(z.string())
    .describe("List candidate technical skills"),
  industry_experience: z
    .array(z.string())
    .describe("List of candidate industry experiences"),
});

export type EnrichmentData = z.infer<typeof enrichmentSchema>;

export async function enrichStatic(candidateData: any) {
  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const jsonSchema = zodToJsonSchema(enrichmentSchema, "JDSchema");

  // Call OpenAI
  try {
    const systemPrompt = `You are an AI assistant tasked with enriching candidate data based on their resume information. Your job is to:

    1. Review the candidate's past experience and jobs.
    2. Determine the technical skills they have mentioned or would need to perform their previous roles.
    3. Infer the industries they have worked in based on their previous jobs.
    
    Use the provided Candidate Resume to generate a JSON output with the following structure:
    
    {
      "technical_skills": [
        "Skill 1",
        "Skill 2",
        ...
      ],
      "industry_experience": [
        "Industry 1",
        "Industry 2",
        ...
      ]
    }

    Important: Limit each category to a maximum of 5 items, prioritizing the most relevant and significant ones.
    
    Ensure your response is in valid JSON format and includes only the requested fields.`;

    const userPrompt = `<CandidateResume>
      ${JSON.stringify(candidateData, null, 2)}
      </CandidateResume>
      `;

    const enrichment = await togetherai.chat.completions.create({
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
      max_tokens: 4000,
      // @ts-ignore – Together.ai supports schema while OpenAI does not
      response_format: { type: "json_object", schema: jsonSchema },
    });

    const enrichmentOutput: EnrichmentData = JSON.parse(
      enrichment.choices[0].message.content!
    );

    return enrichmentOutput;
  } catch (error) {
    console.error("Error in enrichment:", error);
    throw new Error("Failed to enrich candidate data.");
  }
}
