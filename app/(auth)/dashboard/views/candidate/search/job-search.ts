"use server";
import { generateEmbeddings } from "@/lib/llm/generate-embeddings";
import { contentModerationWordFilter } from "@/lib/content-moderation/explicit_word_filter";
import { findSimilarJobs, DetailedJobResult } from "./job-utils";
import { Integer } from 'neo4j-driver';

// Utility function to ensure all data is serializable
function ensureSerializable(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (typeof obj !== 'object') {
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
    } else if (typeof value === 'bigint') {
      result[key] = Number(value);
    } else if (typeof value === 'function') {
      continue; // Skip functions
    } else if (Integer.isInteger(value)) {
      result[key] = value.toNumber();
    } else if (typeof value === 'object') {
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
};

export async function jobSearchHandler(mainSearchQuery: string): Promise<JobSearchResult | { match: false; socket: true }> {
  // Validate the mainSearchQuery
  const isValid = /^(?=.*[a-zA-Z0-9])(?:(?:\s|[a-zA-Z0-9])+)$/.test(mainSearchQuery);
  if (!isValid) {
    return {
      match: false,
      similarJobs: [],
    };
  }

  // Check for explicit content in the main search query
  const explicitContent = await contentModerationWordFilter(mainSearchQuery);
  if (explicitContent) {
    return {
      match: false,
      socket: true,
    };
  }

  try {
    const buildQuery = `I am looking for a job as a ${mainSearchQuery}`;
    const embeddings = await generateEmbeddings(buildQuery);
    const threshold = 0.515;
    const similarJobs = await findSimilarJobs(embeddings, threshold);

    // Ensure all job data is serializable
    const serializableJobs = similarJobs.map(job => ensureSerializable(job));

    return {
      match: serializableJobs.length > 0,
      similarJobs: serializableJobs,
    };
  } catch (error) {
    console.error("Error in jobSearchHandler:", error);
    throw error;
  }
}