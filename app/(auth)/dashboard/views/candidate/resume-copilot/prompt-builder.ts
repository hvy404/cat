"use server";

import { TalentProfile } from "./get-data";
import { Item } from "./types";
import OpenAI from "openai";
import { ResumeCoachSchema } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/resume-coach-schema";
import { zodToJsonSchema } from "zod-to-json-schema";

const togetherAi = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

const jsonSchema = zodToJsonSchema(ResumeCoachSchema, "ResumeCoachSchema");

export const buildEditReview = async (
  items: Record<string, Item[]>,
  talentProfile: TalentProfile,
  role: string,
  itemId: string,
  cardContent: any
): Promise<
  | {
      recommendation: {
        priority: "High" | "Medium" | "Low";
        action: "add" | "remove" | "modify" | "none";
        targetItem: string;
        rationale: string;
        implementation: string;
      };
    }
  | { error: string }
> => {
  const findTalentProfileData = (item: Item): any => {
    const [type, indexStr] = item.id.split("-");
    const index = parseInt(indexStr, 10);

    switch (type) {
      case "personal":
        return item.content;
      case "experience":
        return talentProfile.workExperiences[index];
      case "education":
        return talentProfile.education[index];
      case "skills":
        return { skills: talentProfile.skills };
      case "certification":
        return talentProfile.certifications[index];
      case "project":
        return talentProfile.projects[index];
      case "publication":
        return talentProfile.publications[index];
      default:
        return null;
    }
  };

  const relevantTalentProfileData = items.available.reduce((acc, item) => {
    const data = findTalentProfileData(item);
    if (data) {
      acc[item.id] = data;
    }
    return acc;
  }, {} as Record<string, any>);

  const sysPrompt = `You are an AI resume coach optimizing a resume for a ${role} position. Your task is to evaluate the most recent edit to the resume, analyzing its impact the ${role} position.

Instructions:
1. Analyze how this edit affects the overall quality and relevance of the resume for the ${role} position.
2. Suggestion any modifications to the recent edit's content.

Consider the following optimization strategies:
   - Relevance of experiences to the ${role}
   - Focus on quantifiable descriptions of skills and achievements
   - Potential time gaps and skill gaps
   - Overall career narrative and progression
   - Demonstration of transferable skills

Rules:
- Ensure your suggestion directly relates to the most recent edit and the overall resume strategy.
- Give specific instructions on what to edit, add or remove while maintaining a supportive tone.
- Be specific and actionable in your recommendations.
- Maintain a friendly, supportive tone focused on the user's success.

Respond ONLY with valid JSON.

Output Format:

{
  "recommendation": {
    "action": "add" | "remove" | "modify" | "none",
    "priority": "High" | "Medium" | "Low",
    "targetItem": "Human-readable name or reference of the item to be acted upon",
    "rationale": "Explanation for the recommended action, focusing on relevance to the target role and overall resume improvement",
    "implementation": "Specific suggestions on how to carry out the recommended action"
  }
}

Remember: Your goal is to help create a targeted, impactful resume for the ${role} position. Each recommendation should move the resume closer to this goal, considering both immediate improvements and long-term strategy.`;

  const userPrompt = `Current Resume Items:
${JSON.stringify(items.chosen, null, 2)}

Available Resume Items:
${JSON.stringify(relevantTalentProfileData, null, 2)}

Most recent edit's content:
${JSON.stringify(cardContent, null, 2)}

In your resppnse:
- You must never refer to an object by their ID (e.g. "experience-, experience-, skills-, education-, personal-"), instead use a human-readable name or reference from that object.
- Your response must be in valid JSON and follows the schema provided in the instructions above.`;

  const response = await togetherAi.chat.completions.create({
    model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    // @ts-ignore
    response_format: { type: "json_object", schema: jsonSchema },
    messages: [
      {
        role: "system",
        content: sysPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  if (response?.choices?.[0]?.message?.content) {
    const output = JSON.parse(response?.choices?.[0]?.message?.content);
    return output;
  }
  return { error: "There was an error. Please try again." };
};
