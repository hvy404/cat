"use server";

import OpenAI from "openai";
import {
  getTalentWorkExperiences,
  getTalentSkills,
  getTalentPotentialRoles,
  WorkExperienceNode,
  SkillNode,
  RoleNode,
  NodeWithId,
} from "@/lib/candidate/global/mutation";

export interface TalentRelationships {
  workExperiences: (WorkExperienceNode & NodeWithId)[];
  skills: (SkillNode & NodeWithId)[];
  potentialRoles: (RoleNode & NodeWithId)[];
}

const openai = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY || "",
  baseURL: "https://api.together.xyz/v1",
});

export async function fetchTalentRelationships(
  candidateId: string
): Promise<TalentRelationships> {
  try {
    const [workExperiences, skills, potentialRoles] = await Promise.all([
      getTalentWorkExperiences(candidateId),
      getTalentSkills(candidateId),
      getTalentPotentialRoles(candidateId),
    ]);

    return {
      workExperiences,
      skills,
      potentialRoles,
    };
  } catch (error) {
    console.error(
      `Error fetching relationships for candidate ${candidateId}:`,
      error
    );
    throw error;
  }
}

export async function analyzeTalentRelationships(
  relationships: TalentRelationships
): Promise<string | null> {
  try {
    const prompt = `Work Experiences:
  ${relationships.workExperiences
    .map(
      (we) =>
        `- ID: ${we._id}, Job Title: ${we.job_title}, Organization: ${we.organization}, Responsibilities: ${we.responsibilities}`
    )
    .join("\n")}
  
  Potential Roles:
  ${relationships.potentialRoles
    .map((r) => `- ID: ${r._id}, Role: ${r.name}`)
    .join("\n")}
  
The "Work Experiences" section contains information directly extracted from the candidate's resume. Your task is to provide comments and actionable recommendations to enhance the strength of this section within the resume.

The "Potential Roles" are roles we've inferred based on the candidate's overall profile. While these roles can inform your suggestions, they should not be treated as strict requirements or the primary basis for your analysis. Your focus should be on improving the presentation and content of the work experiences as they appear in the resume. 

Please analyze the work experiences, considering how they could be better articulated or expanded to showcase the candidate's skills and achievements more effectively. Your recommendations should aim to make the resume stronger and more appealing to potential employers, regardless of the inferred potential roles. Ignore the order and formatting of the work experiences in the prompt. The "Overall Recommendations
" section should provide general advice of wording the responsibilities and achievements in the work experiences and not about formatting, order, or structure of the resume.

Please provide your analysis in the following JSON format. Include comments, recommendations, and a suggested change for each work experience, and provide overall recommendations for the entire work experience section. The 'example' field is optional and should only be included when relevant. Do not include any text outside of this JSON structure in your response.
  
{
  "workExperiences": [
    {
      "id": "string",
      "comment": "string",
      "recommendation": "string",
      "suggestedChange": "string",
      "example": "string (optional)"
    }
  ],
  "overallRecommendations": [
    "string"
  ]
}
  
It is imperative not to include any text outside of this JSON structure in your response.`;

    const response = await openai.chat.completions.create({
      model: "meta-llama/Llama-3-70b-chat-hf",
      messages: [
        {
          role: "system",
          content:
            "You are a professional, friendly and helpful resume consultant.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 5000,
      temperature: 0.6,
    });

    return response.choices[0]?.message?.content ?? null;
  } catch (error) {
    console.error("Error analyzing talent relationships:", error);
    return null;
  }
}

export async function fetchAndAnalyzeTalent(
  candidateId: string
): Promise<string | null> {
  try {
    const relationships = await fetchTalentRelationships(candidateId);
    const analysis = await analyzeTalentRelationships(relationships);

    //console.log("Analysis for candidate", candidateId, ":", analysis);
    return analysis;
  } catch (error) {
    console.error(
      `Error in fetching and analyzing talent for candidate ${candidateId}:`,
      error
    );
    return null; // Return null instead of throwing an error
  }
}
