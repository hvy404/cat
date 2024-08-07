"use server";
import { generateEmbeddings } from "@/lib/llm/generate-embeddings";
import { contentModerationWordFilter } from "@/lib/content-moderation/explicit_word_filter";
import { findSimilarJobs } from "./job-utils";
import { Integer } from "neo4j-driver";
import { jobSearchCache, getCache, setCache } from "./cache";

// Utility function to ensure all data is serializable
function ensureSerializable(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(ensureSerializable);
  }
  if (Integer.isInteger(obj)) {
    return obj.toNumber();
  }
  const result: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      result[key] = value.toISOString();
    } else if (typeof value === "bigint") {
      result[key] = Number(value);
    } else if (typeof value === "function") {
      continue; // Skip functions
    } else if (Integer.isInteger(value)) {
      result[key] = value.toNumber();
    } else if (typeof value === "object") {
      result[key] = ensureSerializable(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export type SerializableJobResult = ReturnType<typeof ensureSerializable>;

export type JobSearchResult = {
  match: boolean;
  similarJobs: SerializableJobResult[];
  flag?: {
    threshold: number;
    mode: string;
  };
};

export async function jobSearchHandler(
  mainSearchQuery: string,
  userId: string
): Promise<JobSearchResult | { match: false; socket: true }> {
  let threshold = 0.725; // Default threshold
  let cleanedSearchQuery = mainSearchQuery;
  let mode = "";

  // Check for easter eggs
  switch (true) {
    case mainSearchQuery.includes("!wildwest"):
      console.log("Yeehaw! 🤠");
      threshold = 0.5;
      mode = "wildwest";
      cleanedSearchQuery = mainSearchQuery.replace("!wildwest", "").trim();
      break;
    case mainSearchQuery.includes("!cyberpunk"):
      console.log("Welcome to Night City! 🌃");
      threshold = 0.6;
      cleanedSearchQuery = mainSearchQuery.replace("!cyberpunk", "").trim();
      break;
    case mainSearchQuery.includes("!space"):
      console.log("To infinity and beyond! 🚀");
      threshold = 0.55;
      cleanedSearchQuery = mainSearchQuery.replace("!space", "").trim();
      break;
    // Add more easter eggs here as needed
    default:
      // No easter egg found, use default threshold and don't modify the query
      break;
  }

  // Validate the cleaned search query
  const isValid = /^(?=.*[a-zA-Z0-9])(?:(?:\s|[a-zA-Z0-9])+)$/.test(
    cleanedSearchQuery
  );
  if (!isValid) {
    return {
      match: false,
      similarJobs: [],
    };
  }

  // Check for explicit content in the cleaned search query
  const explicitContent = await contentModerationWordFilter(cleanedSearchQuery);
  if (explicitContent) {
    return {
      match: false,
      socket: true,
    };
  }

  try {
    // Check cache first
    const cachedResults = await getCache({
      userId,
      searchQuery: cleanedSearchQuery,
    });
    if (cachedResults) {
      return {
        match: cachedResults.length > 0,
        similarJobs: cachedResults,
      };
    }

    // If not in cache, perform the search
    const buildQuery = `I am seeking to apply for a job as a ${cleanedSearchQuery}. I have experience in this field. ${cleanedSearchQuery} may be the opportunity's title or its alternative role names.`;
    const embeddings = await generateEmbeddings(buildQuery);

    const similarJobs = await findSimilarJobs(embeddings, threshold);

    console.log("job-search.ts", similarJobs);

    // Ensure all job data is serializable
    const serializableJobs = similarJobs.map((job) => ensureSerializable(job));

    // Cache the results
    await setCache({
      userId,
      searchQuery: cleanedSearchQuery,
      searchResults: serializableJobs,
    });

    return {
      match: serializableJobs.length > 0,
      similarJobs: serializableJobs,
      // if easteregg is found, return the threshold and cleaned query
      flag: {
        threshold,
        mode,
      },
    };
  } catch (error) {
    console.error("Error in jobSearchHandler:", error);
    throw error;
  }
}
