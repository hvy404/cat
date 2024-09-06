"use server";
import { extendedInferredSchema } from "@/lib/candidate/manual-resume-upload/combined-schema-infer-intro";
import { zodToJsonSchema } from "zod-to-json-schema";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

/**
 * Generates supplemental data for a candidate based on their resume information.
 *
 * This function uses the OpenAI API to infer additional candidate data, including soft skills, potential roles, and a concise introduction. The inferred data is then saved to the Supabase database.
 *
 * @param updatedResumeData - The candidate's updated resume data.
 * @param candidateId - The ID of the candidate.
 * @returns The inferred data, including soft skills, potential roles, and a candidate introduction.
 */

export async function generateSupplementalData(
  updatedResumeData: any,
  candidateId: string
) {
  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const supabase = createClient(cookies());

  const jsonSchema = zodToJsonSchema(
    extendedInferredSchema,
    "ExtendedInferredSchema"
  );

  try {
    const systemPrompt = `You are an AI assistant tasked with inferring additional candidate data based on their resume information. Your job is to:

    1. Review the candidate's past experience, jobs, and skills.
    2. Infer soft skills they likely possess based on their work history.
    3. Suggest potential roles they would be a good fit for based on their experience and skills.
    4. Generate a concise and effective introduction for the candidate.

    Use the provided Candidate Resume to generate a JSON output with the following structure:

    {
      "soft_skills": [
        "Skill 1",
        "Skill 2",
        ...
      ],
      "potential_roles": [
        "Role 1",
        "Role 2",
        ...
      ],
      "intro": "A concise and effective introduction for the candidate..."
    }

    Important: 
    - Limit soft_skills to a maximum of 10 items and potential_roles to a maximum of 7 items, prioritizing the most relevant and significant ones.
    - The intro should be a paragraph of about 3-4 sentences, highlighting the candidate's key strengths and experience written in first person as if from the candidate's perspective.
    - Ensure your response is in valid JSON format and includes only the requested fields.`;

    const userPrompt = `<CandidateResume>
    ${JSON.stringify(updatedResumeData, null, 2)}
    </CandidateResume>
    `;

    const inferredData = await togetherai.chat.completions.create({
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

    const inferredOutput = JSON.parse(inferredData.choices[0].message.content!);

    // Save output to Supabase inferred table
    const { error: updateError } = await supabase
      .from("candidate_create")
      .update({
        inferred: {
          soft_skills: inferredOutput.soft_skills,
          potential_roles: inferredOutput.potential_roles,
        },
      })
      .eq("user", candidateId);

    if (updateError) {
      console.error("Error updating inferred data in Supabase:", updateError);
      throw new Error("Failed to save inferred data to database.");
    }

    // // Save output to Supabase modified_static table
    const modifiedStaticData = {
      ...updatedResumeData,
      intro:
        inferredOutput.intro ||
        updatedResumeData.intro ||
        "No introduction available.",
    };

    const { error: modifiedStaticError } = await supabase
      .from("candidate_create")
      .update({
        modified_static: modifiedStaticData,
      })
      .eq("user", candidateId);

    if (modifiedStaticError) {
      console.error(
        "Error updating modified_static data in candidate_create table:",
        modifiedStaticError
      );
      throw new Error("Failed to save modified_static data to database.");
    }

    return inferredOutput;
  } catch (error) {
    console.error("Error in generating inferred data:", error);
    throw new Error("Failed to generate supplemental candidate data.");
  }
}
