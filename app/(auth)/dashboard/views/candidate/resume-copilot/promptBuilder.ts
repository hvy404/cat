import { TalentProfile } from "./get-data";
import { Item } from "./types";

interface HistoryEntry {
  action: "add" | "remove" | "reorder";
  itemId: string;
  timestamp: number;
}

export const buildAndLogPrompt = (
  items: Record<string, Item[]>,
  history: HistoryEntry[], // Changed from lastHistoryEntry to history
  talentProfile: TalentProfile
) => {
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
  const prompt = `You are an AI resume coach assisting in building a resume for a Senior Data Scientist role.

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
}

Current Resume Items:
${JSON.stringify(items.preview, null, 2)}

Last 5 Actions:
${JSON.stringify(lastFiveHistory, null, 2)}

Available Items:
${JSON.stringify(relevantTalentProfileData, null, 2)}`;

  // Log the prompt
  console.log("Generated Prompt:");
  console.log(prompt);

  // In the future, you can replace this with an actual API call to your LLM
  // For now, we're just logging the prompt
};
