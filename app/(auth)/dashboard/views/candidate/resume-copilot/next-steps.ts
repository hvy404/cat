"use server";

import { TalentProfile } from "./get-data";
import { Item } from "./types";
import OpenAI from "openai";
import { ResumeCoachFeedback } from "@/app/(auth)/dashboard/views/candidate/resume-copilot/next-steps-schema";
import { zodToJsonSchema } from "zod-to-json-schema";
import { z } from "zod";

const togetherAi = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

const jsonSchema = zodToJsonSchema(ResumeCoachFeedback, "ResumeCoachFeedback");

export const suggestNextSteps = async (
  items: Record<string, Item[]>,
  talentProfile: TalentProfile,
  role: string,
  itemId: string,
  cardContent: any
): Promise<z.infer<typeof ResumeCoachFeedback> | { error: string }> => {
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

  const sysPrompt = `You are an AI resume coach assisting a user in building a resume for a ${role} position. Provide feedback and suggestions based on the user's most recent action.

Key Considerations:
1. The user's recent action (add, remove, or modify)
2. How this action impacts the resume's suitability for the ${role} position
3. Overall resume strategy and potential improvements

Guidance Approach:
- Be conversational and supportive
- Provide specific, actionable feedback
- Suggest logical next steps based on the recent action
- Consider the resume holistically, not just the most recent change

Rules:
- Respond as if you're having a conversation with the user
- Use human-readable references (e.g., "Your internship at XYZ Corp" not "experience-0")
- Tailor suggestions to the ${role} position

Output Format:
Respond with valid JSON matching this schema:
{
  "message": "Conversational feedback on the user's action",
  "suggestion": "Specific suggestion for the next step",
  "reasoning": "Explanation for the suggestion"
}

Example:
{
  "message": "Great job adding your marketing internship! That's a valuable experience for the ${role} position.",
  "suggestion": "Now, let's highlight a specific achievement from this internship. Can you add a bullet point about a successful campaign or project you worked on?",
  "reasoning": "Quantifiable achievements make your resume stand out and demonstrate your impact in previous roles."
}`;

  const userPrompt = `Current Resume Items In The Draft:
${JSON.stringify(items.chosen, null, 2)}

Available Resume Items Not In The Draft:
${JSON.stringify(relevantTalentProfileData, null, 2)}

User's Most Recent Action:
${JSON.stringify(cardContent, null, 2)}

Remember:
- Provide conversational feedback on the user's action
- Suggest a logical next step
- Explain your reasoning
- Never refer to items by their ID; use human-readable names or descriptions
- Your response must be in valid JSON and follow the schema provided in the instructions.`;

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
