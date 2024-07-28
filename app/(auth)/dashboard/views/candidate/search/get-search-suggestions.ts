"use server";

import getFetchSuggestionRoles from "@/app/(auth)/dashboard/views/candidate/resume-copilot/role-suggestions";
import OpenAI from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { initializeRedis } from "@/lib/redis/connect"; // upstash/redis client

export async function BuildSearchRoles(userId: string) {
  const redis = initializeRedis();
  const cacheKey = `search-suggestions:${userId}`;
  
  // Check cache first
  const cachedResult = await redis.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  const togetherai = new OpenAI({
    apiKey: process.env.TOGETHER_API_KEY,
    baseURL: "https://api.together.xyz/v1",
  });

  const MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";

  const additionalRolesSchema = z.object({
    additionalRolesDetected: z
      .array(z.string())
      .describe("similar career roles"),
  });

  const jsonSchema = zodToJsonSchema(additionalRolesSchema, "additionalRoles");

  const { potentialRoles, status, message } = await getFetchSuggestionRoles(
    userId
  );

  const listOfCandidateRoles = potentialRoles || [];

  let result;

  if (status === "success" && listOfCandidateRoles.length > 0) {
    try {
      const extract = await togetherai.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "The following is a list of roles suitable for a job seeking candidate. Your task to list up to ten additional roles that may be relevant. Only answer in JSON.",
          },
          {
            role: "user",
            content: listOfCandidateRoles.join(", "),
          },
        ],
        model: MODEL,
        // @ts-ignore
        response_format: { type: "json_object", schema: jsonSchema },
      });

      const content = extract.choices[0].message.content;
      if (content === null) {
        throw new Error("Received null content from API");
      }
      const additionalRoles = JSON.parse(content);
      const combinedRoles = Array.from(
        new Set([
          ...listOfCandidateRoles,
          ...additionalRoles.additionalRolesDetected,
        ])
      );

      result = {
        roles: combinedRoles,
        status: "success",
      };
    } catch (error) {
      console.error("Error in LLM call:", error);
      result = {
        roles: listOfCandidateRoles,
        status: "partial_success",
        message:
          "Retrieved initial roles, but failed to get additional suggestions",
      };
    }
  } else {
    // Handle different statuses
    switch (status) {
      case "success":
        result = {
          roles: listOfCandidateRoles,
          status: "success",
        };
        break;
      case "empty":
        result = {
          roles: [],
          status: "empty",
          message: message || "No potential roles found",
        };
        break;
      case "error":
      default:
        result = {
          roles: [],
          status: "error",
          message: message || "An error occurred while fetching roles",
        };
    }
  }

  // Store the result in cache for 7 days
  await redis.set(cacheKey, JSON.stringify(result), { ex: 7 * 24 * 60 * 60 });

  return result;
}