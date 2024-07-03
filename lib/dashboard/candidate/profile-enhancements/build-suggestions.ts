import {
  getTalentNodeNoEmbedding,
  TalentNode,
} from "@/lib/candidate/global/mutation";

// Interface for the structured suggestion
export interface Suggestion {
  title: string;
  type: string;
  message: string;
  fields: string[];
  priority: "high" | "medium" | "low";
}

export function generateSuggestions(talentNodeData: TalentNode): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Helper function to check multiple fields
  const checkFields = (
    fields: string[],
    type: string,
    title: string,
    messageFunc: (missing: string[]) => string,
    priority: "high" | "medium" | "low"
  ): void => {
    const missingFields = fields.filter(
      (field) => !talentNodeData[field as keyof TalentNode]
    );
    if (missingFields.length > 0) {
      suggestions.push({
        title,
        type,
        message: messageFunc(missingFields),
        fields: missingFields,
        priority,
      });
    }
  };

  // Check location information
  checkFields(
    ["city", "state", "zipcode"],
    "location",
    "Complete Your Location",
    (missing) =>
      `Your ${missing.join(" and ")} ${
        missing.length > 1 ? "are" : "is"
      } missing. Complete location information helps employers find you more easily.`,
    "high"
  );

  // Special case: city and state missing but zip is present
  if (!talentNodeData.city && !talentNodeData.state && talentNodeData.zipcode) {
    suggestions.push({
      title: "Add City and State",
      type: "location",
      message:
        "Your city and state are missing. We can derive this from your zipcode, but it's best to provide this information directly for accuracy.",
      fields: ["city", "state"],
      priority: "high",
    });
  }

  // Check contact information
  checkFields(
    ["phone", "email"],
    "contact",
    "Update Contact Information",
    (missing) =>
      `Your ${missing.join(" and ")} ${
        missing.length > 1 ? "are" : "is"
      } missing. Complete contact information allows employers to reach you easily.`,
    "high"
  );

  // Check job-related information
  checkFields(
    ["title", "company"],
    "job",
    "Complete Job Details",
    (missing) =>
      `Your ${missing.join(" and ")} ${
        missing.length > 1 ? "are" : "is"
      } missing. This information helps showcase your experience.`,
    "medium"
  );

  // Check clearance level
  if (!talentNodeData.clearance_level) {
    suggestions.push({
      title: "Add Security Clearance",
      type: "security",
      message:
        "If you have any security clearance, adding this information can open up more opportunities in relevant fields.",
      fields: ["clearance_level"],
      priority: "low",
    });
  }

  // Check for active looking status
  if (!talentNodeData.active_looking) {
    suggestions.push({
      title: "Confirm Job Search Status",
      type: "status",
      message:
        "Updating your 'actively looking' status helps us match you with the right opportunities. Please indicate if you're currently seeking new positions.",
      fields: ["active_looking"],
      priority: "medium",
    });
  }

  return suggestions;
}

interface FetchBuildEnhancementsProps {
  candidateId: string;
}

export async function FetchBuildEnhancements({
  candidateId,
}: FetchBuildEnhancementsProps): Promise<Suggestion[]> {
  try {
    console.log("Fetching talent node...", candidateId);
    const talentNodeData = await getTalentNodeNoEmbedding(candidateId);

    if (talentNodeData === null) {
      return [
        {
          title: "Error Fetching Profile",
          type: "error",
          message: "Unable to fetch your profile data. Please try again later.",
          fields: [],
          priority: "high",
        },
      ];
    }

    console.log(generateSuggestions(talentNodeData));

    return generateSuggestions(talentNodeData);
  } catch (error) {
    console.error(error);
    return [
      {
        title: "Error Occurred",
        type: "error",
        message:
          "An error occurred while fetching your profile data. Please try again later.",
        fields: [],
        priority: "high",
      },
    ];
  }
}
