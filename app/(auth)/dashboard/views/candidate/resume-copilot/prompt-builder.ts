"use server";

import { TalentProfile } from "./get-data"; // Import type
import { Item } from "./types";
import OpenAI from "openai";

interface HistoryEntry {
  action: "add" | "remove" | "reorder";
  itemId: string;
  timestamp: number;
}

const togetherAi = new OpenAI({
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

// Utility function to check if a string is valid JSON
const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Simple in-memory tracking (Note: This will reset on server restart)
let totalCalls = 0;
let invalidJsonResponses = 0;

const MAX_RETRIES = 3;

export const buildAndLogPrompt = async (
  items: Record<string, Item[]>,
  history: HistoryEntry[],
  talentProfile: TalentProfile,
  role: string
): Promise<{
  action: "add" | "remove" | "modify";
  item: string;
  reason: string;
} | null> => {
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

  // Build the relevant talent profile data
  const relevantTalentProfileData = items.available.reduce((acc, item) => {
    const data = findTalentProfileData(item);
    if (data) {
      acc[item.id] = data;
    }
    return acc;
  }, {} as Record<string, any>);

  // Get the last 5 history entries
  const lastFiveHistory = history.slice(-5).reverse();

  // Build the prompt
  const sysPrompt = `You are an AI resume coach assisting in building a resume for a ${role} role.

Instructions:
Analyze the most recent edit to the resume.
Recommend one of the following actions:
a) Remove an existing item
b) Add a new item from the Available Talent Resume Items
c) Modify an existing item
Provide a brief, specific reason for your recommendation.

Rules:
Make only one suggestion per response.
Ensure your suggestion directly relates to the most recent edit.

IMPORTANT: Always refer to items by their human-readable name or reference:

For experiences, use the job title (e.g., "VP, Software Engineer" instead of "experience-0")
For education, use the degree name (e.g., "Master of Sociology" instead of "education-0")
For personal information, use the key (e.g., "phone" instead of "personal-0")
For skills, use "Skills section"
For certifications, use the certification name

Output Format:
Respond only with valid JSON matching this schema:

{
  "action": "add" | "remove" | "modify",
  "item": "ID of item or reference",
  "reason": "concise explanation"
}`;

  const userPrompt = `Current Resume Items:
${JSON.stringify(items.preview, null, 2)}

Last 5 Actions:
${JSON.stringify(lastFiveHistory, null, 2)}

Available Items:
${JSON.stringify(relevantTalentProfileData, null, 2)}`;

  totalCalls++;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await togetherAi.chat.completions.create({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
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
        max_tokens: 1200,
      });

      const aiResponse = response.choices[0].message.content;
      console.log("AI Response:", aiResponse);

      if (typeof aiResponse === "string" && isValidJson(aiResponse)) {
        try {
          const parsedResponse = JSON.parse(aiResponse) as {
            action: "add" | "remove" | "modify";
            item: string;
            reason: string;
          };

          if (
            typeof parsedResponse === "object" &&
            parsedResponse !== null &&
            "action" in parsedResponse &&
            "item" in parsedResponse &&
            "reason" in parsedResponse &&
            typeof parsedResponse.action === "string" &&
            typeof parsedResponse.item === "string" &&
            typeof parsedResponse.reason === "string"
          ) {
            return parsedResponse;
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
        }
      }

      invalidJsonResponses++;
      console.error(
        `Invalid JSON response (Attempt ${retries + 1}/${MAX_RETRIES})`
      );
      retries++;
    } catch (error) {
      console.error(
        `Error calling AI (Attempt ${
          retries + 1
        }/${MAX_RETRIES}):`,
        error
      );
      retries++;
    }
  }

  console.error(`Failed to get valid response after ${MAX_RETRIES} attempts`);
  return null;
};

// Function to get current stats (can be called from another server action or API route)
export const getStats = async () => {
  return { totalCalls, invalidJsonResponses };
};
