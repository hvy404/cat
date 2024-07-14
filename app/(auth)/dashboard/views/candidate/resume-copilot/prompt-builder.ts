"use server";

import { TalentProfile } from "./get-data"; // Import type
import { Item } from "./types";
import OpenAI from "openai";

interface HistoryEntry {
  action: "add" | "remove" | "reorder | modify";
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
  recentEdit: string;
  nextAction: "add" | "remove" | "modify" | "none";
  nextItem: string;
  nextReason: string;
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
  const sysPrompt = `You are an AI resume coach assisting in building a resume for a ${role} role. Your task is to analyze the most recent edit to the resume and recommend the next action to improve it.

Instructions:
Carefully review the most recent edit to the resume.
Analyze how this edit affects the overall quality and relevance of the resume for the ${role} position.
Recommend ONE of the following actions:
a) Remove an existing item
b) Add a new item from the Available Talent Resume Items
c) Modify an existing item
d) No action needed (suggest that the user is on the right track and you have no specific recommendations at this time)

Rules:
Make only one suggestion per response.
Ensure your suggestion directly relates to the most recent edit.

IMPORTANT: Always refer to items by their human-readable name or reference:
Experiences: Use the job title (e.g., "VP, Software Engineer" instead of "experience-0")
Education: Use the degree name (e.g., "Master of Sociology" instead of "education-0")
Personal information: Use the key (e.g., "phone" instead of "personal-0")
Skills: Use "Skills section"
Certifications: Use the certification name
Projects: Use the project name
Publications: Use the publication title

Output Format:
Respond ONLY with valid JSON matching this schema:

{
  "recentEdit": "Detailed evaluation of the recent edit and its impact on the resume",
  "nextAction": "add" | "remove" | "modify" | "none",
  "nextItem": "Human-readable name or reference of the item to be acted upon",
  "nextReason": "Concise explanation for the recommended action, focusing on its relevance to the ${role} position and overall resume improvement"
}
  
Response Guidelines

recentEdit: Provide a thorough analysis of the most recent change, including its relevance to the ${role} and its effect on the resume's overall strength.
nextAction: Choose the most appropriate action based on your analysis. Use "none" only if the resume is truly optimal for the ${role}.
nextItem: Be specific and use the human-readable name or reference as instructed above.
nextReason: Explain your recommendation concisely, focusing on how it enhances the resume for the ${role} position. Consider factors such as relevance, impact, and overall resume balance.

Remember: Your goal is to help create a targeted, impactful resume for the ${role} position. Each recommendation should move the resume closer to this goal.`;

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
            recentEdit: string;
            nextAction: "add" | "remove" | "modify" | "none";
            nextItem: string;
            nextReason: string;
          };
    
          if (
            typeof parsedResponse === "object" &&
            parsedResponse !== null &&
            "recentEdit" in parsedResponse &&
            "nextAction" in parsedResponse &&
            "nextItem" in parsedResponse &&
            "nextReason" in parsedResponse &&
            typeof parsedResponse.recentEdit === "string" &&
            typeof parsedResponse.nextAction === "string" &&
            typeof parsedResponse.nextItem === "string" &&
            typeof parsedResponse.nextReason === "string"
          ) {
            // Transform to expected format
            return {
              recentEdit: parsedResponse.recentEdit,
              nextAction: parsedResponse.nextAction,
              nextItem: parsedResponse.nextItem,
              nextReason: parsedResponse.nextReason,
            };
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
        `Error calling AI (Attempt ${retries + 1}/${MAX_RETRIES}):`,
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
